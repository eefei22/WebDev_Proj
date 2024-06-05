const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const routes = require('./routes/index'); 
const signup_routes = require('./routes/signup'); 
const login_routes = require('./routes/login'); 
const profile_routes = require('./routes/profile');
const nav_routes = require('./routes/nav');
const chat_routes = require('./routes/chat');

const defaultProfilePic = 'public\images\tutor-1-image.png';

dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();
const port = process.env.PORT || 3003;

// Set up mongoose connection
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Use session middleware
app.use(session({
    secret: 'secret_key',  
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Middleware to log session info for debugging
app.use((req, res, next) => {
    console.log('Session ID:', req.session.id);
    console.log('Session UserID:', req.session.userId);
    next();
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use routes
app.use('/', routes); // Use index routes
app.use('/', signup_routes); // Use signup routes
app.use('/', login_routes); // Use login routes
app.use('/', profile_routes); // Use profile routes
app.use('/', nav_routes);
app.use('/', chat_routes);

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', ({ chatId }) => {
        socket.join(chatId);
        console.log(`User joined chat room: ${chatId}`);
    });

    socket.on('chatMessage', async ({ chatId, senderId, message }) => {
        const chat = await Chat.findById(chatId);
        if (chat) {
            chat.messages.push({ senderId, text: message });
            await chat.save();
            io.to(chatId).emit('message', { senderId, message, timestamp: new Date() });
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});