import React from "react";
import { Phone, Video, Info } from "lucide-react";
import { useCall } from "~/context/CallContext";

const ChatHeader = ({
    isGroup,
    nameGroupChat,
    avatar,
    admin,
    onToggleInfo,
    showInfo,
    usersInfo, // Nhận usersInfo từ props
    conversationId,
    currentUserId,
}) => {
    const { callUser } = useCall();

    const correctAvatar = isGroup
        ? avatar // Sử dụng avatar nhóm nếu là nhóm
        : usersInfo.find((user) => user.name === nameGroupChat)?.avatar ||
          avatar; // Tìm avatar cho cuộc trò chuyện cá nhân

    const handleCallGroup = () => {
        const currentConversation = usersInfo.find(
            (conv) => conv.conversationId === conversationId
        );

        if (!currentConversation) {
            alert("Không tìm thấy cuộc trò chuyện!");
            return;
        }

        // Giả sử members là mảng object user
        const membersToCall = currentConversation.members.filter(
            (user) => user._id !== currentUserId
        );

        if (membersToCall.length === 0) {
            alert("Không có thành viên nào để gọi!");
            return;
        }

        membersToCall.forEach((user) => {
            callUser(user._id);
        });
    };

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
                <span title="Gọi thoại" onClick={handleCallGroup}>
                    <Phone className="cursor-pointer" />
                </span>
                <span title="Gọi video">
                    <Video className="cursor-not-allowed" />
                </span>
                <span title="Thông tin về cuộc trò chuyện">
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
                </span>
            </div>
        </div>
    );
};

export default ChatHeader;
