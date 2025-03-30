import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const ViewAvatarModal = ({ isOpen, onClose, avatarUrl }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={true}
            contentLabel="Xem ảnh đại diện"
            className="fixed inset-0 flex items-center justify-center z-50 outline-none"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 modal-overlay transition-opacity duration-300"
        >
            <div
                className="relative bg-black p-4 rounded-lg shadow-lg max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="rounded-lg max-w-full max-h-[80vh] mx-auto object-contain"
                />
                <div className="flex justify-center mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ViewAvatarModal;
