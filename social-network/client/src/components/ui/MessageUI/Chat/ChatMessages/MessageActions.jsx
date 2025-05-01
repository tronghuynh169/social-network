import React, { useState } from "react";
import { Smile, Reply, MoreVertical } from "lucide-react";
import MoreVerticalPopover from "./MoreVerticalPopover"; // Đổi tên thành MoreVerticalPopover

const MessageActions = ({
    msg,
    currentUserId,
    socket,
    setReplyMessage,
    isMe,
}) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false); // Trạng thái hiển thị popover
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

    const handleMoreVerticalClick = () => {
        setIsPopoverOpen(true);
        const { top, left, height } = e.target.getBoundingClientRect();
        setPopoverPosition({ top: top + height, left: left + window.scrollX });
    };

    const handleClosePopover = () => {
        setIsPopoverOpen(false); // Đóng popover
    };

    return (
        <>
            {isMe ? (
                // Thứ tự nút khi là tin nhắn của chính mình
                <>
                    <button
                        className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                        onClick={handleMoreVerticalClick}
                    >
                        <MoreVertical size={16} />
                    </button>

                    <button
                        className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                        onClick={() => setReplyMessage(msg)}
                    >
                        <Reply size={20} />
                    </button>
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
                </>
            ) : (
                // Thứ tự nút khi là tin nhắn của người khác
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
                        className="p-1 cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                        onClick={() => setReplyMessage(msg)}
                    >
                        <Reply size={20} />
                    </button>
                    <button
                        className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                        onClick={handleMoreVerticalClick}
                    >
                        <MoreVertical size={16} />
                    </button>
                </>
            )}

            {/* Hiển thị popover nếu isPopoverOpen là true */}
            {isPopoverOpen && (
                <MoreVerticalPopover
                    msg={msg}
                    isMe={isMe}
                    onClose={handleClosePopover}
                    position={popoverPosition}
                />
            )}
        </>
    );
};

export default MessageActions;
