const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const routes = require('./routes/index'); //Import index routes
const signup_routes = require('./routes/signup'); // Import signup routes
const login_routes = require('./routes/login'); // Import login routes
const profile_routes = require('./routes/profile'); // Include profile routes


dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI); 

const app = express();
const port = process.env.PORT || 3003;

// Set up mongoose connection
mongoose.connect(process.env.MONGO_URI, {useUnifiedTopology: true })
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
