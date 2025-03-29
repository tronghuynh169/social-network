const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        imageUrl: { type: String, required: true }, // Ảnh story
        viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Người đã xem
        expiresAt: {
            type: Date,
            default: () => Date.now() + 24 * 60 * 60 * 1000,
        }, // Hết hạn sau 24h
    },
    { timestamps: true }
);

module.exports = mongoose.model("Story", StorySchema);
