const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIO = require('socket.io');
const sharedsession = require('socket.io-express-session');
const cors = require('cors');
const multer = require('multer');

const routes = require('./routes/index'); 
const signup_routes = require('./routes/signup'); 
const login_routes = require('./routes/login'); 
const profile_routes = require('./routes/profile'); // Re-include profile routes
const nav_routes = require('./routes/nav');
const chatRouter = require('./routes/chat');
const paymentRoute = require('./routes/paymentRoute');
//const cartRoute = require('./routes/cartRoute');
const ChatMessage = require('./models/ChatMessage');

dotenv.config();
const app = express();
const port = process.env.PORT || 3003;

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'secret_key', // session storage secret key
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false } // Use true if you're serving over HTTPS
});

app.use(sessionMiddleware);

app.use((req, res, next) => {
    console.log('Session ID:', req.session.id);
    console.log('Session UserID:', req.session.userId);
    next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3003'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

//payment
app.use(express.json({
    verify: (req, res, buf) => {
        if (req.originalUrl.startsWith('/webhook')) {
            req.rawBody = buf.toString();
        }
    }
})); 

app.use('/', routes);
app.use('/', signup_routes);
app.use('/', login_routes);
app.use('/', profile_routes); // Re-include profile routes
app.use('/', nav_routes);
app.use('/', chatRouter);
app.use('/', paymentRoute);
//app.use('/', cartRoute);

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

    socket.on('chat message', async ({ username, message }) => {
        try {
            const name = socket.handshake.query.name; // Assume name is passed as a query param
            const newChat = new Chat({
                name: name, // Assuming 'name' is the name
                username,
                message,
                timestamp: new Date()
            });

            await newChat.save();
            io.emit('chat message', { username, message, timestamp: new Date() }); // Emit to all connected clients
        } catch (error) {
            console.error(error);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
