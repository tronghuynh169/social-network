import React, { useEffect, useState, useRef } from "react";
import { Smile, Mic, ImageIcon, X, StopCircle } from "lucide-react";
import { Input } from "~/components/ui/input";
import socket from "~/socket";
import EmojiModal from "~/components/EmojiModal";

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
    conversationId,
    emoji,
}) => {
    const [originalMessage, setOriginalMessage] = useState(""); // Lưu trữ nội dung gốc khi chỉnh sửa
    const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false); // Kiểm soát trạng thái modal

    // Voice message states
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [recordTime, setRecordTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const recordInterval = useRef(null);
    // Start recording
    const handleStartRecording = async () => {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const recorder = new window.MediaRecorder(stream);
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordTime(0);

            // Biến cục bộ lưu chunk
            let localChunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    localChunks.push(e.data);
                }
            };
            recorder.onstop = () => {
                stream.getTracks().forEach((track) => track.stop());
                const blob = new Blob(localChunks, { type: "audio/webm" });
                setAudioUrl(URL.createObjectURL(blob));
                const audioFile = new File([blob], `voice-${Date.now()}.webm`, {
                    type: "audio/webm",
                });
                setSelectedFiles((prev) => [...prev, audioFile]);
                setIsRecording(false);
                setMediaRecorder(null);
                clearInterval(recordInterval.current);
                // KHÔNG reset recordTime ngay lập tức
                setTimeout(() => setRecordTime(0), 500); // để user thấy thời gian vừa ghi
            };

            recorder.start();
            recordInterval.current = setInterval(() => {
                setRecordTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            alert("Bạn cần cho phép quyền micro để ghi âm!");
        }
    };

    // Stop recording
    const handleStopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
        }
    };

    // Cancel recording
    const handleCancelRecording = () => {
        setIsRecording(false);
        setAudioChunks([]);
        setAudioUrl(null);
        clearInterval(recordInterval.current);
        setRecordTime(0);
    };

    // Format time as mm:ss
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // UI: Nếu đang recording thì show Stop, nếu không thì show Mic
    const renderRecordingBar = () => (
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[var(--message-me-color)] w-full relative">
            <div className="flex items-center gap-5">
                <button
                    onClick={handleCancelRecording}
                    className="mr-2 cursor-pointer"
                    title="Hủy ghi âm"
                >
                    <X size={20} />
                </button>
                <span className="text-lg font-mono text-gray-700">
                    {formatTime(recordTime)}
                </span>
            </div>
            <button
                onClick={handleStopRecording}
                className="bg-[var(--text-primary-color)] rounded-full flex items-center justify-center w-7 h-7 mr-3 border cursor-pointer"
                title="Dừng ghi âm"
            >
                <StopCircle className="text-red-500" size={20} />
            </button>
        </div>
    );
    const handleOpenModal = () => {
        setIsEmojiModalOpen(true);
    };
    const handleCloseModal = () => setIsEmojiModalOpen(false);

    const handleEmojiSelect = (emoji) => {
        setMessage((prevMessage) => prevMessage + emoji);
    };

    useEffect(() => {
        if (editMessage) {
            setMessage(editMessage.text);
            setOriginalMessage(editMessage.text); // Lưu văn bản gốc
            inputRef.current?.focus();
        }
    }, [editMessage]);

    useEffect(() => {
        if (replyMessage) {
            inputRef.current?.focus();
        }
    }, [replyMessage]);

    const handleSendMessage = () => {
        if (message.trim() || selectedFiles.length > 0) {
            if (editMessage) {
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

    const handleSendLike = () => {
        socket.emit("sendMessage", {
            sender: currentUserId, // Gửi ID người dùng hiện tại
            conversationId: conversationId, // Thay thế bằng ID cuộc trò chuyện hiện tại
            text: emoji, // Nội dung tin nhắn là emoji trái tim
        });
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
                        {replyMessage.files && replyMessage.files.length > 0 ? (
                            replyMessage.files[0].type.startsWith("image/") ? (
                                <span className="">Hình ảnh</span>
                            ) : replyMessage.files[0].type.startsWith(
                                  "video/"
                              ) ? (
                                <span className="">Video</span>
                            ) : (
                                <span className="">File đính kèm</span>
                            )
                        ) : (
                            replyMessage.text
                        )}
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
                <span
                    title="Chọn biểu tượng cảm xúc"
                    className="cursor-pointer"
                    onClick={handleOpenModal}
                >
                    <Smile />
                </span>
                {isRecording ? (
                    renderRecordingBar()
                ) : (
                    <Input
                        ref={inputRef}
                        placeholder="Nhắn tin..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                )}
                {!isRecording &&
                (message.trim() || selectedFiles.length > 0) ? (
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
                ) : !isRecording ? (
                    <>
                        <span
                            title="Ghi âm"
                            onClick={handleStartRecording}
                            className="cursor-pointer"
                        >
                            <Mic />
                        </span>
                        <label
                            htmlFor="upload-file"
                            title="Thêm ảnh hoặc video"
                        >
                            <ImageIcon className="cursor-pointer" />
                        </label>
                        <span
                            title="Thích"
                            onClick={handleSendLike}
                            className="cursor-pointer text-[20px]"
                        >
                            {emoji}
                        </span>
                    </>
                ) : null}
            </div>
            <EmojiModal
                isOpen={isEmojiModalOpen}
                onClose={handleCloseModal}
                title="Chọn biểu tượng cảm xúc"
                onEmojiSelect={handleEmojiSelect} // Truyền callback xử lý emoji đã chọn
            />
        </div>
    );
};

export default ChatInput;
