const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatMessageSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User_signup', required: true }],
  sender: { type: Schema.Types.ObjectId, ref: 'User_signup', required: true },
  message: { type: String, required: true },
  dateTime: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
