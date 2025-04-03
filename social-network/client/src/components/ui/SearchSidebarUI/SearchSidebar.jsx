import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setIsDropdownOpen(query.trim() !== "");
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Ô tìm kiếm */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className={`w-full bg-[var(--secondary-color)] px-4 py-2 pl-10 focus:outline-none shadow-md transition-all ${
                        isDropdownOpen ? "rounded-t-xl" : "rounded-xl"
                    }`}
                />
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary-color)]"
                    size={18}
                />
            </div>

            {/* Dropdown kết quả */}
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 bg-[var(--secondary-color)] shadow-lg z-10 overflow-hidden rounded-b-xl"
                >
                    <ul className="overflow-auto my-2">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <li
                                key={item}
                                className="flex items-center gap-3 p-2 mx-auto w-[93%] cursor-pointer rounded-lg hover:bg-[var(--button-color)] transition-all"
                            >
                                <img
                                    src="https://via.placeholder.com/40"
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-medium">Ngọc</p>
                                    <p className="text-[13px] text-[var(--text-secondary-color)]">
                                        • Đang theo dõi
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
