import React from "react";
import { X } from "lucide-react";
import emojiList from "~/components/emojiList";

const EmojiModal = ({
    isOpen,
    onClose,
    title,
    onEmojiSelect, // Callback để truyền emoji ra ngoài
}) => {
    if (!isOpen) return null; // Không render nếu modal không được mở

    return (
        <div className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50">
            <div className="bg-[var(--secondary-color)] rounded-lg w-[90%] max-w-md max-h-[80vh] p-4 relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* Nội dung Emoji */}
                <div className="grid grid-cols-5 gap-3">
                    {emojiList.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onEmojiSelect(emoji); // Gọi callback với emoji đã chọn
                                onClose(); // Đóng modal
                            }}
                            className="text-2xl hover:scale-110 transition-transform"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmojiModal;
