const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    // Optional fields for additional metadata
    read: { type: Boolean, default: false },
    roomId: { type: String } // Useful for grouping messages by a room or chat identifier
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);