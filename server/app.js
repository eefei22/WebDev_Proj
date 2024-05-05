
// server/index.js
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the 'html' directory
app.use(express.static(path.join(__dirname, '../html')));

// Serve static files from the 'css' directory
app.use('/css', express.static(path.join(__dirname, '../css')));

// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, '../images')));

// Serve static files from the 'scripts' directory
app.use('/scripts', express.static(path.join(__dirname, '../scripts')));

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
