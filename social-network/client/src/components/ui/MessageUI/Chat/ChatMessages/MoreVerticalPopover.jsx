import React, { useEffect } from "react";

const MoreVerticalPopover = ({
    msg,
    onClose,
    position,
    isMe,
    openChatRoomsModal, // New prop
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
            className="popover-container absolute z-50 bg-white shadow-lg rounded-md w-48 py-2"
            style={{
                top: `${position.top - 80}px`,
                left: isMe
                    ? `${position.left - 180}px`
                    : `${position.left + 50}px`,
            }}
        >
            <div
                className="text-xs text-gray-500 px-4 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                    openChatRoomsModal(msg); // Open ChatRoomsModal via callback
                    onClose(); // Close popover
                }}
            >
                Chuyển tiếp
            </div>
            <div
                className="text-xs text-gray-500 px-4 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                    socket.emit("recallMessage", { messageId: msg._id });
                    onClose();
                }}
            >
                Thu hồi tin nhắn
            </div>
        </div>
    );
};

export default MoreVerticalPopover;
