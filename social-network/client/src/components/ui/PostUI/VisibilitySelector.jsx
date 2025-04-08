import React, { useState } from 'react';
import { Globe, Users } from 'lucide-react';

const visibilityOptions = [
    { label: 'Công khai', value: 'public', icon: <Globe size={16} className="mr-2" /> },
    { label: 'Người theo dõi', value: 'followers', icon: <Users size={16}className="mr-2" /> },
];

const VisibilitySelector = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selected = visibilityOptions.find((opt) => opt.value === value) || visibilityOptions[0];

    return (
        <div className="flex justify-between items-center">
            <label>Ai có thể thấy bài viết của bạn?</label>
            <div className="relative inline-block text-left">
                {/* Button hiển thị lựa chọn */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-[150px] px-4 py-2 text-sm bg-[var(--primary-color)] text-white border border-[var(--border-color)] rounded-md"
                >
                    <span className="flex items-center">
                        {selected.icon}
                        {selected.label}
                    </span>
                </button>

                {/* Menu dropdown */}
                {isOpen && (
                    <div className="absolute z-10  w-full bg-[var(--primary-color)] border border-[var(--border-color)] rounded-md shadow-lg">
                        {visibilityOptions.map((option) => (
                            <div
                                key={option.value}
                                className="px-4 py-2 flex items-center text-sm text-white hover:bg-[var(--secondary-color)] cursor-pointer"
                                onClick={() => {
                                    event.stopPropagation()
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.icon}
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisibilitySelector;
