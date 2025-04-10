const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const mongoose = require("mongoose");

// Tạo cuộc trò chuyện mới
exports.createConversation = async (req, res) => {
    try {
        const { members, isGroup, admin, name, avatar  } = req.body;

        // Kiểm tra members có hợp lệ không
        if (!Array.isArray(members)) {
            return res
                .status(400)
                .json({ message: "Danh sách thành viên không hợp lệ." });
        }

        const sortedMembers = [...members].sort();

        // Ví dụ: tạo cuộc trò chuyện
        const conversation = new Conversation({
            members: sortedMembers,
            isGroup,
            admin,
            name,
            avatar,
        });

        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        console.error("❌ Lỗi tạo conversation:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
    const { conversationId, sender, text } = req.body;
    try {
        const message = await Message.create({
            conversation: conversationId, // 👈 Đổi chỗ này
            sender,
            text,
        });
        res.status(201).json(message);
    } catch (err) {
        console.error("❌ Lỗi khi gửi tin nhắn:", err);
        res.status(500).json({
            error: "Gửi tin nhắn thất bại",
            detail: err.message,
        });
    }
};

// Lấy tin nhắn của 1 cuộc trò chuyện
exports.getMessages = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const messages = await Message.find({
            conversation: conversationId,
        }).sort({
            createdAt: 1,
        });
        res.status(200).json(messages);
    } catch (err) {
        console.error("❌ Lỗi khi lấy tin nhắn:", err);
        res.status(500).json({ error: "Lấy tin nhắn thất bại" });
    }
};

// Lấy các cuộc trò chuyện của user
exports.getUserConversations = async (req, res) => {
    const { userId } = req.params;
    try {
        const objectUserId = new mongoose.Types.ObjectId(userId); // ép kiểu
        const conversations = await Conversation.find({
            members: objectUserId,
        });
        res.status(200).json(conversations);
    } catch (err) {
        console.error("Lỗi khi lấy conversation:", err);
        res.status(500).json({ error: "Lấy cuộc trò chuyện thất bại" });
    }
};
