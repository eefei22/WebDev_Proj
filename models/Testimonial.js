const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    description: { type: String, required: true },
    name: { type: String, required: true },
    image_path: { type: String, required: true }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);