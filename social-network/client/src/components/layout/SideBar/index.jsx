import React, { useState, memo, useEffect, useRef } from "react";
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
import DropdownMenu from "~/components/ui/DropdownMenu";
import { useUser } from "~/context/UserContext";
import PostUpload from "~/pages/PostPage/PostUpload";
import PostMenu from "~/pages/PostPage/PostMenu";
import { uploadPost } from "~/api/post"; // Import hàm uploadPost từ API
import SearchBar from "~/components/ui/SearchSidebarUI/SearchSidebar";

const Sidebar = memo(() => {
    const location = useLocation();
    const { user, avatar } = useUser();
    const sidebarRef = useRef(null); // 🔥 Thêm ref cho sidebar
    const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
    const [isPostUploadOpen, setIsPostUploadOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("render");
        setIsPostMenuOpen((prev) => !prev);
    };

    // Hàm xử lý upload bài viết
    const handleUploadPost = async (files, caption) => {
        try {
            const response = await uploadPost(files, caption);
            return !!response; // Trả về true nếu upload thành công
        } catch (error) {
            console.error("Upload failed:", error);
            return false;
        }
    };

    // Đóng menu khi click ra ngoài
    // Đóng menu khi click ra ngoài (không đóng nếu bấm vào nút "Tạo")
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target) // ✅ Không đóng nếu bấm nút "Tạo"
            ) {
                setTimeout(() => setIsPostMenuOpen(false), 50);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex" ref={sidebarRef}>
            {" "}
            {/* 🔥 Thêm ref vào đây */}
            {/* Sidebar chính */}
            <div
                className={`h-screen w-full p-4 flex flex-col transition-all duration-300 ease-in-out z-50`}
            >
                {/* Logo */}
                <Link to="/">
                    <img
                        src={Logo}
                        alt="Mochi"
                        className="w-32 h-auto mb-4 cursor-pointer"
                    />
                </Link>

                <nav className="flex flex-col">
                    <Link to="/">
                        <MenuItem
                            icon={<Home size={24} />}
                            text="Trang chủ"
                            active={location.pathname === "/"}
                        />
                    </Link>
                    <div>
                        <SearchBar />
                    </div>
                    <Link to="/friend">
                        <MenuItem
                            icon={<Users size={24} />}
                            text="Bạn bè"
                            active={location.pathname === "/friend"}
                        />
                    </Link>
                    <MenuItem icon={<Compass size={24} />} text="Khám phá" />
                    <MenuItem
                        icon={<MessageCircle size={24} />}
                        text="Tin nhắn"
                    />
                    <MenuItem icon={<Heart size={24} />} text="Thông báo" />
                    <div className="relative" ref={menuRef}>
                        <MenuItem
                            ref={buttonRef}
                            icon={<PlusSquare size={24} />}
                            text="Tạo"
                            onClick={handleMenuToggle} // Toggle menu
                        />

                        {isPostMenuOpen && (
                            <PostMenu
                                isOpen={isPostMenuOpen}
                                onClose={() => setIsPostMenuOpen(false)}
                                onSelectPost={() => {
                                    setIsPostUploadOpen(true);
                                    setIsPostMenuOpen(false);
                                }}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: "100%",
                                    marginTop: "8px",
                                    zIndex: 50,
                                }}
                            />
                        )}

                        {isPostUploadOpen && (
                            <PostUpload
                                isOpen={isPostUploadOpen}
                                onClose={() => setIsPostUploadOpen(false)}
                                uploadPost={uploadPost}
                            />
                        )}
                    </div>

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
                                active={location.pathname === `/${user.slug}`}
                            />
                        </Link>
                    ) : (
                        <Link to="/login">
                            <MenuItem
                                icon={<Users size={24} />}
                                text="Đăng nhập"
                                active={location.pathname === "/login"}
                            />
                        </Link>
                    )}
                </nav>

                <DropdownMenu />
            </div>
            {/* Sidebar tìm kiếm */}
        </div>
    );
});

const MenuItem = memo(({ icon, text, active, hidden, collapsed, onClick }) => (
    <div
        onClick={onClick} // Đảm bảo có dòng này
        className={`flex items-center p-2 py-3 my-1 cursor-pointer rounded-lg space-x-3 ${
            active ? "font-bold" : ""
        } transition-all duration-300 ease-in-out`}
    >
        <div className="w-6 h-6 flex items-center justify-center">
            {typeof Icon === "function" ? <Icon size={24} /> : icon}
        </div>
        {!hidden && (
            <span
                className={`${
                    collapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100 w-auto"
                } transition-all duration-300 ease-in-out`}
            >
                {text}
            </span>
        )}
    </div>
));

export default Sidebar;
