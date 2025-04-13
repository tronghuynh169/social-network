import React, { useEffect, useState } from "react";
import { SquarePen } from "lucide-react";
import { useUser } from "~/context/UserContext";
import { getUserConversations } from "~/api/chat";
import { getProfileById } from "~/api/profile";
import { useNavigate } from "react-router-dom";
import SearchFriendModal from "~/components/ui/MessageUI/SearchFriendModal";
import { useParams } from "react-router-dom";
import socket from "~/socket";

const Sidebar = ({ setNameGroupChat, messages, avatar }) => {
    const { conversationId } = useParams();
    const { profile } = useUser();
    const [usersInfo, setUsersInfo] = useState([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!profile?._id) return;

        const fetchConversations = async () => {
            const convs = await getUserConversations(profile._id);
            updateConversations(convs);
        };

        const updateConversations = (convs) => {
            const sortedConvs = convs.sort((a, b) => {
                const dateA = new Date(a.lastMessage?.createdAt || a.createdAt);
                const dateB = new Date(b.lastMessage?.createdAt || b.createdAt);
                return dateB - dateA;
            });

            // Lấy thông tin người dùng
            const userIdSet = new Set();
            sortedConvs.forEach((conv) => {
                conv.members.forEach((id) => {
                    if (id !== profile._id) userIdSet.add(id);
                });
            });

            const uniqueUserIds = Array.from(userIdSet);
            const fetchUsers = async () => {
                const users = await Promise.all(
                    uniqueUserIds.map((id) => getProfileById(id))
                );

                const userMap = {};
                users.forEach((user) => {
                    userMap[user._id] = user;
                });

                const merged = sortedConvs.map((conv) => {
                    const otherUsers = conv.members
                        .filter((id) => id !== profile._id)
                        .map((id) => userMap[id])
                        .filter(Boolean);

                    const isGroup = conv.isGroup;

                    return {
                        conversationId: conv._id,
                        name: isGroup
                            ? conv.name
                            : otherUsers.length === 1
                            ? otherUsers[0]?.fullName
                            : "Đối thoại riêng", // fallback
                        avatar: isGroup
                            ? conv.avatar
                            : otherUsers[0]?.avatar || "",
                        members: otherUsers,
                    };
                });

                setUsersInfo(merged);
            };

            fetchUsers();
        };

        // Gọi ngay khi component mount
        fetchConversations();

        // Lắng nghe tin nhắn mới qua socket
        socket.on("receiveMessage", () => {
            fetchConversations();
        });

        // Lắng nghe sự kiện tạo nhóm mới
        socket.on("newGroupCreated", () => {
            fetchConversations();
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("newGroupCreated");
        };
    }, [profile]);

    return (
        <div className="w-[25%] border-r border-[var(--secondary-color)] flex flex-col">
            <div className="pt-9 pb-3 px-6 font-bold text-[20px] flex items-center justify-between">
                <p>{profile.fullName}</p>
                <SquarePen
                    className="w-5 h-5 cursor-pointer"
                    onClick={() => setShowModal(true)}
                />
            </div>
            <div className="px-6 pt-3.5 pb-2.5 text-[16px] font-bold">
                Tin nhắn
            </div>
            <div className="flex-1 overflow-auto pt-3.5 pb-2.5">
                {usersInfo.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        Chưa có cuộc trò chuyện nào
                    </div>
                ) : (
                    usersInfo.map((info, idx) => {
                        return (
                            <div
                                key={info.conversationId || idx}
                                onClick={() => {
                                    setNameGroupChat(info.name); // Chỉ gọi khi click
                                    navigate(`/message/${info.conversationId}`);
                                }}
                                className={`cursor-pointer flex items-center gap-3 px-6 py-2 ${
                                    info.conversationId === conversationId
                                        ? "bg-[var(--secondary-color)]"
                                        : "hover:bg-[var(--secondary-color)]"
                                }`}
                            >
                                <img
                                    src={
                                        info.avatar && info.avatar.trim() !== ""
                                            ? info.avatar
                                            : "http://localhost:5173/images/avatar-default-user.png"
                                    }
                                    alt="avatar"
                                    className="w-14 h-14 rounded-full object-cover"
                                />
                                <div className="max-w-[80%] line-clamp-1">
                                    {info.name}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {showModal && profile && (
                <SearchFriendModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    profileId={profile._id}
                    avatar={avatar}
                />
            )}
        </div>
    );
};

export default Sidebar;
