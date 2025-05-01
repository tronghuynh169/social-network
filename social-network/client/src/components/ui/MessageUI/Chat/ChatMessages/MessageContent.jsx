import React from "react";

const MessageContent = ({
    msg,
    isMe,
    setViewingImage,
    setIsImageModalOpen,
}) => {
    return (
        <>
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
                <div key={idx} className={isMe ? "ml-auto" : ""}>
                    {file.type?.startsWith("image/") ? (
                        <img
                            src={file.url}
                            alt={`chat-img-${idx}`}
                            className="rounded-2xl max-w-[236px] object-cover cursor-pointer"
                            onClick={() => {
                                setViewingImage();
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
    );
};

export default MessageContent;
