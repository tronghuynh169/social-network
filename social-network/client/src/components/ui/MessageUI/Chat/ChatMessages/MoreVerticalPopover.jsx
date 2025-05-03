import React, { useEffect } from "react";
import socket from "~/socket";

const MoreVerticalPopover = ({
    msg,
    onClose,
    position,
    isMe,
    openChatRoomsModal, // New prop
    setEditMessage,
}) => {
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest(".popover-container")) {
                onClose(); // Đóng popover nếu nhấn ngoài
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [onClose]);

    return (
        <div
            className="popover-container absolute z-50 bg-[var(--secondary-color)] shadow-lg rounded-md w-48 py-2"
            style={{
                bottom: `${position.bottom + 30}px`,
                left: isMe
                    ? `${position.left - 175}px`
                    : `${position.left + 50}px`,
            }}
        >
            <div
                className="text-xs px-4 py-3 hover:bg-[var(--button-color)] cursor-pointer"
                onClick={() => {
                    openChatRoomsModal(msg); // Open ChatRoomsModal via callback
                    onClose(); // Close popover
                }}
            >
                Chuyển tiếp
            </div>
            {isMe ? (
                <div>
                    {msg.text ? (
                        <div
                            className="text-xs px-4 py-3 hover:bg-[var(--button-color)] cursor-pointer"
                            onClick={() => {
                                setEditMessage(msg);
                                onClose();
                            }}
                        >
                            Chỉnh sửa
                        </div>
                    ) : (
                        ""
                    )}
                    <div
                        className="text-xs px-4 py-3 hover:bg-[var(--button-color)] cursor-pointer"
                        onClick={() => {
                            socket.emit("recallMessage", {
                                messageId: msg._id,
                            });
                            onClose();
                        }}
                    >
                        Thu hồi tin nhắn
                    </div>
                </div>
            ) : (
                ""
            )}
        </div>
    );
};

export default MoreVerticalPopover;
