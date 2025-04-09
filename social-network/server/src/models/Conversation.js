const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        name: { type: String }, // Tên nhóm (tuỳ chọn)
        isGroup: { type: Boolean, default: false },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Admin nhóm (tuỳ chọn)
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
