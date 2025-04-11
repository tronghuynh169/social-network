import React, { useEffect, useState } from "react";
import { SquarePen } from "lucide-react";
import { useUser } from "~/context/UserContext";
import { getUserConversations } from "~/api/chat";
import { getProfileById } from "~/api/profile";
import { useNavigate } from "react-router-dom";
import SearchFriendModal from "~/components/ui/MessageUI/SearchFriendModal";

const Sidebar = ({ onSelectUser }) => {
    const { profile } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [usersInfo, setUsersInfo] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConversations = async () => {
            if (!profile?._id) return;

            const convs = await getUserConversations(profile._id);

            const filteredConvs = [];

            for (const conv of convs) {
                if (conv.isGroup) {
                    filteredConvs.push(conv); // luôn hiển thị nhóm
                } else {
                    // Kiểm tra có tin nhắn nào không
                    const hasMessage =
                        conv.lastMessage || conv.messages?.length > 0;

                    if (hasMessage) {
                        filteredConvs.push(conv); // chỉ thêm nếu có tin nhắn
                    }
                }
            }

            // Sau đó xử lý như bình thường
            const userIdSet = new Set();
            filteredConvs.forEach((conv) => {
                conv.members.forEach((id) => {
                    if (id !== profile._id) userIdSet.add(id);
                });
            });

            const uniqueUserIds = Array.from(userIdSet);
            const users = await Promise.all(
                uniqueUserIds.map((id) => getProfileById(id))
            );

            const userMap = {};
            users.forEach((user) => {
                userMap[user._id] = user;
            });

            const merged = filteredConvs.map((conv) => {
                const otherUsers = conv.members
                    .filter((id) => id !== profile._id)
                    .map((id) => userMap[id])
                    .filter(Boolean);

                return {
                    conversationId: conv._id,
                    name: conv.name,
                    members: otherUsers,
                };
            });

            setUsersInfo(merged);
        };

        fetchConversations();
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
                        const name =
                            info.name ||
                            info.members.map((u) => u?.fullName).join(", ");

                        return (
                            <div
                                key={info.conversationId || idx}
                                onClick={() =>
                                    navigate(`/message/${info.conversationId}`)
                                }
                                className="hover:bg-[var(--secondary-color)] cursor-pointer flex items-center gap-3 px-6 py-2"
                            >
                                <img
                                    src={
                                        info.avatar ||
                                        "http://localhost:5173/images/avatar-default-group.png"
                                    }
                                    alt="avatar"
                                    className="w-14 h-14 rounded-full object-cover"
                                />
                                <div className="max-w-[80%] line-clamp-1">
                                    {name}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {/* Modal tìm kiếm bạn bè */}
            {showModal && profile && (
                <SearchFriendModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    profileId={profile._id}
                    onSelect={(user) => {
                        setSelectedUser(user.fullname);
                    }}
                />
            )}
        </div>
    );
};

export default Sidebar;
