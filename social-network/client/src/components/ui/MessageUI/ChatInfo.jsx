import React from "react";
import { Bell, Search } from "lucide-react";
import ChatDetailsSidebar from "./ChatDetailsSidebar";

const ChatInfo = ({
    avatar,
    nameGroupChat,
    setNameGroupChat,
    admin,
    isGroup,
    usersInfo,
    membersInfo,
    myProfileId,
    setShowAddMemberModal,
    conversationId,
    handleRemoveMember,
}) => {
    const correctAvatar = isGroup
        ? avatar // Sử dụng avatar nhóm nếu là nhóm
        : usersInfo.find((user) => user.name === nameGroupChat)?.avatar ||
          avatar; // Tìm avatar cho cuộc trò chuyện cá nhân

    return (
        <div className="w-[350px] border-l border-[var(--secondary-color)] bg-[var(--background-color)] flex flex-col h-full overflow-auto">
            {/* Header */}
            <div className="flex flex-col items-center p-5 border-[var(--secondary-color)]">
                <img
                    src={correctAvatar}
                    alt={nameGroupChat}
                    className="rounded-full mb-2 w-20 h-20"
                />
                <h2 className="text-lg font-semibold mb-1 text-center">
                    {nameGroupChat}
                </h2>

                {/* Buttons */}
                <div className="flex items-center gap-6 mt-4">
                    <button className="flex flex-col items-center text-xs cursor-pointer">
                        <Bell size={20} />
                        Mute
                    </button>
                    <button className="flex flex-col items-center text-xs cursor-pointer">
                        <Search size={20} />
                        Search
                    </button>
                </div>
            </div>

            <ChatDetailsSidebar
                admin={admin}
                membersInfo={membersInfo}
                isGroup={isGroup}
                myProfileId={myProfileId}
                usersInfo={usersInfo}
                setShowAddMemberModal={setShowAddMemberModal}
                conversationId={conversationId}
                handleRemoveMember={handleRemoveMember}
            />
        </div>
    );
};

export default ChatInfo;
