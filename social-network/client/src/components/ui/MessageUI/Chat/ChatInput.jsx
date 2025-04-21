import React, { useEffect } from "react";
import { Smile, Mic, ImageIcon, Heart, X } from "lucide-react";
import { Input } from "~/components/ui/input";

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
}) => {
    // Focus vào input khi có reply
    useEffect(() => {
        if (replyMessage) {
            inputRef.current?.focus();
        }
    }, [replyMessage]);

    const handleSendMessage = () => {
        if (message.trim() || selectedFiles.length > 0) {
            onSend();
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
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
                            onClick={() => setReplyMessage(null)}
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
            <div className="flex items-center gap-3">
                <Smile />
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
                        className="text-[var(--button-enable-color)] cursor-pointer hover:text-[var(--text-primary-color)]"
                        onClick={handleSendMessage}
                    >
                        Send
                    </button>
                ) : (
                    <>
                        <Mic className="cursor-pointer" />
                        <label htmlFor="upload-file">
                            <ImageIcon className="cursor-pointer" />
                        </label>
                        <Heart className="cursor-pointer" />
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatInput;
