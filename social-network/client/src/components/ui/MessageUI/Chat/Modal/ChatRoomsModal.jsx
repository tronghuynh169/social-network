import React, { useState, useEffect } from "react";
import { getUserConversations } from "~/api/chat"; // Import hàm gọi API
import { X } from "lucide-react";

const ChatRoomsModal = ({ open, onClose, onSelectRoom, userId, usersInfo }) => {
    const [chatRooms, setChatRooms] = useState([]);
    console.log(usersInfo)
    useEffect(() => {
        if (open) {
            // Lấy danh sách các phòng chat từ API
            const fetchConversations = async () => {
                try {
                    const rooms = await getUserConversations(userId); // Gọi API lấy danh sách cuộc trò chuyện
                    setChatRooms(rooms);
                } catch (error) {
                    console.error(
                        "❌ Lỗi khi lấy danh sách cuộc trò chuyện:",
                        error
                    );
                }
            };

            fetchConversations();
        }
    }, [open, userId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50">
            <div className="bg-[var(--secondary-color)] rounded-lg max-w-sm w-full py-4 shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 px-4">
                    <h3 className="text-lg font-semibold mx-auto">
                        Chuyển tiếp
                    </h3>
                    <button className="cursor-pointer" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <ul className="max-h-64 overflow-y-auto">
                    {usersInfo.map((room) => (
                        <li
                            key={room._id}
                            className="flex items-center justify-between p-2 rounded hover:bg-[var(--button-color)] cursor-pointer"
                        >
                            {/* Avatar */}
                            <img
                                src={room.avatar || "/default-avatar.png"} // Đường dẫn avatar
                                alt={room.name || "Avatar"}
                                className="w-10 h-10 rounded-full mr-2"
                            />
                            {/* Tên phòng */}
                            <span className="truncate flex-1">
                                {room.name}
                            </span>
                            {/* Nút Send */}
                            <button
                                className="bg-[var(--button-enable-color)] w-16 h-8 flex items-center justify-center text-sm rounded-lg cursor-pointer"
                                onClick={() => {
                                    onSelectRoom(room);
                                }}
                            >
                                Send
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChatRoomsModal;
