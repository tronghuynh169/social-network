import React, { useState } from "react";
import { Bell, LogOut, Trash2 } from "lucide-react";
import ConfirmationModal from "../Modal/ConfirmationModal"; // Import a reusable modal component

const PrivacySection = ({
    admin,
    isGroup,
    myProfileId,
    handleRemoveMember,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");

    const handleLeaveChat = () => {
        if (admin._id === myProfileId) {
            // If the user is the admin, set warning message
            setModalContent(
                "Admin không thể rời nhóm. Vui lòng chuyển quyền admin cho người khác trước khi rời nhóm."
            );
            setIsModalOpen(true);
        } else {
            // Confirmation before leaving the chat
            setModalContent("Bạn có chắc chắn muốn rời đoạn chat này?");
            setIsModalOpen(true);
        }
    };

    const confirmAction = () => {
        if (admin._id !== myProfileId) {
            handleRemoveMember(myProfileId); // Proceed with leaving the chat
        }
        setIsModalOpen(false); // Close the modal
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
            {isGroup ? (
                admin._id === myProfileId ? (
                    <button className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full">
                        <Trash2 />
                        Xóa đoạn chat
                    </button>
                ) : (
                    ""
                )
            ) : (
                <button className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full">
                    <Trash2 />
                    Xóa đoạn chat
                </button>
            )}

            {/* Confirmation Modal */}
            {isModalOpen && (
                <ConfirmationModal
                    content={modalContent}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={confirmAction}
                    showConfirmButton={admin._id !== myProfileId} // Only show confirm button for non-admins
                />
            )}
        </div>
    );
};

export default PrivacySection;
