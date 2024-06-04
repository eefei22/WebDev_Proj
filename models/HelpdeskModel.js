const mongoose = require('mongoose');

const hdSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the user
    email: { type: String, required: true }, // Email of the user
    message: { type: String, required: true } // Message from the user
})

module.exports = mongoose.model('HelpdeskModel', hdSchema);