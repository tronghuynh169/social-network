import React from "react";
import { Phone, Video, Info } from "lucide-react";

const ChatHeader = ({
    isGroup,
    nameGroupChat,
    avatar,
    admin,
    onToggleInfo,
    showInfo,
    usersInfo, // Nhận usersInfo từ props
    conversationId,
}) => {
    const correctAvatar = isGroup
        ? avatar // Sử dụng avatar nhóm nếu là nhóm
        : usersInfo.find((user) => user.name === nameGroupChat)?.avatar ||
          avatar; // Tìm avatar cho cuộc trò chuyện cá nhân

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--secondary-color)] h-[75px]">
            <div className="flex items-center gap-3">
                {correctAvatar ? (
                    <img
                        src={correctAvatar}
                        alt="avatar"
                        className="w-11 h-11 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-11 h-11 rounded-full" />
                )}
                <div className="font-semibold">{nameGroupChat}</div>
            </div>
            <div className="flex gap-4">
                <Phone className="cursor-pointer" />
                <Video className="cursor-pointer" />
                <Info
                    className={`cursor-pointer rounded-full  ${
                        showInfo
                            ? "text-[var(--primary-color)] bg-[var(--text-primary-color)]"
                            : ""
                    }`} // Thêm điều kiện màu sắc
                    onClick={onToggleInfo}
                    isGroup={isGroup}
                    conversationId={conversationId}
                />
            </div>
        </div>
    );
};

export default ChatHeader;
