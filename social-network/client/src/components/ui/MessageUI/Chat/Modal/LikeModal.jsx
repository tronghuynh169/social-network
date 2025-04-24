import React from "react";
import { Heart, X } from "lucide-react";
import { Link } from "react-router-dom";

const LikeModal = ({ isOpen, likes, onClose, currentUserId, onUnlike }) => {
    if (!isOpen || !likes) return null;

    return (
        <div className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50">
            <div className="bg-[var(--secondary-color)] rounded-lg max-w-sm w-full py-4 shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 px-4">
                    <h3 className="text-lg font-semibold mx-auto">Cảm xúc</h3>
                    <button className="cursor-pointer" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-64 overflow-y-auto">
                    {likes.map((user, index) => (
                        <div
                            key={index}
                            className="py-3 px-5 flex items-center gap-3 mb-3 hover:bg-[var(--button-color)] cursor-pointer"
                        >
                            {/* Avatar */}
                            <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full border border-gray-600"
                            />
                            {/* User Info */}
                            <div className="flex-1">
                                {user._id === currentUserId ? (
                                    <div
                                        onClick={() => {
                                            onUnlike(user._id); // Gỡ like
                                            onClose(); // Đóng modal
                                        }}
                                    >
                                        <p className="font-medium text-sm">
                                            {user.fullName}
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary-color)] cursor-pointer">
                                            Chọn để gỡ
                                        </p>
                                    </div>
                                ) : (
                                    <Link to={`/${user.slug}`}>
                                        <p className="font-medium text-sm">
                                            {user.fullName}
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary-color)] cursor-pointer">
                                            Xem trang cá nhân
                                        </p>
                                    </Link>
                                )}
                            </div>
                            {/* Reaction Icon */}
                            <Heart size={18} color="red" fill="red" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LikeModal;
