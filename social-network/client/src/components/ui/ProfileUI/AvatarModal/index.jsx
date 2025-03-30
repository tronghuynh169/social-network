import React, { useRef, useState } from "react";
import Modal from "react-modal";
import PreviewImageModal from "./PreviewImageModal";
import ViewAvatarModal from "./ViewAvatarModal"; // Import modal mới
import { updateAvatar, deleteAvatar } from "~/api/avatar";
import { useUser } from "~/context/UserContext";

Modal.setAppElement("#root");

const AvatarSyncModal = ({
    isOpen,
    onClose,
    avatar,
    fullName,
    profileSlug,
    onAvatarUpdated,
}) => {
    const { setAvatar } = useUser();
    const fileInputRef = useRef(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isViewAvatarOpen, setIsViewAvatarOpen] = useState(false);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
                setPreviewModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const confirmAvatarChange = async () => {
        if (!selectedFile) return;

        try {
            const result = await updateAvatar(selectedFile, profileSlug);

            // ✅ Sửa lỗi: Chỉ gọi `onAvatarUpdated`, không gọi `setAvatar`
            if (onAvatarUpdated) {
                onAvatarUpdated(result.imageUrl);
            } else {
                console.error("onAvatarUpdated is not defined");
            }
            setAvatar(result.imageUrl);
        } catch (error) {
            console.error("Lỗi khi cập nhật avatar:", error);
            alert("Lỗi khi cập nhật avatar!");
        }

        setPreviewModalOpen(false);
        onClose();
    };

    // 🔴 Xử lý xóa ảnh khi bấm "Gỡ ảnh hiện tại"
    const handleRemoveAvatar = async () => {
        // Đường dẫn avatar mặc định (phải khớp với giá trị trong CSDL)
        const DEFAULT_AVATAR =
            "http://localhost:5173/images/default-avatar.png";

        // Kiểm tra nếu avatar hiện tại là mặc định
        if (avatar === DEFAULT_AVATAR) {
            alert("Không thể gỡ ảnh mặc định!");
            return; // Dừng hàm ngay tại đây
        }

        if (!window.confirm("Bạn có chắc muốn gỡ ảnh đại diện?")) return;

        try {
            await deleteAvatar(profileSlug);
            if (typeof onAvatarUpdated === "function") {
                onAvatarUpdated(DEFAULT_AVATAR); // Đặt lại avatar mặc định
            }
            setAvatar(DEFAULT_AVATAR);
        } catch (error) {
            console.error("Lỗi khi gỡ ảnh:", error);
            alert("Lỗi khi gỡ ảnh!");
        }
        onClose();
    };

    return (
        <>
            {/* Modal chính */}
            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                shouldCloseOnOverlayClick={true}
                contentLabel="Avatar Sync Modal"
                className="fixed inset-0 flex items-center justify-center z-50 outline-none"
                overlayClassName="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay transition-opacity duration-300"
            >
                <div
                    className="relative bg-[var(--secondary-color)] rounded-lg w-96 max-w-full mx-4 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 flex flex-col items-center">
                        <img
                            src={avatar}
                            alt="Avatar"
                            className="cursor-pointer rounded-full h-24 w-24 object-cover mx-auto"
                            onClick={() => setIsViewAvatarOpen(true)}
                        />
                        <p className="text-center mt-4 text-[20px]">
                            Ảnh đại diện của {fullName}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="divide-y divide-[#363636]">
                        <button
                            onClick={() => setIsViewAvatarOpen(true)}
                            className="py-4 px-px text-[14px] text-[#0095f6] flex items-center justify-center w-full cursor-pointer border-t border-[#363636] hover:bg-[#363636] transition-colors"
                        >
                            <span>Xem ảnh đại diện</span>
                        </button>

                        <button
                            onClick={handleUploadClick}
                            className="py-4 px-px text-[14px] text-[#0095f6] flex items-center justify-center w-full cursor-pointer hover:bg-[#363636] transition-colors"
                        >
                            <span>Tải ảnh lên</span>
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* 🔴 Nút Gỡ ảnh */}
                        <button
                            onClick={handleRemoveAvatar}
                            className="py-4 px-px text-[14px] flex items-center justify-center w-full text-red-500 cursor-pointer"
                        >
                            <span>Gỡ ảnh hiện tại</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-center border-t border-[#363636]">
                        <button
                            onClick={onClose}
                            className="py-4 px-44 text-[14px] text-gray-500 cursor-pointer hover:text-white transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal preview ảnh */}
            <PreviewImageModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                previewImage={previewImage}
                onConfirm={confirmAvatarChange}
            />

            {/* Modal xem ảnh lớn (đã tách ra file riêng) */}
            <ViewAvatarModal
                isOpen={isViewAvatarOpen}
                onClose={() => setIsViewAvatarOpen(false)}
                avatarUrl={avatar}
            />
        </>
    );
};

export default AvatarSyncModal;
