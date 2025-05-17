const Notification = require("../models/Notification");

// Lấy tất cả thông báo của user, mới nhất lên đầu
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.query.userId || req.user?._id;
        if (!userId) return res.status(400).json({ message: "Missing userId" });

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate("sender", "fullName avatar");
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// Đánh dấu một thông báo đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!notification)
            return res.status(404).json({ message: "Notification not found" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: "Error marking notification as read" });
    }
};

// Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res) => {
    try {
        let userId = req.query.userId || req.user?._id;

        await Notification.updateMany({ user: userId }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            message: "Error marking all notifications as read",
        });
    }
};

// Xóa một thông báo
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error("❌ Error deleting notification:", error);
        res.status(500).json({ message: "Error deleting notification" });
    }
};
