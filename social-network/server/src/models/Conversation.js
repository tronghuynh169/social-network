const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        name: { type: String }, // Tên nhóm (tuỳ chọn)
        avatar: { type: String },
        isGroup: { type: Boolean, default: false },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Profile",
            },
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile", // Admin nhóm (tuỳ chọn)
        },
        emoji: { type: String, default: "👍" }, // Default emoji
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
