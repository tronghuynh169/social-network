const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
    }, // Người nhận
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" }, // Ai gửi (nếu có)
    type: { type: String, required: true }, // VD: "message", "like", "group"
    content: { type: String },
    data: { type: Object }, // Dữ liệu bổ sung (VD: id tin nhắn, nhóm,...)
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
