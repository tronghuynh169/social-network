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
}) => {
    const isMe = (msg.sender?._id || msg.sender) === currentUserId;
    const isActive = activeMessageId === msg._id;
    const seenUsersHere = msg.readBy?.filter(
        (user) => user._id !== currentUserId && lastSeenMap[user._id] === index
    );

    return (
        <div
            ref={(el) => (messageRefs.current[msg._id] = el)}
            className="transition duration-500"
        >
            {showTime && (
                <div className="text-center text-xs text-[var(--text-secondary-color)] my-4">
                    {dayjs(msg.createdAt).format("HH:mm DD/MM/YYYY")}
                </div>
            )}
            <div
                className={`mb-2 flex ${
                    isMe ? "justify-end" : "justify-start"
                }`}
                onMouseEnter={() => setActiveMessageId(msg._id)}
                onMouseLeave={() => setActiveMessageId(null)}
                onClick={() => setActiveMessageId(msg._id)}
            >
                <div
                    className={`max-w-[50%] flex flex-col gap-2 relative ${
                        msg.likes?.length > 0 && seenUsersHere?.length > 0
                            ? "mb-10"
                            : msg.likes?.length > 0 || seenUsersHere?.length > 0
                            ? "mb-4"
                            : "mb-0"
                    }`}
                >
                    {!isMe && isGroup && (
                        <div className="text-xs text-[var(--text-secondary-color)] mb-1">
                            {msg.senderName}
                        </div>
                    )}

                    {msg.replyTo && (
                        <ReplyPreview
                            msg={msg}
                            currentUserId={currentUserId}
                            scrollToMessage={scrollToMessage}
                            isMe={isMe}
                        />
                    )}

                    <div
                        className={`flex gap-0.5 ${
                            isMe ? "flex-row-reverse" : ""
                        }`}
                    >
                        <MessageContent
                            msg={msg}
                            isMe={isMe}
                            setViewingImage={setViewingImage}
                            setIsImageModalOpen={setIsImageModalOpen}
                        />
                        {isActive && (
                            <MessageActions
                                msg={msg}
                                socket={socket}
                                currentUserId={currentUserId}
                                setReplyMessage={setReplyMessage}
                            />
                        )}
                    </div>

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

                    <SeenAvatars users={seenUsersHere} />
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
