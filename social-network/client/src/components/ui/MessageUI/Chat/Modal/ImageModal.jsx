import React from "react";
import { X } from "lucide-react";

const ImageModal = ({ isOpen, image, onClose }) => {
    if (!isOpen || !image) return null;

    return (
        <div
            className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <img
                    src={image}
                    alt="full-view"
                    className="max-w-[90vw] max-h-[90vh] rounded-lg"
                />
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-4 bg-[var(--button-color)] bg-opacity-50 p-2 rounded-full cursor-pointer"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ImageModal;
