import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const AccordionItem = ({ title, children, isOpen, onClick }) => (
    <div>
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--secondary-color)] cursor-pointer"
        >
            <span className="font-medium">{title}</span>
            {isOpen ? (
                <ChevronDown
                    size={18}
                    className="text-[var(--text-secondary-color)]"
                />
            ) : (
                <ChevronRight
                    size={18}
                    className="text-[var(--text-secondary-color)]"
                />
            )}
        </button>
        {isOpen && <div className="px-4 py-2">{children}</div>}
    </div>
);

export default AccordionItem;
