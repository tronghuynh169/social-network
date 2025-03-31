import React, { useState, useEffect, memo, useRef } from "react";
import { X } from "lucide-react";

const SearchSidebar = memo(({ isOpen }) => {
    console.log("SearchSidebar re-render");
    const [closing, setClosing] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setClosing(true);
            timeoutRef.current = setTimeout(() => setClosing(false), 500);
        } else {
            setClosing(false);
            clearTimeout(timeoutRef.current);
        }
    }, [isOpen]);

    return (
        <div
            className={`fixed top-0 left-[-180px] h-screen w-96 rounded-2xl bg-[var(--primary-color)] shadow-lg 
                transition-transform duration-300 ease-in-out z-10 border-[1px] border-[var(--secondary-color)]
                ${
                    isOpen
                        ? "search-slide-in"
                        : closing
                        ? "search-slide-out"
                        : "hidden"
                }`}
        >
            <div className="flex justify-between items-center p-4">
                <h2 className="text-[25px] font-semibold">Tìm kiếm</h2>
            </div>

            <input
                type="text"
                placeholder="Tìm kiếm"
                className="w-[90%] mx-auto mt-4 p-2 bg-[var(--button-color)] rounded-lg outline-none block "
            />

            <div className="mt-4 p-4 border-t-[1px] border-[var(--secondary-color)]">
                <div className="flex justify-between items-center">
                    <h3 className="text-[16px] font-bold">Mới đây</h3>
                    <p className="text-blue-500 cursor-pointer">Xóa tất cả</p>
                </div>

                <ul className="mt-2 space-y-2">
                    <button className="w-full flex justify-between items-center p-2 hover:bg-[var(--secondary-color)]">
                        <div className="flex items-center space-x-2">
                            <img src="" alt="avatar" />
                            <div>
                                <p className="font-bold text-sm">quannvu275</p>
                            </div>
                        </div>
                        <X size={16} className="cursor-pointer" />
                    </button>
                </ul>
            </div>
        </div>
    );
});

export default SearchSidebar;
