import React, { useEffect, useRef } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import {
    Phone,
    Video,
    Info,
    Smile,
    Mic,
    ImageIcon,
    Heart,
    X,
} from "lucide-react";
import dayjs from "dayjs";
import socket from "~/socket";

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
}) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!conversationId) return;
        const handleReceiveMessage = (msg) => {
            if (msg.conversation === conversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        };
        socket.on("newMessage", handleReceiveMessage);
        return () => socket.off("newMessage", handleReceiveMessage);
    }, [conversationId, setMessages]);

    useEffect(() => {
        if (conversationId) {
            socket.emit("joinRoom", conversationId);
        }
    }, [conversationId]);

    const handleSendMessage = () => {
        if (message.trim() || selectedFiles.length > 0) {
            onSend();
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles((prev) => [...prev, ...files]);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const shouldShowTime = (msg, index, messages) => {
        if (index === 0) return true;
        const prev = dayjs(messages[index - 1].createdAt);
        const curr = dayjs(msg.createdAt);
        return curr.diff(prev, "minute") >= 15;
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
        }, 0);
        return () => clearTimeout(timeout);
    }, [messages]);

    return (
        <div className="flex-1 relative flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--secondary-color)]">
                <div className="flex items-center gap-3">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt="avatar"
                            className="w-11 h-11 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-full bg-gray-400" />
                    )}
                    <div className="font-semibold">{nameGroupChat}</div>
                </div>
                <div className="flex gap-4">
                    <Phone className="cursor-pointer" />
                    <Video className="cursor-pointer" />
                    <Info className="cursor-pointer" />
                </div>
            </div>

            {/* Scroll */}
            <ScrollArea className="flex-1 overflow-auto px-6 py-4 text-sm space-y-2">
                <div className="flex flex-col items-center py-10 gap-1">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt="avatar"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-400" />
                    )}
                    <div className="font-semibold text-[20px]">
                        {nameGroupChat}
                    </div>
                    {!isGroup && (
                        <button className="bg-[var(--secondary-color)] hover:bg-[var(--button-color)] cursor-pointer text-sm px-4 py-1.5 rounded-lg mt-2">
                            Xem trang cá nhân
                        </button>
                    )}
                    {isGroup && (
                        <p className="text-[var(--text-secondary-color)] text-[14px]">
                            {admin.fullName} đã tạo nhóm này
                        </p>
                    )}
                </div>

                {messages.map((msg, index) => {
                    const isMe = msg.sender === currentUserId;
                    const showTime = shouldShowTime(msg, index, messages);
                    return (
                        <div key={index}>
                            {showTime && (
                                <div className="text-center text-xs text-gray-400 my-4">
                                    {dayjs(msg.createdAt).format(
                                        "HH:mm DD/MM/YYYY"
                                    )}
                                </div>
                            )}

                            <div
                                className={`mb-2 flex ${
                                    isMe ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div className="max-w-[50%]">
                                    {!isMe && isGroup && (
                                        <div className="text-xs text-gray-400 mb-1">
                                            {msg.senderName}
                                        </div>
                                    )}
                                    <div
                                        className={`break-words rounded-2xl overflow-hidden ${
                                            isMe
                                                ? "bg-[var(--text-me-message-color)] text-white"
                                                : "bg-[var(--text-otther-message-color)] text-white"
                                        }`}
                                    >
                                        {msg.files &&
                                            msg.files.map((file, idx) =>
                                                file.type?.startsWith(
                                                    "image/"
                                                ) ? (
                                                    <img
                                                        key={idx}
                                                        src={file.url}
                                                        alt={`chat-img-${idx}`}
                                                        className="rounded-t-2xl max-w-[236px] object-cover mb-1"
                                                    />
                                                ) : (
                                                    <div
                                                        key={idx}
                                                        className="bg-white text-black px-3 py-2 rounded-lg mb-1"
                                                    >
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline"
                                                        >
                                                            {file.name}
                                                        </a>
                                                    </div>
                                                )
                                            )}

                                        {msg.text && (
                                            <div className="px-3 py-2 whitespace-pre-wrap">
                                                {msg.text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </ScrollArea>

            {/* Input + File Preview */}
            <div className="pl-4 pr-6 py-3 w-[96.5%] mx-auto mb-5 border rounded-2xl border-[var(--secondary-color)] flex flex-col gap-2">
                {selectedFiles.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="relative w-fit">
                                {file.type.startsWith("image/") ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs">
                                        {file.name}
                                    </div>
                                )}
                                <button
                                    onClick={() => handleRemoveFile(idx)}
                                    className="absolute -top-2 -right-2 bg-black bg-opacity-50 p-1 rounded-full text-white cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <Smile />
                    <Input
                        placeholder="Nhắn tin..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className=" border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {message.trim() || selectedFiles.length > 0 ? (
                        <button
                            className="text-[var(--button-enable-color)] cursor-pointer hover:text-[var(--text-primary-color)]"
                            onClick={handleSendMessage}
                        >
                            Send
                        </button>
                    ) : (
                        <>
                            <Mic className="cursor-pointer" />
                            <input
                                type="file"
                                accept="*/*"
                                multiple
                                hidden
                                id="upload-file"
                                onChange={handleFilesChange}
                            />
                            <label htmlFor="upload-file">
                                <ImageIcon className="cursor-pointer" />
                            </label>
                            <Heart className="cursor-pointer" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
