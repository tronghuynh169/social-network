import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import SearchBar from "./SearchSidebar";

const SearchModal = ({ onClose }) => {
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
                    <div className="text-3xl">Tìm kiếm</div>
                    <button onClick={onClose} className="cursor-pointer">
                        ✕
                    </button>
                </div>
                <SearchBar />
            </div>
        </div>,
        document.body
    );
};

export default SearchModal;
