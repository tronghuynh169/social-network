import React from "react";
import { Bell, LogOut, Trash2 } from "lucide-react";

const PrivacySection = ({ admin, isGroup, myProfileId }) => (
    <div className="space-y-1">
        <button className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full">
            <Bell />
            Tắt thông báo
        </button>
        {isGroup && (
            <button className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full">
                <LogOut />
                Rời đoạn chat
            </button>
        )}
        {isGroup ? (
            admin._id === myProfileId ? (
                <button className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full">
                    <Trash2 />
                    Xóa đoạn chat
                </button>
            ) : (
                ""
            )
        ) : (
            <button className="flex gap-3 hover:bg-[var(--secondary-color)] cursor-pointer rounded-lg px-2 py-3 w-full">
                <Trash2 />
                Xóa đoạn chat
            </button>
        )}
    </div>
);

export default PrivacySection;
