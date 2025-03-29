import React from "react";
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
import { useUser } from "~/context/UserContext"; // Import context để lấy slug

const Sidebar = () => {
    const location = useLocation();
    const { user } = useUser(); // Lấy thông tin user từ context

    return (    
        <div className="h-screen w-64 bg-black text-white p-4 flex flex-col">
            {/* Logo */}
            <Link to="/">
                <img
                    src={Logo}
                    alt="Mochi"
                    className="w-32 h-auto mb-4 cursor-pointer"
                />
            </Link>

            {/* Menu Items */}
            <nav className="flex flex-col space-y-4">
                <Link to="/">
                    <MenuItem
                        icon={<Home size={24} />}
                        text="Trang chủ"
                        active={location.pathname === "/"}
                    />
                </Link>
                <MenuItem icon={<Search size={24} />} text="Tìm kiếm" />
                <Link to="/friend">
                    <MenuItem
                        icon={<Users size={24} />}
                        text="Bạn bè"
                        active={location.pathname === "/friend"}
                    />
                </Link>
                <MenuItem icon={<Compass size={24} />} text="Khám phá" />
                <MenuItem icon={<MessageCircle size={24} />} text="Tin nhắn" />
                <MenuItem icon={<Heart size={24} />} text="Thông báo" />
                <MenuItem icon={<PlusSquare size={24} />} text="Tạo" />

                {/* Avatar cá nhân */}
                {user ? (
                    <Link to={`/${user.slug}`}>
                        <MenuItem
                            icon={
                                <img
                                    src="https://via.placeholder.com/40"
                                    className="rounded-full w-6 h-6"
                                    alt="Avatar"
                                />
                            }
                            text="Trang cá nhân"
                            active={
                                location.pathname === `/${user.slug}`
                            }
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

            {/* Footer */}
            <DropdownMenu />
        </div>
    );
};

const MenuItem = ({ icon, text, active }) => (
    <div
        className={`flex items-center space-x-3 p-2 cursor-pointer hover:bg-gray-800 rounded-lg ${
            active ? "font-bold" : ""
        }`}
    >
        {icon}
        <span>{text}</span>
    </div>
);

export default Sidebar;
