import React from "react";
import Modal from "react-modal";
import { X } from "lucide-react";

const AvatarModal = ({ isOpen, onClose, avatar, fullName, bio }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Avatar Modal"
            className="bg-black bg-opacity-90 fixed inset-0 flex justify-center items-center"
            overlayClassName="bg-black bg-opacity-50 fixed inset-0"
        >
            <div className="relative bg-white p-6 rounded-lg shadow-lg text-center">
                {/* Nút đóng */}
                <button
                    className="absolute top-2 right-2 text-gray-700 hover:text-black"
                    onClick={onClose}
                >
                    <X size={24} />
                </button>

                {/* Avatar lớn */}
                <img
                    src={avatar || "https://via.placeholder.com/300"}
                    alt="Avatar"
                    className="w-72 h-72 rounded-full border-4 border-gray-700"
                />

                <h2 className="text-xl font-semibold mt-4">{fullName}</h2>
                <p className="text-gray-600">{bio || "Không có tiểu sử"}</p>

                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-md"
                >
                    Đóng
                </button>
            </div>
        </Modal>
    );
};

export default AvatarModal;
