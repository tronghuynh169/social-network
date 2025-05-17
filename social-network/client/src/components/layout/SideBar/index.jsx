import React, { useState, memo, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Search,
    Compass,
    MessageCircle,
    Heart,
    PlusSquare,
    Users,
} from "lucide-react";
import Logo from "~/assets/img/Logo.png";
import LogoNoMochi from "~/assets/img/Logo-no-mochi.png";
import Mochi from "~/assets/img/Mochi.png";
import DropdownMenu from "~/components/ui/DropdownMenu";
import { useUser } from "~/context/UserContext";
import SearchBar from "~/components/ui/SearchSidebarUI/SearchSidebar";
import CreateMenuPost from "~/components/ui/PostUI/PostUpLoadUI/CreateMenuPost";
import SearchModal from "~/components/ui/SearchSidebarUI/SearchModal";
import NotificationModal from "../../ui/NotificationUI/NotificationModal";
import { getNotifications } from "~/api/notification";
import socket from "~/socket";

const Sidebar = memo(() => {
    const location = useLocation();
    const { user, avatar, profile } = useUser();
    const sidebarRef = useRef(null);
    const buttonRef = useRef(null);

    const [showCreateMenuPost, setShowCreateMenuPost] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [notificationModal, setNotificationModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Đếm số chưa đọc khi mount/profile đổi
    useEffect(() => {
        if (!profile?._id) return;
        getNotifications(profile._id).then((data) => {
            setUnreadCount(data.filter((n) => !n.isRead).length);
        });
    }, [profile]);

    // Lắng nghe socket newNotification CHỈ 1 LẦN và luôn fetch lại số chưa đọc
    useEffect(() => {
        if (!profile?._id) return;
        const handleNewNotification = (notify) => {
            console.log("Nhận được newNotification", notify);
            getNotifications(profile._id).then((data) => {
                setUnreadCount(data.filter((n) => !n.isRead).length);
            });
        };
        socket.on("newNotification", handleNewNotification);
        return () => socket.off("newNotification", handleNewNotification);
    }, [profile]);

    // Callback cho NotificationModal
    const handleMarkedAllRead = () => setUnreadCount(0);

    // Reset badge when modal closes (after markAllAsRead)
    const handleCloseNotificationModal = () => {
        setNotificationModal(false);
    };

    const handleToggleMenu = (e) => {
        e.stopPropagation();
        setShowCreateMenuPost((prev) => !prev);
    };

    useEffect(() => {
        if (location.pathname === "/message") {
            setIsCollapsed(true);
        } else setIsCollapsed(false);
    }, [location.pathname]);

    return (
        <div className="flex" ref={sidebarRef}>
            <div
                className={`h-screen ${
                    isCollapsed ? "w-16" : "w-64"
                } p-4 flex flex-col transition-all duration-300 ease-in-out z-50 justify-between`}
            >
                <div>
                    {/* Logo */}
                    <Link to="/" className="mb-6 flex justify-center mt-4">
                        {!isCollapsed ? (
                            <img src={Mochi} alt="Mochi" className="w-32 h-8" />
                        ) : (
                            <img
                                src={LogoNoMochi}
                                alt="Mochi"
                                className="w-8 h-8"
                            />
                        )}
                    </Link>

                    <nav className="flex flex-col space-y-1">
                        <TooltipWrapper
                            text="Trang chủ"
                            collapsed={isCollapsed}
                        >
                            <Link to="/">
                                <MenuItem
                                    icon={<Home size={24} />}
                                    text="Trang chủ"
                                    active={location.pathname === "/"}
                                    collapsed={isCollapsed}
                                    onClick={() => {
                                        setIsCollapsed(false);
                                        setNotificationModal(false);
                                    }}
                                />
                            </Link>
                        </TooltipWrapper>

                        <div className="relative">
                            {isCollapsed ? (
                                <TooltipWrapper text="Tìm kiếm" collapsed>
                                    <MenuItem
                                        icon={<Search size={24} />}
                                        text="Tìm kiếm"
                                        onClick={() =>
                                            setShowSearchModal((prev) => !prev)
                                        }
                                        collapsed
                                    />
                                </TooltipWrapper>
                            ) : (
                                <SearchBar />
                            )}

                            {showSearchModal && (
                                <SearchModal
                                    onClose={() => setShowSearchModal(false)}
                                />
                            )}
                        </div>

                        <TooltipWrapper text="Bạn bè" collapsed={isCollapsed}>
                            <Link to="/friend">
                                <MenuItem
                                    icon={<Users size={24} />}
                                    text="Bạn bè"
                                    active={location.pathname === "/friend"}
                                    collapsed={isCollapsed}
                                />
                            </Link>
                        </TooltipWrapper>

                        <TooltipWrapper text="Khám phá" collapsed={isCollapsed}>
                            <MenuItem
                                icon={<Compass size={24} />}
                                text="Khám phá"
                                collapsed={isCollapsed}
                            />
                        </TooltipWrapper>

                        <TooltipWrapper text="Tin nhắn" collapsed={isCollapsed}>
                            <Link to="/message">
                                <MenuItem
                                    icon={<MessageCircle size={24} />}
                                    text="Tin nhắn"
                                    active={location.pathname === "/message"}
                                    collapsed={isCollapsed}
                                    onClick={() => setIsCollapsed(true)}
                                />
                            </Link>
                        </TooltipWrapper>

                        {isCollapsed ? (
                            <TooltipWrapper text="Thông báo" collapsed>
                                <MenuItem
                                    icon={
                                        <div className="relative">
                                            <Heart size={24} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    }
                                    text="Thông báo"
                                    onClick={() => {
                                        setNotificationModal((prev) => !prev);
                                        if (location.pathname === "/message") {
                                            setIsCollapsed(true);
                                        } else {
                                            setIsCollapsed((prev) => !prev);
                                        }
                                    }}
                                    collapsed
                                />
                            </TooltipWrapper>
                        ) : (
                            <MenuItem
                                icon={
                                    <div className="relative">
                                        <Heart size={24} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                }
                                text="Thông báo"
                                onClick={() => {
                                    setNotificationModal((prev) => !prev);
                                    if (location.pathname === "/message") {
                                        setIsCollapsed(true);
                                    } else {
                                        setIsCollapsed((prev) => !prev);
                                    }
                                }}
                                collapsed={isCollapsed}
                            />
                        )}

                        {notificationModal && (
                            <NotificationModal
                                onClose={handleCloseNotificationModal}
                                onMarkedAllRead={handleMarkedAllRead}
                            />
                        )}

                        <TooltipWrapper
                            text="Tạo bài viết"
                            collapsed={isCollapsed}
                        >
                            <div className="relative">
                                <div ref={buttonRef}>
                                    <MenuItem
                                        icon={<PlusSquare size={24} />}
                                        text="Tạo"
                                        onClick={handleToggleMenu}
                                        collapsed={isCollapsed}
                                    />
                                </div>
                                {showCreateMenuPost && (
                                    <CreateMenuPost
                                        onClose={() =>
                                            setShowCreateMenuPost(false)
                                        }
                                    />
                                )}
                            </div>
                        </TooltipWrapper>

                        <TooltipWrapper
                            text={user ? "Trang cá nhân" : "Đăng nhập"}
                            collapsed={isCollapsed}
                        >
                            {user ? (
                                <Link to={`/${user.slug}`}>
                                    <MenuItem
                                        icon={
                                            <img
                                                src={avatar}
                                                className="rounded-full w-6 h-6"
                                                alt="Avatar"
                                            />
                                        }
                                        text="Trang cá nhân"
                                        active={
                                            location.pathname ===
                                            `/${user.slug}`
                                        }
                                        collapsed={isCollapsed}
                                    />
                                </Link>
                            ) : (
                                <Link to="/login">
                                    <MenuItem
                                        icon={<Users size={24} />}
                                        text="Đăng nhập"
                                        active={location.pathname === "/login"}
                                        collapsed={isCollapsed}
                                    />
                                </Link>
                            )}
                        </TooltipWrapper>
                    </nav>
                </div>

                <TooltipWrapper text={"Xem thêm"} collapsed={isCollapsed}>
                    <DropdownMenu collapsed={isCollapsed} />
                </TooltipWrapper>
            </div>
        </div>
    );
});

const MenuItem = memo(({ icon, text, active, collapsed, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center p-3 my-1 cursor-pointer rounded-lg space-x-3 hover:bg-[var(--secondary-color)] ${
            active ? "font-bold" : ""
        } transition-all duration-200`}
    >
        <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
        {!collapsed && <span className="whitespace-nowrap">{text}</span>}
    </div>
));

const TooltipWrapper = ({ children, text, collapsed }) => {
    if (!collapsed) return children;

    return (
        <div className="group relative flex justify-center">
            {children}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-black text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
                {text}
            </div>
        </div>
    );
};

export default Sidebar;
