import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { MoreVertical, Smile, Heart, Reply } from "lucide-react";

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
    setIsLikeModalOpen,
    setLikes,
    socket,
    setMessageId,
}) => {
    const [activeMessageId, setActiveMessageId] = useState(null);
    const wrapperRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setActiveMessageId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Xác định tin nhắn cuối cùng mà mỗi người đã đọc (trừ bạn)
    const lastSeenMap = {};
    messages.forEach((msg, i) => {
        msg.readBy?.forEach((user) => {
            if (user._id !== currentUserId) {
                lastSeenMap[user._id] = i; // Ghi nhận vị trí tin nhắn cuối cùng đã đọc
            }
        });
    });

    return (
        <div ref={wrapperRef}>
            {messages.map((msg, index) => {
                const isMe =
                    (msg.sender?._id || msg.sender)?.toString() ===
                    currentUserId.toString();
                const showTime = shouldShowTime(msg, index, messages);
                const isActive = activeMessageId === msg._id;

                // Lọc ra các user đã seen ở tin nhắn này và đây là tin nhắn cuối cùng họ đã đọc
                const seenUsersHere = msg.readBy?.filter(
                    (user) =>
                        user._id !== currentUserId &&
                        lastSeenMap[user._id] === index
                );

                return (
                    <div key={index}>
                        {showTime && (
                            <div className="text-center text-xs text-[var(--text-secondary-color)] my-4">
                                {dayjs(msg.createdAt).format(
                                    "HH:mm DD/MM/YYYY"
                                )}
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
                                    msg.likes?.length > 0 &&
                                    seenUsersHere?.length > 0
                                        ? "mb-10" // Nếu có cả likes và seenUsersHere
                                        : msg.likes?.length > 0 ||
                                          seenUsersHere?.length > 0
                                        ? "mb-4" // Nếu chỉ có một trong hai
                                        : "mb-0" // Nếu không có cả hai
                                }`}
                            >
                                {!isMe && isGroup && (
                                    <div className="text-xs text-[var(--text-secondary-color)] mb-1">
                                        {msg.senderName}
                                    </div>
                                )}

                                {/* Trả lời */}
                                {msg.replyTo && (
                                    <div
                                        className={`mb-1 flex flex-col gap-1 ${
                                            isMe ? "items-end" : "items-start"
                                        }`}
                                    >
                                        <div className="text-sm font-semibold flex items-center gap-1 text-[var(--text-secondary-color)]">
                                            <Reply size={16} />
                                            {msg.sender?._id === currentUserId
                                                ? "Bạn đang trả lời chính mình"
                                                : `${
                                                      msg.sender?.fullName
                                                  } đang trả lời ${
                                                      msg.replyTo.sender
                                                          ?._id ===
                                                      currentUserId
                                                          ? "bạn"
                                                          : msg.replyTo.sender
                                                                ?.fullName ||
                                                            "người dùng"
                                                  }`}
                                        </div>
                                        <div
                                            className={`${
                                                isMe
                                                    ? "border-r-4 pr-2"
                                                    : "border-l-4 pl-2"
                                            } border-[var(--secondary-color)]`}
                                        >
                                            <div className="text-sm text-[var(--text-secondary-color)] bg-[var(--secondary-color)] px-3 py-1 rounded-full max-w-full">
                                                {msg.replyTo.text
                                                    ? msg.replyTo.text
                                                    : msg.replyTo.files?.[0]
                                                          ?.name ||
                                                      "Tin nhắn đã bị xóa"}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Nội dung tin nhắn + file */}
                                <div
                                    className={`flex gap-0.5 ${
                                        isMe ? "flex-row-reverse" : ""
                                    }`}
                                >
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
                                        <div
                                            key={idx}
                                            className={`${
                                                isMe ? "ml-auto" : ""
                                            }`}
                                        >
                                            {file.type?.startsWith("image/") ? (
                                                <img
                                                    src={file.url}
                                                    alt={`chat-img-${idx}`}
                                                    className="rounded-2xl max-w-[236px] object-cover cursor-pointer"
                                                    onClick={() => {
                                                        setViewingImage();
                                                        setIsImageModalOpen(
                                                            true
                                                        );
                                                    }}
                                                />
                                            ) : file.type?.startsWith(
                                                  "video/"
                                              ) ? (
                                                <video
                                                    controls
                                                    className="rounded-2xl max-w-[236px] max-h-[300px] object-contain"
                                                >
                                                    <source
                                                        src={file.url}
                                                        type={file.type}
                                                    />
                                                    Trình duyệt không hỗ trợ
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

                                    {isActive && (
                                        <>
                                            <button
                                                className="p-1 cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                                                onClick={() =>
                                                    socket.emit("likeMessage", {
                                                        messageId: msg._id,
                                                        userId: currentUserId,
                                                    })
                                                }
                                            >
                                                <Smile size={16} />
                                            </button>
                                            <button
                                                className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                                                onClick={() =>
                                                    setReplyMessage(msg)
                                                }
                                            >
                                                <Reply size={20} />
                                            </button>
                                            <button className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full">
                                                <MoreVertical size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Likes */}
                                {msg.likes?.length > 0 && (
                                    <div
                                        className={`absolute cursor-pointer ${
                                            isMe
                                                ? "right-0 -bottom-4"
                                                : "left-0 -bottom-4"
                                        } py-0.5 px-2 bg-[var(--secondary-color)] rounded-full flex gap-1 items-center`}
                                        onClick={() => {
                                            setLikes(msg.likes);
                                            setIsLikeModalOpen(true);
                                            setMessageId(msg._id);
                                        }}
                                    >
                                        <Heart
                                            size={16}
                                            fill={
                                                msg.likes?.some(
                                                    (user) =>
                                                        user._id ===
                                                        currentUserId
                                                )
                                                    ? "red"
                                                    : "none"
                                            }
                                            color="red"
                                        />
                                        <p className="text-xs">
                                            {msg.likes.length}
                                        </p>
                                    </div>
                                )}

                                {/* Seen avatar như Facebook */}
                                {seenUsersHere?.length > 0 && (
                                    <div
                                        className={`absolute flex gap-1 items-center ${
                                            msg.likes?.length > 0 &&
                                            seenUsersHere?.length > 0
                                                ? "-bottom-10" // Nếu có cả likes và readBy
                                                : "-bottom-6" // Nếu chỉ có một trong hai hoặc không có
                                        }`}
                                    >
                                        {seenUsersHere
                                            .slice(0, 3)
                                            .map((user, i) => (
                                                <img
                                                    key={i}
                                                    src={user.avatar}
                                                    alt={user.fullName}
                                                    title={user.fullName}
                                                    className="w-5 h-5 rounded-full border border-white shadow-sm"
                                                />
                                            ))}
                                        {seenUsersHere.length > 3 && (
                                            <div
                                                className="w-5 h-5 rounded-full bg-gray-300 text-xs flex items-center justify-center border border-white shadow-sm"
                                                title={seenUsersHere
                                                    .slice(3)
                                                    .map((u) => u.fullName)
                                                    .join(", ")}
                                            >
                                                +{seenUsersHere.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatMessages;
