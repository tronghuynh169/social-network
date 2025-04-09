const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Tạo cuộc trò chuyện mới
exports.createConversation = async (req, res) => {
    const { members } = req.body;

    if (!members || members.length < 2) {
        return res.status(400).json({ error: "Cần ít nhất 2 thành viên" });
    }

    const sortedMembers = [...members].sort(); // sắp xếp để tránh trùng thứ tự

    try {
        console.log("Conversation:", Conversation);
        const existing = await Conversation.findOne({
            members: { $all: sortedMembers, $size: sortedMembers.length },
        });

        if (existing) return res.status(200).json(existing);

        const newConversation = await Conversation.create({
            members: sortedMembers,
        });
        res.status(201).json(newConversation);
    } catch (err) {
        console.error("❌ Lỗi khi tạo cuộc trò chuyện:", err);
        res.status(500).json({ error: "Tạo cuộc trò chuyện thất bại" });
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
        const conversations = await Conversation.find({ members: userId });
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json({ error: "Lấy cuộc trò chuyện thất bại" });
    }
};
