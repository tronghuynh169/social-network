import React, { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages/ChatMessages";
import ChatInput from "./ChatInput";
import ImageModal from "./Modal/ImageModal";
import LikeModal from "./Modal/LikeModal";
import ChatRoomsModal from "./Modal/ChatRoomsModal";

const ChatBox = ({
    messages,
    setMessages,
    setMessage,
    message,
    isGroup,
    nameGroupChat,
    admin,
    onSend,
    selectedFiles,
    setSelectedFiles,
    currentUserId,
    conversationId,
    avatar,
    onToggleInfo,
    showInfo,
    replyMessage,
    setReplyMessage,
    socket,
    usersInfo,
}) => {
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const [viewingImage, setViewingImage] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isLikeModalOpen, setIsLikeModalOpen] = useState(false);
    const [isChatRoomsModalOpen, setIsChatRoomsModalOpen] = useState(false); // New
    const [likes, setLikes] = useState([]);
    const [messageId, setMessageId] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null); // For ChatRoomsModal
    const [editMessage, setEditMessage] = useState(null);

    // Lắng nghe sự kiện "messageLiked" để cập nhật danh sách tin nhắn
    useEffect(() => {
        const handleMessageLiked = (updatedMessage) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            );
        };

        socket.on("messageLiked", handleMessageLiked);

        return () => {
            socket.off("messageLiked", handleMessageLiked);
        };
    }, [socket, setMessages]);

    useEffect(() => {
        if (conversationId && socket && currentUserId) {
            socket.emit("markMessagesAsRead", {
                conversationId,
                userId: currentUserId,
            });
        }
    }, [conversationId, socket, currentUserId]);

    useEffect(() => {
        const handleMessagesUpdated = (updatedMessages) => {
            setMessages(updatedMessages); // Cập nhật toàn bộ danh sách tin nhắn
        };

        socket.on("messagesUpdated", handleMessagesUpdated);

        return () => {
            socket.off("messagesUpdated", handleMessagesUpdated);
        };
    }, [socket, setMessages]);

    // Lắng nghe sự kiện "newMessage" để thêm tin nhắn mới
    useEffect(() => {
        if (!conversationId) return;

        const handleReceiveMessage = (msg) => {
            if (msg.conversation === conversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on("newMessage", handleReceiveMessage);

        return () => socket.off("newMessage", handleReceiveMessage);
    }, [conversationId, socket, setMessages]);

    // Tham gia phòng chat
    useEffect(() => {
        if (conversationId) {
            socket.emit("joinRoom", conversationId);
        }
    }, [conversationId, socket]);

    // Tự động cuộn xuống dưới khi có tin nhắn mới
    const prevMessagesRef = useRef([]);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        const prevMessages = prevMessagesRef.current;

        const newMessageAdded =
            messages.length > prevMessages.length &&
            messages[messages.length - 1]?._id !==
                prevMessages[prevMessages.length - 1]?._id;

        // Luôn cuộn nếu lần đầu vào (F5, mở chat)
        if (isFirstLoad.current || newMessageAdded) {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
            isFirstLoad.current = false;
        }

        prevMessagesRef.current = messages;
    }, [messages]);

    // Hàm xử lý gỡ like
    const handleUnlike = (userId) => {
        if (!messageId) return;

        // Sử dụng sự kiện "likeMessage" để gỡ like
        socket.emit("likeMessage", {
            messageId,
            userId,
        });

        // Cập nhật danh sách like trong state
        setLikes((prevLikes) =>
            prevLikes.filter((user) => user._id !== userId)
        );
    };

    useEffect(() => {
        const handleMessageEdited = (editedMessage) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg._id === editedMessage._id ? editedMessage : msg
                )
            );
        };

        socket.on("messageEdited", handleMessageEdited);

        return () => {
            socket.off("messageEdited", handleMessageEdited);
        };
    }, [socket, setMessages]);

    useEffect(() => {
        const handleMessageRecalled = (recalledMsg) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === recalledMsg._id ? recalledMsg : msg
                )
            );
        };

        socket.on("messageRecalled", handleMessageRecalled);

        return () => {
            socket.off("messageRecalled", handleMessageRecalled);
        };
    }, []);

    const openChatRoomsModal = (message) => {
        setSelectedMessage(message);
        setIsChatRoomsModalOpen(true);
    };

    const closeChatRoomsModal = () => {
        setSelectedMessage(null);
        setIsChatRoomsModalOpen(false);
    };

    const handleSelectRoom = (room) => {
        console.log(
            "Chuyển tiếp tin nhắn:",
            selectedMessage,
            "đến phòng:",
            room
        );
        socket.emit("forwardMessage", {
            messageId: selectedMessage._id,
            conversationId: room._id,
            currentConversationId: conversationId,
        });
    };

    return (
        <div className="flex-1 relative flex flex-col">
            <ChatHeader
                isGroup={isGroup}
                nameGroupChat={nameGroupChat}
                avatar={avatar}
                admin={admin}
                onToggleInfo={onToggleInfo}
                showInfo={showInfo}
                usersInfo={usersInfo}
            />
            <div className="flex-1 overflow-auto px-6 py-4 text-sm space-y-2">
                <ChatMessages
                    messages={messages}
                    currentUserId={currentUserId}
                    isGroup={isGroup}
                    setViewingImage={setViewingImage}
                    setIsImageModalOpen={setIsImageModalOpen}
                    setIsLikeModalOpen={setIsLikeModalOpen}
                    setLikes={setLikes} // Truyền setLikes để cập nhật danh sách like
                    replyMessage={replyMessage}
                    setReplyMessage={setReplyMessage}
                    socket={socket}
                    setMessageId={setMessageId}
                    openChatRoomsModal={openChatRoomsModal}
                    setEditMessage={setEditMessage}
                />
                <div ref={bottomRef} />
            </div>
            <ChatInput
                currentUserId={currentUserId}
                message={message}
                setMessage={setMessage}
                onSend={onSend}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                inputRef={inputRef}
                replyMessage={replyMessage}
                setReplyMessage={setReplyMessage}
                editMessage={editMessage}
                setEditMessage={setEditMessage}
            />
            <ImageModal
                isOpen={isImageModalOpen}
                image={viewingImage}
                onClose={() => {
                    setViewingImage(null);
                    setIsImageModalOpen(false);
                }}
            />
            <LikeModal
                currentUserId={currentUserId}
                isOpen={isLikeModalOpen}
                likes={likes}
                onUnlike={handleUnlike} // Truyền hàm gỡ like
                onClose={() => setIsLikeModalOpen(false)} // Đóng LikeModal
            />
            <ChatRoomsModal
                open={isChatRoomsModalOpen}
                onClose={closeChatRoomsModal}
                onSelectRoom={handleSelectRoom}
                userId={currentUserId}
                usersInfo={usersInfo}
            />
        </div>
    );
};

export default ChatBox;
