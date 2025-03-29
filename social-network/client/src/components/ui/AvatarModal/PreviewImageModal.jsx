import React from "react";
import Modal from "react-modal";

const PreviewImageModal = ({ isOpen, onClose, previewImage, onConfirm }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Preview Avatar"
            className="fixed inset-0 flex items-center justify-center z-50 outline-none"
            overlayClassName="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay transition-opacity duration-300"
        >
            <div className="relative bg-[var(--secondary-color)] rounded-lg w-96 max-w-full mx-4 p-6">
                <h2 className="text-xl font-bold mb-4">
                    Xem trước ảnh đại diện mới
                </h2>

                <div className="flex justify-center mb-6">
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="rounded-full h-48 w-48 object-cover border-2 border-gray-200"
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PreviewImageModal;
