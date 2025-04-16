import React from "react";
import dayjs from "dayjs";

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
}) => {
    return messages.map((msg, index) => {
        const isMe = msg.sender === currentUserId;
        const showTime = shouldShowTime(msg, index, messages);
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
                    <div className="max-w-[50%] flex flex-col gap-2">
                        {!isMe && isGroup && (
                            <div className="text-xs text-gray-400 mb-1">
                                {msg.senderName}
                            </div>
                        )}
                        {msg.text && (
                            <div
                                className={`break-words rounded-2xl overflow-hidden px-3 py-2 whitespace-pre-wrap ${
                                    isMe
                                        ? "bg-[var(--text-me-message-color)]"
                                        : "bg-[var(--text-otther-message-color)]"
                                }`}
                            >
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
                    </div>
                </div>
            </div>
        );
    });
};

export default ChatMessages;
