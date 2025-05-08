const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

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

// Gửi tin nhắn kèm nhiều file
exports.sendMessage = (req, res) => {
    uploadMessageFiles(req, res, async (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Lỗi khi upload file",
                error: err.message,
            });
        }

        const { conversationId, sender, text, replyTo } = req.body;
        let fileUrls = [];

        // Kiểm tra nếu có file được upload
        // Kiểm tra nếu có file được upload
        if (req.files && req.files.length > 0) {
            fileUrls = req.files.map((file) => {
                let fileUrl;
                const ext = path.extname(file.originalname).toLowerCase();

                // Nếu là hình ảnh hoặc video, dùng timestamp trong tên file
                if ([".jpg", ".jpeg", ".png", ".gif", ".mp4"].includes(ext)) {
                    fileUrl = `http://localhost:5000/uploads/messages/${file.filename}`; // Dùng timestamp
                } else {
                    // Nếu là tài liệu, giữ tên gốc
                    const originalName = Buffer.from(
                        file.originalname,
                        "latin1"
                    ).toString("utf8");
                    fileUrl = `http://localhost:5000/uploads/messages/${
                        file.filename
                    }?originalname=${encodeURIComponent(originalName)}`;
                }

                return {
                    name: file.originalname,
                    url: fileUrl,
                    type: file.mimetype,
                };
            });
        }

        console.log(fileUrls);

        try {
            // Tạo tin nhắn mới
            const message = await Message.create({
                conversation: conversationId,
                sender,
                text,
                files: fileUrls, // Lưu các URL file hình ảnh/video
                replyTo: replyTo || null,
            });

            await Conversation.findByIdAndUpdate(conversationId, {
                latestMessage: message._id,
                updatedAt: new Date(),
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
        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 })
            .populate("sender", "fullName avatar") // người gửi
            .populate({
                path: "replyTo", // tin nhắn gốc
                populate: {
                    path: "sender", // người gửi của tin nhắn gốc
                    select: "fullName avatar",
                },
            })
            .populate("readBy", "fullName avatar")
            .populate("likes", "fullName avatar slug");

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
        const objectUserId = new mongoose.Types.ObjectId(userId);

        const conversations = await Conversation.find({
            members: objectUserId,
        })
            .populate({
                path: "latestMessage",
                select: "text createdAt sender", // Chỉ lấy các trường cần thiết
                populate: { path: "sender", select: "fullName avatar" }, // Populate thông tin người gửi
            })
            .sort({ updatedAt: -1 }); // Sắp xếp theo thời gian cập nhật mới nhất

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

exports.uploadFiles = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Không có file được tải lên" });
    }

    // Xử lý tên file và chuyển mã từ latin1 sang utf8
    const fileUrls = req.files.map((file) => {
        const originalName = Buffer.from(file.originalname, "latin1").toString(
            "utf8"
        );
        return {
            name: originalName,
            url: `http://localhost:5000/uploads/messages/${file.filename}`,
            type: file.mimetype,
        };
    });

    res.status(200).json({ files: fileUrls });
};

exports.downloadFile = (req, res) => {
    const fileName = req.params.name; // Lấy tên file từ URL
    const filePath = path.join(__dirname, "../uploads/messages", fileName);

    if (fs.existsSync(filePath)) {
        // Nếu có tên gốc trong query string, sử dụng nó, nếu không sử dụng tên gốc của file
        const originalName = req.query.originalname || fileName; // Sử dụng fileName nếu không có originalname

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${originalName}"`
        );
        res.setHeader("Content-Type", "application/octet-stream");

        fs.createReadStream(filePath).pipe(res);
    } else {
        res.status(404).json({ error: "File không tồn tại" });
    }
};
