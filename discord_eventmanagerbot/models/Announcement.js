const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    authorUsername: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d' // This will automatically delete documents after 7 days
    }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
