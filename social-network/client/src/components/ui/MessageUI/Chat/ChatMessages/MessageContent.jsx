import React from "react";

const MessageContent = ({
    msg,
    isMe,
    setViewingImage,
    setIsImageModalOpen,
}) => {
    return (
        <div
            className={`flex flex-col ${
                isMe ? "items-end" : "items-start"
            } space-y-1`}
        >
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
                            className={`break-words rounded-2xl px-3 py-2 whitespace-pre-wrap ${
                                isMe
                                    ? "bg-[var(--text-me-message-color)]"
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
    );
};

export default MessageContent;
