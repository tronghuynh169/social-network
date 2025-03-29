const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        imageUrl: { type: String, required: true }, // Ảnh bài đăng
        caption: { type: String, default: "" }, // Nội dung bài viết
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người like
        comments: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                text: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
