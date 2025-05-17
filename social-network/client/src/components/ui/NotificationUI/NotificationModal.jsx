import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import {
    getNotifications,
    markAllAsRead,
    markAsRead,
} from "~/api/notification";
import { useUser } from "~/context/UserContext";
import socket from "~/socket";
import { useNavigate } from "react-router-dom";

// Helper để format time kiểu "1d", "3d", "1h", "1m"
function timeAgo(date) {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

const PAGE_SIZE = 10; // Số thông báo trên mỗi trang

const NotificationModal = ({ onClose, onMarkedAllRead, onSingleRead }) => {
    const { profile } = useUser();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [tab, setTab] = useState("all"); // all | unread
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Fetch notifications
    useEffect(() => {
        if (!profile?._id) return;
        setLoading(true);
        getNotifications(profile._id)
            .then((data) => {
                setNotifications(data);
                setVisibleCount(PAGE_SIZE); // Reset số hiển thị mỗi khi reload
            })
            .finally(() => setLoading(false));
    }, [profile]);

    // Lắng nghe notification mới khi modal mở
    useEffect(() => {
        if (!profile?._id) return;
        const handleNewNotification = () => {
            getNotifications(profile._id).then((data) => {
                setNotifications(data);
                setVisibleCount(PAGE_SIZE); // Reset về trang đầu khi có noti mới
            });
        };
        socket.on("newNotification", handleNewNotification);
        return () => socket.off("newNotification", handleNewNotification);
    }, [profile]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleMarkAllAsRead = async () => {
        if (!profile?._id) return;
        setMarking(true);
        try {
            await markAllAsRead(profile._id);
            // Refetch notifications
            const data = await getNotifications(profile._id);
            setNotifications(data);
            if (onMarkedAllRead) onMarkedAllRead();
            setVisibleCount(PAGE_SIZE); // Reset về trang đầu
        } catch (e) {
            alert("Có lỗi khi đánh dấu đã đọc hết!");
        }
        setMarking(false);
    };

    // Lọc thông báo theo tab
    const filteredNotifications =
        tab === "all" ? notifications : notifications.filter((n) => !n.isRead);

    // Chỉ hiện visibleCount đầu tiên
    const visibleNotifications = filteredNotifications.slice(0, visibleCount);

    // Có thông báo chưa đọc?
    const hasUnread = notifications.some((n) => !n.isRead);

    // Hiện nút "See previous notifications" nếu còn nhiều hơn visibleCount
    const hasMore = visibleCount < filteredNotifications.length;

    return ReactDOM.createPortal(
        <div className="fixed left-16 top-0 h-screen w-96 z-50">
            <div className="bg-[var(--primary-color)] h-full p-0 flex flex-col overflow-hidden border-r border-[#262626] shadow-[inset_-1px_0_0_rgba(255,255,255,0.2)]">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-[#262626]">
                    <div className="text-2xl font-bold">Thông báo</div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="cursor-pointer text-lg ml-2"
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center px-4 py-2 border-b border-[#262626] bg-[var(--primary-color)]">
                    <button
                        className={`mr-4 px-2 pb-1 text-base font-medium border-b-2 cursor-pointer ${
                            tab === "all"
                                ? "border-blue-500 text-white"
                                : "border-transparent text-gray-400"
                        }`}
                        onClick={() => setTab("all")}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`px-2 pb-1 text-base font-medium border-b-2 cursor-pointer ${
                            tab === "unread"
                                ? "border-blue-500 text-white"
                                : "border-transparent text-gray-400"
                        }`}
                        onClick={() => setTab("unread")}
                    >
                        Chưa đọc
                    </button>
                    {hasUnread && (
                        <div
                            className="ml-auto text-blue-500 font-medium cursor-pointer hover:underline"
                            onClick={handleMarkAllAsRead}
                        >
                            Đọc tất cả
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="flex-1 overflow-y-auto bg-[var(--primary-color)]">
                    {loading ? (
                        <div className="text-center text-gray-400 mt-12">
                            Đang tải...
                        </div>
                    ) : visibleNotifications.length === 0 ? (
                        <div className="text-center text-gray-400 mt-12">
                            {tab === "unread"
                                ? "No unread notifications."
                                : "No notifications."}
                        </div>
                    ) : (
                        <>
                            <div className="px-4 py-1 text-xs text-gray-400 font-bold mt-2 mb-2">
                                Mới nhất
                            </div>
                            <ul>
                                {visibleNotifications.map((n) => (
                                    <li
                                        key={n._id}
                                        className={`flex items-center gap-3 px-4 py-2 mb-1 rounded-lg cursor-pointer transition-all group ${
                                            n.isRead
                                                ? "bg-gray-800 opacity-80"
                                                : "bg-gray-700"
                                        } hover:bg-gray-600`}
                                        onClick={async () => {
                                            // Nếu chưa đọc thì mới xử lý
                                            if (!n.isRead) {
                                                setNotifications((prev) =>
                                                    prev.map((item) =>
                                                        item._id === n._id
                                                            ? {
                                                                  ...item,
                                                                  isRead: true,
                                                              }
                                                            : item
                                                    )
                                                );
                                                try {
                                                    await markAsRead(n._id);
                                                } catch (e) {
                                                    // rollback nếu muốn, hoặc show toast lỗi
                                                }
                                                // Gọi callback cập nhật badge
                                                if (onSingleRead)
                                                    onSingleRead();
                                            }
                                            // Điều hướng
                                            if (
                                                n.type === "message" &&
                                                n.data?.conversationId
                                            ) {
                                                onClose();
                                                navigate(
                                                    `/message/${n.data.conversationId}`
                                                );
                                            }
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div className="relative">
                                            <img
                                                src={
                                                    n.sender?.avatar ||
                                                    "/default-avatar.png"
                                                }
                                                alt=""
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </div>
                                        {/* Content + Time */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-white truncate">
                                                {n.content}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {timeAgo(n.createdAt)}
                                            </div>
                                        </div>
                                        {/* Unread dot */}
                                        {!n.isRead && (
                                            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block ml-2"></span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {hasMore && (
                                <button
                                    className="mx-4 mt-2 mb-4 w-[calc(100%-2rem)] block text-sm rounded bg-gray-800 text-white py-2 font-semibold hover:bg-gray-700 transition"
                                    onClick={() =>
                                        setVisibleCount((c) =>
                                            Math.min(
                                                c + PAGE_SIZE,
                                                filteredNotifications.length
                                            )
                                        )
                                    }
                                >
                                    See previous notifications
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NotificationModal;
