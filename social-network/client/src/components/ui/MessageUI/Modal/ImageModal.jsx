import React from "react";
import { X, Download } from "lucide-react";

const ImageModal = ({ isOpen, image, onClose }) => {
    if (!isOpen || !image) return null;

    // Hàm tải ảnh về từ URL
    const handleDownload = async () => {
        try {
            const response = await fetch(image, { mode: "cors" });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            // Lấy tên file từ URL hoặc đặt tên mặc định
            const filename = image.split("/").pop() || "downloaded_image.jpg";
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
        }
    };

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

                <button
                    onClick={handleDownload}
                    className="absolute cursor-pointer bottom-2 right-2 bg-white/80 hover:bg-white text-black px-3 py-1 rounded flex items-center gap-1 text-sm font-medium"
                >
                    <Download size={16} />
                    Tải xuống
                </button>
            </div>
        </div>
    );
};

export default ImageModal;
