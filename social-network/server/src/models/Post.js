const mongoose = require('mongoose');

// models/Post.js
const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Sửa thành mảng để lưu nhiều ảnh
    images: [{ type: String }],
    caption: { type: String },
    videos: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public',
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
