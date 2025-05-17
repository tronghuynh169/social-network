import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { getNotifications, markAllAsRead } from "~/api/notification";
import { useUser } from "~/context/UserContext";

const NotificationModal = ({ onClose, onMarkedAllRead }) => {
    const { profile } = useUser();
    const [notifications, setNotifications] = useState([]);
    const notificationsRef = useRef([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?._id) return;
        markAllAsRead(profile._id).then(() => {
            getNotifications(profile._id)
                .then((data) => {
                    setNotifications(data);
                    notificationsRef.current = data;
                    if (onMarkedAllRead) onMarkedAllRead();
                })
                .finally(() => setLoading(false));
        });
    }, [profile]);

    // Đánh dấu đã đọc khi mở modal
    useEffect(() => {
        if (!profile?._id) return;
        // Gọi API đánh dấu tất cả đã đọc
        markAllAsRead(profile._id).then(() => {
            // Sau khi mark as read, fetch lại notifications
            getNotifications(profile._id)
                .then((data) => {
                    setNotifications(data);
                    notificationsRef.current = data;
                })
                .finally(() => setLoading(false));
        });
    }, [profile]);

    // Cập nhật ref khi notifications thay đổi
    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return ReactDOM.createPortal(
        <div className="fixed left-16 top-0 h-screen w-96 z-50">
            <div className="bg-[var(--primary-color)] h-full p-4 relative overflow-hidden border-r border-[#262626] shadow-[inset_-1px_0_0_rgba(255,255,255,0.2)]">
                <div className="mb-3 flex justify-between items-center">
                    <div className="text-3xl">Thông báo</div>
                    <button onClick={onClose} className="cursor-pointer">
                        ✕
                    </button>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-64px)]">
                    {loading ? (
                        <div className="text-center text-gray-400 mt-12">
                            Đang tải...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center text-gray-400 mt-12">
                            Không có thông báo nào.
                        </div>
                    ) : (
                        <ul>
                            {notifications.map((n) => (
                                <li
                                    key={n._id}
                                    className={`p-3 mb-2 rounded cursor-pointer transition-all ${
                                        n.isRead
                                            ? "bg-gray-800 opacity-60"
                                            : "bg-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {n.sender?.avatar && (
                                            <img
                                                src={n.sender.avatar}
                                                alt=""
                                                className="w-8 h-8 rounded-full"
                                            />
                                        )}
                                        <span>{n.content}</span>
                                    </div>
                                    <div className="text-xs text-right text-gray-400">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NotificationModal;
