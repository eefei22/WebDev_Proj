const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config(); //must be placed before payment declaration
const routes = require("./routes/index");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const http = require("http");
const socketIO = require("socket.io");
const sharedsession = require("socket.io-express-session");
const cors = require("cors");

const signup_routes = require("./routes/signup");
const login_routes = require("./routes/login");
const profile_routes = require("./routes/profile");
const nav_routes = require("./routes/nav");
const chatRouter = require("./routes/chat");
const inboxRouter = require("./routes/inbox");
const ChatMessage = require("./models/ChatMessage");
const logoutRouter = require('./routes/logout');
//payment
const paymentRoute = require("./routes/paymentRoute.js");
const subscribeRoute = require("./routes/subscribeRoute.js");
const tuitionRoute = require("./routes/tuitionRoute.js");
const cartRoute = require("./routes/cartRoute.js");
const setupCronJobs = require("./jobs/cronJobs.js");
const cartRouteHandler = require("./jobs/cartRouteHandler");
const subscribeRouteHandler = require("./jobs/subscribeRouteHandler");
const bookHandler = require("./jobs/bookHandler");
const tuitionRouteHandler = require("./jobs/tuitionRouteHandler");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const app = express();
const port = process.env.PORT || 3003;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3003",
  process.env.NGROK_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Middleware to set cache control headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});   

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "secret_key",
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: false },
});

app.use(sessionMiddleware);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

//payment
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const rawBody = req.rawBody;

    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log(`Webhook received: ${event.type}`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        if (session.metadata.route === "cart") {
          await cartRouteHandler.handleWebhookEvent(event, res);
        } else if (session.metadata.route === "subscribe") {
          await subscribeRouteHandler.handleWebhookEvent(event, res);
        } else if (session.metadata.route === "book") {
          await bookHandler.handleWebhookEvent(event, res);
        } else if (session.metadata.route === "tuitionFee") {
          await tuitionRouteHandler.handleWebhookEvent(event, res);
        }
      }
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);
setupCronJobs();

app.use("/", routes);
app.use("/", signup_routes);
app.use("/", login_routes);
app.use("/", profile_routes);
app.use("/", nav_routes);
app.use("/", chatRouter);
app.use("/", inboxRouter);
app.use("/", subscribeRoute);
app.use("/", tuitionRoute);
app.use("/", cartRoute);
app.use("/", paymentRoute);
app.use("/logout", logoutRouter);

const server = http.createServer(app);
const io = socketIO(server);

io.use(
  sharedsession(sessionMiddleware, {
    autoSave: true,
  })
);

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on("message", async (data) => {
    console.log("Message received:", data);
    const { tutorId, message } = data;
    const userId = socket.handshake.session.userId;

    const newMessage = new ChatMessage({
      participants: [userId, tutorId],
      sender: userId,
      message: message,
    });

    try {
      await newMessage.save();
      io.emit("chat-message", {
        message: newMessage.message,
        sender: userId,
        dateTime: newMessage.dateTime,
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("chat message", async ({ username, message }) => {
    try {
      const name = socket.handshake.query.name;
      const newChat = new Chat({
        name: name,
        username,
        message,
        timestamp: new Date(),
      });

      await newChat.save();
      io.emit("chat message", { username, message, timestamp: new Date() });
    } catch (error) {
      console.error(error);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
