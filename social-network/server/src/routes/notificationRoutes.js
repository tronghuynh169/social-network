const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middlewares/authMiddleware");

// Lấy danh sách thông báo
router.get("/", auth, notificationController.getUserNotifications);

// Đánh dấu đã đọc một thông báo
router.patch("/:id/read", auth, notificationController.markAsRead);

// Đánh dấu tất cả đã đọc
router.patch("/read/all", auth, notificationController.markAllAsRead);

// Xóa 1 notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
