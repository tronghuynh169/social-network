const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        username: { type: String, unique: true, required: true },
        fullName: { type: String, required: true },
        slug: { type: String, unique: true, required: true },
        bio: { type: String, default: "" }, // Mô tả ngắn
        avatar: { type: String, default: "" }, // Ảnh đại diện
        website: { type: String, default: "" }, // Link website cá nhân
        location: { type: String, default: "" }, // Địa điểm
        gender: {
            type: String,
            enum: ["Nam", "Nữ", "Khác"],
            default: "Khác",
        },
        
        isPrivate: { type: Boolean, default: false }, // Tài khoản riêng tư

        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }], // Người theo dõi
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }], // Đang theo dõi

        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Bài đăng
        savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Bài đăng đã lưu
        stories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }], // Story trong 24h
    },
    { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
