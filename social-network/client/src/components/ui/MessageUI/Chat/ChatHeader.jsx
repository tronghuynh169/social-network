import React from "react";
import { Phone, Video, Info } from "lucide-react";

const ChatHeader = ({ isGroup, nameGroupChat, avatar, admin }) => {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--secondary-color)]">
            <div className="flex items-center gap-3">
                {avatar ? (
                    <img
                        src={avatar}
                        alt="avatar"
                        className="w-11 h-11 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-11 h-11 rounded-full bg-gray-400" />
                )}
                <div className="font-semibold">{nameGroupChat}</div>
            </div>
            <div className="flex gap-4">
                <Phone className="cursor-pointer" />
                <Video className="cursor-pointer" />
                <Info className="cursor-pointer" />
            </div>
        </div>
    );
};

export default ChatHeader;
