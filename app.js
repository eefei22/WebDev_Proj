const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config(); //must be placed before payment declaration
const multer = require('multer');
const cors = require("cors");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIO = require('socket.io');
const sharedsession = require('socket.io-express-session');

const routes = require('./routes/index'); 
const signup_routes = require('./routes/signup'); 
const login_routes = require('./routes/login'); 
const profile_routes = require('./routes/profile');
const nav_routes = require('./routes/nav');
const chatRouter = require('./routes/chat');
const ChatMessage = require('./models/ChatMessage');

dotenv.config();
const chat_routes = require('./routes/chat');
//payment
const paymentRoute = require("./routes/paymentRoute.js");
const cartRoute = require("./routes/cartRoute.js");
const tuitionRoute = require("./routes/tuitionRoute.js");
const defaultProfilePic = 'public\images\tutor-1-image.png';

console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();
const port = process.env.PORT || 3003;

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));


const sessionMiddleware = session({
    secret: 'secret_key',
//payment
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:3003"];

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

// Use session middleware
app.use(session({
    secret: 'secret_key',  
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false }
});

app.use(sessionMiddleware);

app.use((req, res, next) => {
    console.log('Session ID:', req.session.id);
    console.log('Session UserID:', req.session.userId);
    next();
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to parse URL-encoded and JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use routes
app.use('/', routes); // Use index routes
app.use('/', signup_routes); // Use signup routes
app.use('/', login_routes); // Use login routes
app.use('/', profile_routes); // Use profile routes
app.use('/', nav_routes);
app.use('/', chatRouter);
app.use("/", cartRoute);
app.use("/", tuitionRoute);
app.use("/", paymentRoute);

const server = http.createServer(app);
const io = socketIO(server);

io.use(sharedsession(sessionMiddleware, {
    autoSave: true
}));

io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on('message', async (data) => {
        console.log('Message received:', data);
        const { tutorId, message } = data;
        const userId = socket.handshake.session.userId; // Ensure userId is set in socket session

        const newMessage = new ChatMessage({
            participants: [userId, tutorId],
            sender: userId,
            message: message,
        });

        try {
            await newMessage.save();
            io.emit('chat-message', {
                message: newMessage.message,
                sender: userId,
                dateTime: newMessage.dateTime
            });
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
