const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const mongoose = require("mongoose");

// Tạo cuộc trò chuyện mới
exports.createConversation = async (req, res) => {
    try {
        const { members, isGroup, admin, name, avatar } = req.body;

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

// server/config/multerMessage.js (hoặc để chung trong controller cũng được)
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const messageUploadDir = path.join(__dirname, "../uploads/messages");
if (!fs.existsSync(messageUploadDir)) {
    fs.mkdirSync(messageUploadDir, { recursive: true });
}

const messageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, messageUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const uploadMessageImage = multer({ storage: messageStorage }).single("image");

// Gửi tin nhắn kèm hình ảnh (nếu có)
exports.sendMessage = (req, res) => {
    uploadMessageImage(req, res, async (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Lỗi khi upload ảnh",
                error: err,
            });
        }

        const { conversationId, sender, text } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = `http://localhost:5000/uploads/messages/${req.file.filename}`;
        }

        try {
            const message = await Message.create({
                conversation: conversationId,
                sender,
                text,
                image: imageUrl,
            });

            res.status(201).json({
                success: true,
                message: "Gửi tin nhắn thành công",
                data: message,
            });
        } catch (err) {
            console.error("❌ Lỗi khi gửi tin nhắn:", err);
            res.status(500).json({
                success: false,
                message: "Gửi tin nhắn thất bại",
                error: err.message,
            });
        }
    });
};

// Lấy tin nhắn của 1 cuộc trò chuyện
exports.getMessages = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const messages = await Message.find({
            conversation: conversationId,
        }).sort({ createdAt: 1 });
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

// Lấy cuộc trò chuyện theo ID
exports.getConversationById = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy cuộc trò chuyện." });
        }

        res.status(200).json(conversation);
    } catch (err) {
        console.error("❌ Lỗi khi lấy cuộc trò chuyện theo ID:", err);
        res.status(500).json({ error: "Lỗi server khi lấy cuộc trò chuyện." });
    }
};
