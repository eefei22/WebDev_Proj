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

const routes = require('./routes/index'); 
const signup_routes = require('./routes/signup'); 
const login_routes = require('./routes/login'); 
const profile_routes = require('./routes/profile');
const nav_routes = require('./routes/nav');
const chatRouter = require('./routes/chat');
const ChatMessage = require('./models/ChatMessage');

dotenv.config();
const app = express();
const port = process.env.PORT || 3003;

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

const sessionMiddleware = session({
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

app.use('/', routes);
app.use('/', signup_routes);
app.use('/', login_routes);
app.use('/', profile_routes);
app.use('/', nav_routes);
app.use('/', chatRouter);

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
