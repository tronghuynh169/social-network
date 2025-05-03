import React from "react";
import dayjs from "dayjs";
import MessageContent from "./MessageContent";
import ReplyPreview from "./ReplyPreview";
import SeenAvatars from "./SeenAvatars";
import MessageActions from "./MessageActions";

const MessageItem = ({
    msg,
    index,
    currentUserId,
    isGroup,
    showTime,
    messageRefs,
    activeMessageId,
    setActiveMessageId,
    scrollToMessage,
    setViewingImage,
    setIsImageModalOpen,
    setReplyMessage,
    setIsLikeModalOpen,
    setLikes,
    setMessageId,
    socket,
    lastSeenMap,
    openChatRoomsModal,
    setEditMessage,
}) => {
    const isMe = (msg.sender?._id || msg.sender) === currentUserId;
    const isActive = activeMessageId === msg._id;
    const seenUsersHere = msg.readBy?.filter(
        (user) => user._id !== currentUserId && lastSeenMap[user._id] === index
    );

    // Xác định khoảng cách margin-bottom
    const marginBottomClass =
        msg.likes?.length > 0 && seenUsersHere?.length > 0
            ? "mb-10" // Nếu có cả likes và seenUsersHere
            : msg.likes?.length > 0 || seenUsersHere?.length > 0
            ? "mb-4" // Nếu chỉ có một trong hai
            : "mb-0"; // Nếu không có cả hai

    return (
        <div
            ref={(el) => (messageRefs.current[msg._id] = el)}
            className="transition duration-500"
        >
            {/* Hiển thị thời gian */}
            {showTime && (
                <div className="text-center text-xs text-[var(--text-secondary-color)] my-4">
                    {dayjs(msg.createdAt).format("HH:mm DD/MM/YYYY")}
                </div>
            )}

            {/* Tin nhắn */}
            <div
                className={`mb-2 flex ${
                    isMe ? "justify-end" : "justify-start"
                }`}
                onMouseEnter={() => setActiveMessageId(msg._id)}
                onMouseLeave={() => setActiveMessageId(null)}
                onClick={() => setActiveMessageId(msg._id)}
            >
                <div
                    className={`max-w-[60%] flex flex-col gap-2 relative ${marginBottomClass}`}
                >
                    {/* Tên người gửi (nếu là nhóm) */}
                    {!isMe && isGroup && (
                        <div className="text-xs text-[var(--text-secondary-color)] mb-1">
                            {msg.senderName}
                        </div>
                    )}

                    {/* Tin nhắn trả lời */}
                    {msg.replyTo && !msg.isRecalled && (
                        <ReplyPreview
                            msg={msg}
                            currentUserId={currentUserId}
                            scrollToMessage={scrollToMessage}
                            isMe={msg.sender._id === currentUserId}
                        />
                    )}

                    {/* Nội dung tin nhắn và hành động */}
                    <div
                        className={`flex gap-0.5 ${
                            isMe ? "flex-row-reverse" : ""
                        }`}
                    >
                        {/* Nội dung tin nhắn */}
                        <MessageContent
                            msg={msg}
                            isMe={isMe}
                            setViewingImage={setViewingImage}
                            setIsImageModalOpen={setIsImageModalOpen}
                        />

                        {/* Hành động (action) */}
                        {isActive &&
                            !msg.isRecalled && ( // Chỉ hiển thị nếu tin nhắn chưa bị thu hồi
                                <div
                                    className={`absolute ${
                                        isMe ? "-left-17 " : "-right-17"
                                    } top-1/2 transform -translate-y-1/2 message-actions-container`}
                                >
                                    <MessageActions
                                        msg={msg}
                                        isMe={isMe}
                                        socket={socket}
                                        currentUserId={currentUserId}
                                        setReplyMessage={setReplyMessage}
                                        openChatRoomsModal={openChatRoomsModal}
                                        setEditMessage={setEditMessage}
                                    />
                                </div>
                            )}
                    </div>

                    {/* Likes */}
                    {msg.likes?.length > 0 && (
                        <div
                            className={`absolute cursor-pointer ${
                                isMe ? "right-0 -bottom-4" : "left-0 -bottom-4"
                            } py-0.5 px-2 bg-[var(--secondary-color)] rounded-full flex gap-1 items-center`}
                            onClick={() => {
                                setLikes(msg.likes);
                                setIsLikeModalOpen(true);
                                setMessageId(msg._id);
                            }}
                        >
                            ❤️
                            <p className="text-xs">{msg.likes.length}</p>
                        </div>
                    )}

                    {/* Seen Avatars */}
                    <SeenAvatars
                        users={seenUsersHere}
                        hasLikes={msg.likes?.length > 0}
                        isMe={isMe}
                    />
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
