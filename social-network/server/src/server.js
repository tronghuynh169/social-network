const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./database/connection");
const route = require("./routes");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const Notification = require("./models/Notification");
const Profile = require("./models/Profile");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173", // Frontend URL
        credentials: true, // Allow cookies and tokens
    })
);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/messages", express.static(path.join(__dirname, "messages")));
app.use(express.static(path.join(__dirname, "public")));

// Initialize routes
route(app);

// Fallback route for unknown endpoints
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// Connect to the database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Frontend URL
        credentials: true,
    },
});

// Socket.IO logic
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId; // hoặc lấy từ token sau khi xác thực
    if (userId) {
        socket.userId = userId;
        socket.join(userId.toString()); // Cho phép gửi io.to(userId) ở các sự kiện
        console.log("✅ User joined room:", userId);
    }

    // Xử lý sự kiện "newGroupCreated"
    socket.on("newGroupCreated", async (newGroup) => {
        try {
            // Nếu nhóm chưa có tên, tạo tên mặc định từ danh sách thành viên
            if (!newGroup.name) {
                const members = await User.find({
                    _id: { $in: newGroup.members },
                });
                newGroup.name = members
                    .map((member) => member.fullName)
                    .join(", ");
            }

            io.emit("newGroupCreated", newGroup); // Phát sự kiện đến tất cả client
        } catch (error) {
            console.error("❌ Error handling new group creation:", error);
        }
    });
    // Listen for 'sendMessage' event
    // Xử lý sự kiện 'sendMessage' từ client
    socket.on("sendMessage", async (data) => {
        console.log("BE received sendMessage:", data);
        console.log("data: ", data);
        try {
            const parsedFiles =
                typeof data.files === "string"
                    ? JSON.parse(data.files)
                    : data.files;

            const newMessage = new Message({
                sender: data.sender,
                conversation: data.conversationId,
                text: data.text || "",
                files: parsedFiles,
                replyTo: data.replyTo || null,
            });

            const savedMessage = await newMessage.save().then((msg) =>
                msg.populate([
                    { path: "sender", select: "fullName avatar" },
                    {
                        path: "replyTo",
                        populate: { path: "sender", select: "fullName avatar" },
                    },
                ])
            );

            // ✅ Cập nhật latestMessage trong conversation
            await Conversation.findByIdAndUpdate(data.conversationId, {
                latestMessage: savedMessage._id,
            });

            // ✅ Phát sự kiện toàn cục để cập nhật sidebar và các thành viên khác
            const updatedConversation = await Conversation.findById(
                data.conversationId
            )
                .populate({
                    path: "latestMessage",
                    select: "text createdAt sender",
                    populate: { path: "sender", select: "fullName avatar" },
                })
                .populate("members", "fullName avatar");

            io.emit("conversationUpdated", updatedConversation); // Cập nhật toàn cục

            try {
                const conversation = await Conversation.findById(
                    data.conversationId
                ).populate("members", "fullName");
                const senderUser = await Profile.findById(data.sender); // để lấy tên
                const notifyPromises = conversation.members
                    .filter((member) => member._id.toString() !== data.sender) // Không gửi thông báo cho người gửi
                    .map(async (member) => {
                        const newNotify = new Notification({
                            user: member._id,
                            sender: data.sender,
                            type: "message",
                            content: `${senderUser.fullName} đã gửi một tin nhắn mới.`,
                            data: {
                                conversationId: data.conversationId,
                                messageId: savedMessage._id,
                            },
                        });
                        const savedNotify = await newNotify.save();
                        // Gửi realtime qua socket
                        io.to(member._id.toString()).emit(
                            "newNotification",
                            savedNotify
                        );

                        console.log("Nguoi nhan: " + member._id);
                    });
                await Promise.all(notifyPromises);
            } catch (error) {
                console.error("❌ Lỗi gửi notification:", error);
            }

            // ✅ Gửi tin nhắn mới về client trong phòng
            io.to(data.conversationId).emit("receiveMessage", savedMessage);
        } catch (error) {
            console.error("❌ Lỗi khi lưu tin nhắn:", error);
        }
    });

    socket.on("conversationUpdated", async (updatedConv) => {
        try {
            if (!updatedConv.members || updatedConv.members.length === 0) {
                updatedConv = await Conversation.findById(updatedConv._id)
                    .populate("members", "fullName avatar")
                    .populate({
                        path: "latestMessage",
                        select: "text createdAt sender",
                        populate: { path: "sender", select: "fullName avatar" },
                    });

                if (!updatedConv) {
                    console.error("❌ Conversation not found in database.");
                    return;
                }
            }

            io.emit("conversationUpdated", updatedConv);
        } catch (err) {
            console.error("❌ Error in conversationUpdated:", err);
        }
    });

    // Join a conversation room
    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`🔗 User joined conversation: ${conversationId}`);
    });

    socket.on("leaveConversation", (conversationId) => {
        socket.leave(conversationId);
        console.log(`❌ User left conversation: ${conversationId}`);
    });

    // Handle client disconnect
    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });

    socket.on("likeMessage", async ({ messageId, userId }) => {
        try {
            const message = await Message.findById(messageId);

            if (!message) return;

            const alreadyLiked = message.likes.includes(userId);

            if (alreadyLiked) {
                // Unlike
                message.likes = message.likes.filter(
                    (id) => id.toString() !== userId.toString()
                );
            } else {
                // Like
                message.likes.push(userId);
            }

            const updatedMessage = await message.save().then((msg) =>
                msg.populate([
                    { path: "sender", select: "fullName avatar" },
                    {
                        path: "replyTo",
                        populate: { path: "sender", select: "fullName avatar" },
                    },
                    {
                        path: "likes",
                        select: "fullName avatar slug",
                    },
                    {
                        path: "readBy",
                        select: "fullName avatar",
                    },
                ])
            );

            io.to(message.conversation.toString()).emit(
                "messageLiked",
                updatedMessage
            );
        } catch (error) {
            console.error("❌ Lỗi khi like tin nhắn:", error);
        }
    });

    socket.on("markMessagesAsRead", async ({ conversationId, userId }) => {
        try {
            // Lấy tất cả tin nhắn chưa đọc trong cuộc hội thoại
            const unreadMessages = await Message.find({
                conversation: conversationId,
                readBy: { $ne: userId }, // Lọc các tin nhắn chưa được đọc bởi user hiện tại
            });

            // Cập nhật readBy cho từng tin nhắn
            const updatePromises = unreadMessages.map((msg) =>
                Message.findByIdAndUpdate(msg._id, {
                    $addToSet: { readBy: userId }, // Chỉ thêm nếu userId chưa tồn tại
                })
            );

            await Promise.all(updatePromises);

            // Lấy lại danh sách tin nhắn sau khi cập nhật
            const messages = await Message.find({
                conversation: conversationId,
            })
                .populate("sender", "fullName avatar")
                .populate("readBy", "fullName avatar") // Populate để trả về danh sách người đã đọc
                .populate("likes", "fullName avatar slug")
                .populate({
                    path: "replyTo",
                    populate: { path: "sender", select: "fullName avatar" },
                });

            // Phát sự kiện cập nhật tin nhắn đã đọc đến tất cả client trong phòng
            // Gửi lại toàn bộ tin nhắn đã cập nhật readBy
            io.to(conversationId).emit("messagesUpdated", messages);
        } catch (err) {
            console.error("❌ Error updating readBy:", err);
        }
    });

    socket.on("recallMessage", async ({ messageId }) => {
        try {
            const message = await Message.findByIdAndUpdate(
                messageId,
                { isRecalled: true, text: "", files: [] },
                { new: true }
            )
                .populate("sender", "fullName avatar")
                .populate("likes", "fullName avatar slug")
                .populate("readBy", "fullName avatar")
                .populate({
                    path: "replyTo",
                    populate: { path: "sender", select: "fullName avatar" },
                });

            if (message) {
                io.to(message.conversation.toString()).emit(
                    "messageRecalled",
                    message
                );
            }
        } catch (error) {
            console.error("❌ Lỗi thu hồi tin nhắn:", error);
        }
    });

    socket.on(
        "forwardMessage",
        async ({ messageId, conversationId, currentConversationId }) => {
            try {
                const originalMessage = await Message.findById(messageId);

                if (!originalMessage) {
                    return socket.emit("error", {
                        message: "Tin nhắn không tồn tại.",
                    });
                }

                const forwardedMessage = new Message({
                    sender: originalMessage.sender,
                    conversation: conversationId,
                    text: originalMessage.text,
                    files: originalMessage.files,
                    replyTo: null, // Không cần replyTo
                });

                const savedMessage = await forwardedMessage.save().then((msg) =>
                    msg.populate([
                        { path: "sender", select: "fullName avatar" },
                        { path: "conversation", select: "name" },
                    ])
                );

                // Gửi tin nhắn đến tất cả thành viên trong phòng
                io.to(conversationId).emit("receiveMessage", savedMessage);

                // Đảm bảo không gửi tin nhắn đến phòng chat hiện tại
                if (currentConversationId !== conversationId) {
                    io.to(currentConversationId).emit("messageUpdated", {
                        messageId,
                    });
                }
            } catch (error) {
                console.error("❌ Lỗi khi chuyển tiếp tin nhắn:", error);
                socket.emit("error", {
                    message: "Lỗi khi chuyển tiếp tin nhắn.",
                });
            }
        }
    );

    socket.on("editMessage", async ({ messageId, newText }) => {
        try {
            const updatedMessage = await Message.findByIdAndUpdate(
                messageId,
                {
                    text: newText,
                    isEdited: true, // Đánh dấu là đã chỉnh sửa
                },
                { new: true }
            )
                .populate("sender", "fullName avatar")
                .populate("likes", "fullName avatar slug")
                .populate("readBy", "fullName avatar")
                .populate({
                    path: "replyTo",
                    populate: { path: "sender", select: "fullName avatar" },
                });

            if (updatedMessage) {
                io.to(updatedMessage.conversation.toString()).emit(
                    "messageEdited",
                    updatedMessage
                );
            }
        } catch (error) {
            console.error("❌ Lỗi khi chỉnh sửa tin nhắn:", error);
        }
    });

    // Handle delete conversation
    socket.on("deleteConversation", async ({ conversationId }) => {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                return socket.emit("error", {
                    message: "Conversation not found.",
                });
            }

            // Phát sự kiện `conversationDeleted` tới tất cả các client
            io.emit("conversationDeleted", {
                conversationId,
                message: "Cuộc trò chuyện đã bị xóa.",
            });

            // Delete the conversation and its messages
            await Conversation.findByIdAndDelete(conversationId);
            await Message.deleteMany({ conversation: conversationId });
        } catch (error) {
            console.error("❌ Error deleting conversation:", error);
            socket.emit("error", { message: "Lỗi khi xóa cuộc trò chuyện." });
        }
    });

    socket.on("changeAdmin", async ({ conversationId, newAdminId }) => {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                return socket.emit("error", {
                    message: "Cuộc trò chuyện không tồn tại.",
                });
            }

            // Cập nhật admin
            conversation.admin = newAdminId;
            await conversation.save();

            // Populate thông tin admin và các trường cần thiết
            const updatedConversation = await Conversation.findById(
                conversationId
            )
                .populate("admin", "fullName avatar") // Populate thông tin admin
                .populate("members", "fullName avatar") // Populate thông tin thành viên
                .populate({
                    path: "latestMessage",
                    select: "text createdAt sender",
                    populate: { path: "sender", select: "fullName avatar" },
                });

            // Phát sự kiện tới tất cả client
            io.to(conversationId).emit(
                "conversationUpdated",
                updatedConversation
            );
        } catch (error) {
            console.error("❌ Lỗi khi đổi quản trị viên:", error);
            socket.emit("error", { message: "Không thể đổi quản trị viên." });
        }
    });

    socket.on("emojiUpdated", async ({ conversationId, emoji }) => {
        try {
            const conversation = await Conversation.findByIdAndUpdate(
                conversationId,
                { emoji },
                { new: true }
            );

            // Phát sự kiện cập nhật emoji tới toàn bộ thành viên trong phòng
            io.to(conversationId).emit("emojiUpdated", {
                conversationId,
                emoji,
            });
            console.log(
                `✅ Emoji updated for conversation ${conversationId}: ${emoji}`
            );
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật emoji:", error);
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
