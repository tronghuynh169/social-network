import React, { useEffect, useState } from "react";
import { Smile, Mic, ImageIcon, Heart, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import socket from "~/socket";

const ChatInput = ({
    currentUserId,
    message,
    setMessage,
    onSend,
    selectedFiles,
    setSelectedFiles,
    inputRef,
    replyMessage,
    setReplyMessage,
    editMessage,
    setEditMessage,
}) => {
    const [originalMessage, setOriginalMessage] = useState(""); // Lưu trữ nội dung gốc khi chỉnh sửa

    useEffect(() => {
        if (editMessage) {
            setMessage(editMessage.text);
            setOriginalMessage(editMessage.text); // Lưu văn bản gốc
            inputRef.current?.focus();
        }
    }, [editMessage]);

    // Focus vào input khi có reply
    useEffect(() => {
        if (replyMessage) {
            inputRef.current?.focus();
        }
    }, [replyMessage]);

    const handleSendMessage = () => {
        if (message.trim() || selectedFiles.length > 0) {
            if (editMessage) {
                // Gửi tin nhắn đã chỉnh sửa
                socket.emit("editMessage", {
                    messageId: editMessage._id,
                    newText: message.trim(),
                });
                setEditMessage(null);
                setOriginalMessage(""); // Xóa văn bản gốc sau khi gửi
            } else {
                onSend();
            }
            setMessage(""); // Clear input sau khi gửi/chỉnh
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

        // Reset giá trị của input file để cho phép chọn lại cùng file
        e.target.value = "";

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setTimeout(() => {
            inputRef.current?.focus(); // Focus input
        }, 0);
    };

    const isSendDisabled = () => {
        if (editMessage) {
            // Kiểm tra nếu đang chỉnh sửa và nội dung không thay đổi
            return message.trim() === originalMessage.trim();
        }
        return !message.trim() && selectedFiles.length === 0;
    };

    const handleCancelEdit = () => {
        setEditMessage(null); // Huỷ chỉnh sửa
        setMessage(""); // Xoá nội dung message
        setTimeout(() => {
            inputRef.current?.focus(); // Focus input
        }, 0);
    };

    const handleCancelReply = () => {
        setReplyMessage(null); // Huỷ chỉnh sửa
        setMessage(""); // Xoá nội dung message
        setTimeout(() => {
            inputRef.current?.focus(); // Focus input
        }, 0);
    };

    return (
        <div className="pl-4 pr-6 py-3 w-[96.5%] mx-auto mb-5 border rounded-2xl border-[var(--secondary-color)] flex flex-col gap-2">
            {selectedFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    <label
                        htmlFor="upload-file"
                        className="w-16 h-16 bg-[var(--secondary-color)] hover:bg-[var(--button-color)] flex items-center justify-center rounded-lg cursor-pointer border border-dashed border-gray-400"
                    >
                        +
                    </label>
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative w-fit">
                            {file.type.startsWith("image/") ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-[var(--secondary-color)] rounded-lg flex items-center justify-center text-xs text-center p-1 overflow-hidden">
                                    <span className="line-clamp-2 break-words">
                                        {file.name}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => handleRemoveFile(idx)}
                                className="absolute -top-2 -right-2 bg-opacity-50 p-1 rounded-full cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {replyMessage && (
                <div className="rounded-lg mb-2 text-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="">Đang trả lời </span>
                            <span className="font-medium">
                                {replyMessage.sender?._id === currentUserId
                                    ? "chính mình"
                                    : replyMessage.sender?.fullName ||
                                      "Người dùng"}
                            </span>
                        </div>
                        <button
                            onClick={handleCancelReply}
                            className="cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="text-[var(--text-secondary-color)] mt-1">
                        {
                            // Kiểm tra nếu replyMessage có file đính kèm
                            replyMessage.files &&
                            replyMessage.files.length > 0 ? (
                                // Kiểm tra nếu là hình ảnh
                                replyMessage.files[0].type.startsWith(
                                    "image/"
                                ) ? (
                                    <span className="">Hình ảnh</span>
                                ) : // Kiểm tra nếu là video
                                replyMessage.files[0].type.startsWith(
                                      "video/"
                                  ) ? (
                                    <span className="">Video</span>
                                ) : (
                                    // Nếu là file khác
                                    <span className="">File đính kèm</span>
                                )
                            ) : (
                                // Nếu không có file, hiển thị nội dung tin nhắn
                                replyMessage.text
                            )
                        }
                    </div>
                </div>
            )}
            <input
                type="file"
                accept="*/*"
                multiple
                hidden
                id="upload-file"
                onChange={handleFilesChange}
            />
            {editMessage && (
                <div className="rounded-lg mb-2 text-sm text-[var(--text-secondary-color)]">
                    <div className="flex justify-between items-center">
                        <span>Đang chỉnh sửa tin nhắn</span>
                        <button
                            onClick={handleCancelEdit}
                            className="cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-3">
                <span title="Chọn biểu tượng cảm xúc" className="cursor-pointer"><Smile /></span>
                <Input
                    ref={inputRef}
                    placeholder="Nhắn tin..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {message.trim() || selectedFiles.length > 0 ? (
                    <button
                        className={`text-[var(--button-enable-color)] ${
                            isSendDisabled()
                                ? "cursor-not-allowed"
                                : "cursor-pointer hover:text-[var(--text-primary-color)]"
                        }`}
                        onClick={handleSendMessage}
                        disabled={isSendDisabled()}
                    >
                        Send
                    </button>
                ) : (
                    <>
                        <span title="Clip âm thanh"><Mic className="cursor-pointer" /></span>
                        <label htmlFor="upload-file" title="Thêm ảnh hoặc video">
                            <ImageIcon className="cursor-pointer" />
                        </label>
                        <span title="Thích"><Heart className="cursor-pointer" /></span>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatInput;
