const mongoose = require('mongoose');

// models/Post.js
const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    caption: { type: String },
    media: [
        {
            type: {
                type: String,
                enum: ['image', 'video'],
                required: true,
            },
            url: { type: String, required: true },
        },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public',
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
