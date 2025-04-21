import React from "react";
import dayjs from "dayjs";
import { MoreVertical, CornerUpLeft, Smile, Heart } from "lucide-react";

const shouldShowTime = (msg, index, messages) => {
    if (index === 0) return true;
    const prev = dayjs(messages[index - 1].createdAt);
    const curr = dayjs(msg.createdAt);
    return curr.diff(prev, "minute") >= 15;
};

const ChatMessages = ({
    messages,
    currentUserId,
    isGroup,
    setViewingImage,
    setIsImageModalOpen,
    setReplyMessage,
    socket,
}) => {
    return messages.map((msg, index) => {
        const isMe =
            (msg.sender?._id || msg.sender)?.toString() ===
            currentUserId.toString();
        const showTime = shouldShowTime(msg, index, messages);
        console.log("sender: ", msg.sender);
        return (
            <div key={index}>
                {showTime && (
                    <div className="text-center text-xs text-gray-400 my-4">
                        {dayjs(msg.createdAt).format("HH:mm DD/MM/YYYY")}
                    </div>
                )}
                <div
                    className={`mb-2 flex ${
                        isMe ? "justify-end" : "justify-start"
                    }`}
                >
                    <div className="max-w-[50%] flex flex-col gap-2 relative">
                        {!isMe && isGroup && (
                            <div className="text-xs text-gray-400 mb-1">
                                {msg.senderName}
                            </div>
                        )}
                        <div
                            className={`flex gap-0.5 ${
                                isMe ? "flex-row-reverse" : ""
                            }`}
                        >
                            {msg.text && (
                                <div
                                    className={`break-words rounded-2xl overflow-hidden px-3 py-2 whitespace-pre-wrap ${
                                        isMe
                                            ? "bg-[var(--text-me-message-color)]"
                                            : "bg-[var(--text-otther-message-color)]"
                                    }`}
                                >
                                    {msg.replyTo && (
                                        <div className="border-l-4 border-blue-400 pl-2 mb-1 text-sm text-gray-700 bg-gray-100 rounded">
                                            <span className="text-blue-500 font-semibold">
                                                {msg.replyTo?.sender
                                                    ?.fullName || "Người dùng"}
                                                :
                                            </span>{" "}
                                            {msg.replyTo.text
                                                ? msg.replyTo.text
                                                : msg.replyTo.files?.[0]
                                                      ?.name ||
                                                  "Tin nhắn đã bị xóa"}
                                        </div>
                                    )}
                                    {msg.text}
                                </div>
                            )}

                            {msg.files &&
                                msg.files.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className={`${isMe ? "ml-auto" : ""}`}
                                    >
                                        {file.type?.startsWith("image/") ? (
                                            <img
                                                src={file.url}
                                                alt={`chat-img-${idx}`}
                                                className="rounded-2xl max-w-[236px] object-cover cursor-pointer"
                                                onClick={() => {
                                                    setViewingImage(file.url);
                                                    setIsImageModalOpen(true);
                                                }}
                                            />
                                        ) : file.type?.startsWith("video/") ? (
                                            <video
                                                controls
                                                className="rounded-2xl max-w-[236px] max-h-[300px] object-contain"
                                            >
                                                <source
                                                    src={file.url}
                                                    type={file.type}
                                                />
                                                Trình duyệt của bạn không hỗ trợ
                                                video.
                                            </video>
                                        ) : (
                                            <div className="px-3 py-2 rounded-lg bg-[var(--button-color)] w-fit">
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline"
                                                >
                                                    {file.name}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}

                            <button className="p-1 cursor-pointer hover:bg-[var(--secondary-color)] rounded-full">
                                <Smile size={16} />
                            </button>
                            <button
                                className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                                onClick={() => setReplyMessage(msg)}
                            >
                                <CornerUpLeft size={16} />
                            </button>
                            <button className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                        <button
                            onClick={() =>
                                socket.emit("likeMessage", {
                                    messageId: msg._id,
                                    userId: currentUserId,
                                })
                            }
                            className={`absolute ${
                                isMe ? "right-0 -bottom-5" : "left-0 -bottom-5"
                            } py-0.5 px-2 bg-[var(--secondary-color)] rounded-full flex gap-1 items-center cursor-pointer`}
                        >
                            <Heart
                                size={16}
                                fill={
                                    msg.likes?.some(
                                        (user) => user._id === currentUserId
                                    )
                                        ? "red"
                                        : "none"
                                }
                                color="red"
                            />
                            <p>{msg.likes?.length || 0}</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    });
};

export default ChatMessages;
