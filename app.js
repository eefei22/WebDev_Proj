const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI); 

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3003;

// Set up mongoose connection
mongoose.connect(process.env.MONGO_URI, {useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', routes); // Use index routes
app.use('/', signup_routes); // Use signup routes
app.use('/', login_routes); // Use login routes
app.use('/', profile_routes); // Use profile routes

// Real-time chat functionality
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

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

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
