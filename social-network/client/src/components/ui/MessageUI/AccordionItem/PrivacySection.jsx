import React, { useState } from "react";
import { Bell, LogOut, Trash2 } from "lucide-react";
import ConfirmationModal from "../Modal/ConfirmationModal";
import socket from "~/socket";

const PrivacySection = ({
    admin,
    isGroup,
    myProfileId,
    handleRemoveMember,
    conversationId,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [onConfirmAction, setOnConfirmAction] = useState(null);
    const [showConfirmButton, setShowConfirmButton] = useState(true); // Thêm state để kiểm soát nút "Xác nhận"

    const handleDeleteConversation = () => {
        if (!conversationId) {
            alert("Không tìm thấy đoạn chat để xóa!"); // Thông báo lỗi nếu thiếu conversationId
            return;
        }

        setModalContent("Bạn có chắc chắn muốn xóa đoạn chat này?");
        setOnConfirmAction(() => () => {
            socket.emit("deleteConversation", { conversationId }, () => {
                alert("Đoạn chat đã được xóa thành công!"); // Có thể thay bằng react-toastify
            });
            setIsModalOpen(false);
        });
        setShowConfirmButton(true); // Hiển thị nút "Xác nhận" cho hành động hợp lệ
        setIsModalOpen(true);
    };

    const handleLeaveChat = () => {
        if (admin._id === myProfileId) {
            setModalContent(
                "Admin không thể rời nhóm. Vui lòng chuyển quyền admin cho người khác trước khi rời nhóm."
            );
            setOnConfirmAction(() => () => {
                setIsModalOpen(false);
            });
            setShowConfirmButton(false); // Ẩn nút "Xác nhận" vì hành động không hợp lệ
        } else {
            setModalContent("Bạn có chắc chắn muốn rời đoạn chat này?");
            setOnConfirmAction(() => () => {
                handleRemoveMember(myProfileId);
                setIsModalOpen(false);
            });
            setShowConfirmButton(true); // Hiển thị nút "Xác nhận" cho hành động hợp lệ
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-1">
            <button className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full">
                <Bell />
                Tắt thông báo
            </button>
            {isGroup && (
                <button
                    onClick={handleLeaveChat}
                    className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full"
                >
                    <LogOut />
                    Rời đoạn chat
                </button>
            )}
            {isGroup && admin._id === myProfileId && (
                <button
                    onClick={handleDeleteConversation}
                    className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full"
                >
                    <Trash2 />
                    Xóa đoạn chat
                </button>
            )}

            {!isGroup && (
                <button
                    onClick={handleDeleteConversation}
                    className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full"
                >
                    <Trash2 />
                    Xóa đoạn chat
                </button>
            )}

            {isModalOpen && (
                <ConfirmationModal
                    content={modalContent}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={onConfirmAction}
                    showConfirmButton={showConfirmButton} // Điều khiển hiển thị nút "Xác nhận"
                />
            )}
        </div>
    );
};

export default PrivacySection;
