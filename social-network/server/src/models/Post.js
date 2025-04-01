const mongoose = require('mongoose');

// models/Post.js
const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Sửa thành mảng để lưu nhiều ảnh
    imageUrls: [{ type: String, required: true }],
    caption: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Thêm like cho comment
            replies: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    },
                    text: { type: String, required: true },
                    createdAt: { type: Date, default: Date.now },
                    likes: [
                        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                    ], // Thêm like cho reply
                },
            ],
        },
    ],
    visibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public',
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
