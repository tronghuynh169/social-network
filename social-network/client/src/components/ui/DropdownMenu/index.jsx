import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    Settings,
    Bookmark,
    Moon,
    AlertCircle,
    Users,
    LogOut,
} from "lucide-react";

const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="relative mt-auto">
            {/* Nút 'Xem thêm' (không phải MenuItem) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center space-x-3 p-2 cursor-pointer rounded-lg
          hover:bg-gray-800
          ${isOpen ? "bg-gray-800" : ""}
        `}
            >
                <Menu size={24} />
                <span>Xem thêm</span>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#262626] text-white rounded-lg shadow-lg z-10">
                    <ul className="flex flex-col">
                        <MenuItem
                            icon={<Settings size={20} />}
                            text="Cài đặt"
                        />
                        <MenuItem
                            icon={<Users size={20} />}
                            text="Hoạt động của bạn"
                        />
                        <MenuItem icon={<Bookmark size={20} />} text="Đã lưu" />
                        <MenuItem
                            icon={<Moon size={20} />}
                            text="Chuyển chế độ"
                        />
                        <MenuItem
                            icon={<AlertCircle size={20} />}
                            text="Báo cáo sự cố"
                        />
                        <hr className="border-gray-700 my-2" />
                        <MenuItem
                            icon={<Users size={20} />}
                            text="Chuyển tài khoản"
                        />
                        <button onClick={handleLogout}>
                            <MenuItem
                                icon={<LogOut size={20} />}
                                text="Đăng xuất"
                            />
                        </button>
                    </ul>
                </div>
            )}
        </div>
    );
};

// Mỗi mục trong dropdown
const MenuItem = ({ icon, text }) => (
    <li className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer rounded-lg">
        {icon}
        <span>{text}</span>
    </li>
);

export default DropdownMenu;
