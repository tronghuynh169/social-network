import React, { useState } from "react";
import { ThumbsUp } from "lucide-react";

const CustomizationSection = ({ handleOpenModal }) => {
    return (
        <div className="space-y-1 text-[15px]">
            <button
                onClick={handleOpenModal}
                className="flex items-center gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full"
            >
                <ThumbsUp />
                Thay đổi biểu tượng cảm xúc
            </button>
        </div>
    );
};

export default CustomizationSection;
