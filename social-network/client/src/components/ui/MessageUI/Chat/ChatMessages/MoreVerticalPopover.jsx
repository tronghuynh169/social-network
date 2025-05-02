import React, { useEffect } from "react";
import socket from "~/socket";

const MoreVerticalPopover = ({ msg, onClose, position, isMe }) => {
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
                top: `${position.top - 80}px`, // Căn giữa theo chiều dọc
                left: isMe
                    ? `${position.left - 180}px`
                    : `${position.left + 50}px`, // Căn giữa theo chiều ngang
            }}
        >
            <div
                className="text-xs text-gray-500 px-4 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                    console.log("Chuyển tiếp tin nhắn", msg);
                    onClose();
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
