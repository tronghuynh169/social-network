import React from "react";
import emojiRegex from "emoji-regex"; // Import thư viện emoji-regex

const MessageContent = ({
    msg,
    isMe,
    setViewingImage,
    setIsImageModalOpen,
}) => {
    // Hàm kiểm tra nếu tin nhắn chỉ chứa emoji
    const isOnlyEmoji = (text) => {
        const regex = emojiRegex();
        const matches = text.match(regex); // Tìm tất cả emoji trong chuỗi
        return matches && matches.join("") === text.trim(); // Kiểm tra nếu toàn bộ text chỉ là emoji
    };

    return (
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}>
            {/* Avatar + display name (Facebook style: name above, avatar left of first bubble in a block) */}
            {!isMe && (
                <div className="flex flex-col items-start mb-1">
                    {msg.sender?.fullName && (
                        <span className="font-medium text-xs text-[var(--text-secondary-color)] pl-11 pb-0.5">
                            {msg.sender.fullName}
                        </span>
                    )}
                </div>
            )}
            <div className={`flex ${isMe ? "flex-row-reverse" : ""} items-end`}>
                {/* Avatar chỉ hiện ở tin nhắn đầu block, giả sử msg.isFirstInBlock */}
                {!isMe  && msg.sender?.avatar && (
                    <img
                        src={msg.sender.avatar}
                        alt={msg.sender.fullName || "avatar"}
                        className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                )}
                <div className="flex flex-col space-y-1">
                    {msg.isRecalled ? (
                        <div
                            className={`italic text-sm text-[var(--text-secondary-color)] px-3 py-2 rounded-2xl border ${
                                isMe ? "border-gray-300" : "border-gray-200"
                            }`}
                        >
                            Tin nhắn đã được thu hồi
                        </div>
                    ) : (
                        <>
                            {msg.isEdited && (
                                <div
                                    className={`text-xs text-[var(--text-secondary-color)] ${
                                        isMe ? "text-right" : "text-left"
                                    }`}
                                >
                                    (Đã chỉnh sửa)
                                </div>
                            )}

                            {msg.text && (
                                <div
                                    className={`${
                                        isOnlyEmoji(msg.text)
                                            ? "text-5xl leading-none"
                                            : "break-words rounded-2xl px-3 py-2 whitespace-pre-wrap"
                                    } ${
                                        isMe
                                            ? isOnlyEmoji(msg.text)
                                                ? ""
                                                : "bg-[var(--text-me-message-color)] text-white"
                                            : isOnlyEmoji(msg.text)
                                            ? ""
                                            : "bg-[var(--text-otther-message-color)]"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            )}

                            {msg.files?.map((file, idx) => (
                                <div key={idx} className="flex flex-col items-start">
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
                                            <source src={file.url} type={file.type} />
                                        </video>
                                    ) : file.type?.startsWith("audio/") ? (
                                        <audio
                                            controls
                                            src={file.url}
                                            className="rounded-2xl max-w-[220px] mt-1"
                                        >
                                            Trình duyệt của bạn không hỗ trợ audio.
                                        </audio>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageContent;