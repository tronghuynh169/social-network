import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    Menu,
    Settings,
    Bookmark,
    Moon,
    AlertCircle,
    Users,
    LogOut,
} from "lucide-react";

const DropdownMenu = ({ isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="relative mt-auto" ref={dropdownRef}>
            {/* Nút Xem thêm */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-3 p-2 cursor-pointer rounded-lg hover:bg-[var(--button-color)] ${
                    isOpen ? "hover:bg-[var(--button-color)]" : ""
                } transition-all duration-300 ease-in-out`}
            >
                <Menu size={24} />
                {!isCollapsed && (
                    <span className="transition-opacity duration-300">
                        Xem thêm
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-[var(--secondary-color)] rounded-lg shadow-lg z-10">
                    <ul className="flex flex-col my-2">
                        <Link to="/account/edit-profile">
                            <MenuItem
                                icon={<Settings size={20} />}
                                text="Cài đặt"
                            />
                        </Link>
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
const MenuItem = ({ icon, text, isCollapsed }) => (
    <li
        className={`flex items-center mx-auto w-[95%] p-3 cursor-pointer rounded-lg hover:bg-[var(--button-color)] transition-all duration-300 ease-in-out ${
            isCollapsed ? "justify-center" : "space-x-3"
        }`}
    >
        {icon}
        {!isCollapsed && (
            <span className="transition-opacity duration-300">{text}</span>
        )}
    </li>
);

export default DropdownMenu;
