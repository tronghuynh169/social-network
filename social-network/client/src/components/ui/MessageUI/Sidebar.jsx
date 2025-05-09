import React, { useEffect, useState } from "react";
import { SquarePen } from "lucide-react";
import { useUser } from "~/context/UserContext";
import { getUserConversations } from "~/api/chat";
import { getProfileById } from "~/api/profile";
import { useNavigate } from "react-router-dom";
import SearchFriendModal from "~/components/ui/MessageUI/SearchFriendModal";
import { useParams } from "react-router-dom";
import socket from "~/socket";

const Sidebar = ({
    setNameGroupChat,
    messages,
    avatar,
    setUsersInfo: setUsersInfoProp,
    inputRef,
}) => {
    const { conversationId } = useParams();
    const { profile } = useUser();
    const [usersInfo, setUsersInfo] = useState([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleSelectChat = (conversationId, name) => {
        setNameGroupChat(name);
        navigate(`/message/${conversationId}`);
        inputRef.current?.focus();
    };

    const sortConversations = (conversations) => {
        return conversations.sort(
            (a, b) =>
                new Date(b.latestMessage?.createdAt || b.createdAt) -
                new Date(a.latestMessage?.createdAt || a.createdAt)
        );
    };

    useEffect(() => {
        if (!profile?._id) return;

        const fetchConversations = async () => {
            const convs = await getUserConversations(profile._id);
            updateConversations(convs);
        };

        const updateConversations = (convs) => {
            const sortedConvs = sortConversations(convs);

            // Lấy thông tin người dùng từ các cuộc trò chuyện
            const userIdSet = new Set();
            sortedConvs.forEach((conv) => {
                conv.members.forEach((id) => {
                    if (id !== profile._id) userIdSet.add(id);
                });
            });

            // Lấy danh sách thông tin người dùng
            const uniqueUserIds = Array.from(userIdSet);
            const fetchUsers = async () => {
                const users = await Promise.all(
                    uniqueUserIds.map((id) => getProfileById(id))
                );

                const userMap = {};
                users.forEach((user) => {
                    userMap[user._id] = user;
                });

                // Gộp thông tin người dùng vào danh sách cuộc trò chuyện
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
                            : "Đối thoại riêng",
                        avatar: isGroup
                            ? conv.avatar
                            : otherUsers.length > 0
                            ? otherUsers[0]?.avatar
                            : "http://localhost:5173/images/avatar-default-user.png",
                        members: otherUsers,
                        latestMessage: conv.latestMessage,
                    };
                });

                setUsersInfo(merged);
                setUsersInfoProp(merged);
            };

            fetchUsers();
        };

        // Gọi ngay khi component mount
        fetchConversations();

        // Lắng nghe sự kiện 'receiveMessage'
        socket.on("receiveMessage", (newMessage) => {
            setUsersInfo((prev) => {
                const updated = prev.map((conv) =>
                    conv.conversationId === newMessage.conversation
                        ? { ...conv, latestMessage: newMessage }
                        : conv
                );
                return sortConversations(updated);
            });
        });

        socket.on("conversationUpdated", (conv) => {
            setUsersInfo((prev) => {
                const exists = prev.some((c) => c.conversationId === conv._id);
                let updated = [];
                if (exists) {
                    updated = prev.map((c) =>
                        c.conversationId === conv._id
                            ? { ...c, latestMessage: conv.latestMessage }
                            : c
                    );
                } else {
                    const name = conv.isGroup
                        ? conv.name
                        : conv.members.find((m) => m._id !== profile._id)
                              ?.fullName || "Đối thoại riêng";
                    const av = conv.isGroup
                        ? conv.avatar
                        : conv.members.find((m) => m._id !== profile._id)
                              ?.avatar || "";
                    updated = [
                        {
                            conversationId: conv._id,
                            isGroup: conv.isGroup,
                            name,
                            avatar: av,
                            members: conv.members,
                            latestMessage: conv.latestMessage,
                        },
                        ...prev,
                    ];
                }
                return sortConversations(updated);
            });
        });

        // Lắng nghe sự kiện tạo nhóm mới
        socket.on("newGroupCreated", () => {
            fetchConversations();
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("conversationUpdated");
            socket.off("newGroupCreated");
        };
    }, [profile]);

    useEffect(() => {
        const handleConversationUpdated = (updatedConv) => {
            console.log("📢 Received conversationUpdated event:", updatedConv);

            setUsersInfo((prev) => {
                const exists = prev.some(
                    (c) => c.conversationId === updatedConv._id
                );

                let updated = [];
                if (exists) {
                    // Nếu cuộc trò chuyện đã tồn tại, cập nhật thông tin
                    updated = prev.map((c) =>
                        c.conversationId === updatedConv._id
                            ? {
                                  ...c,
                                  latestMessage: updatedConv.latestMessage,
                                  members: updatedConv.members,
                              }
                            : c
                    );
                } else {
                    // Nếu cuộc trò chuyện chưa tồn tại (thành viên mới), thêm vào danh sách
                    const name = updatedConv.isGroup
                        ? updatedConv.name
                        : updatedConv.members.find((m) => m._id !== profile._id)
                              ?.fullName || "Đối thoại riêng";
                    const avatar = updatedConv.isGroup
                        ? updatedConv.avatar
                        : updatedConv.members.find((m) => m._id !== profile._id)
                              ?.avatar ||
                          "http://localhost:5173/images/avatar-default-user.png";

                    updated = [
                        {
                            conversationId: updatedConv._id,
                            isGroup: updatedConv.isGroup,
                            name,
                            avatar,
                            members: updatedConv.members,
                            latestMessage: updatedConv.latestMessage,
                        },
                        ...prev,
                    ];
                }

                return updated.sort(
                    (a, b) =>
                        new Date(b.latestMessage?.createdAt || b.createdAt) -
                        new Date(a.latestMessage?.createdAt || a.createdAt)
                );
            });
        };

        // Lắng nghe sự kiện từ server
        socket.on("conversationUpdated", handleConversationUpdated);

        return () => {
            socket.off("conversationUpdated", handleConversationUpdated);
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
                                    handleSelectChat(
                                        info.conversationId,
                                        info.name
                                    );
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
                                <div className="max-w-[80%]">
                                    <p className="line-clamp-1 font-semibold">
                                        {info.name}
                                    </p>
                                    {info.latestMessage && (
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            {info.latestMessage.sender?._id ===
                                            profile._id
                                                ? "Bạn: "
                                                : `${
                                                      info.latestMessage.sender
                                                          ?.fullName ||
                                                      "Ẩn danh"
                                                  }: `}
                                            {info.latestMessage.text ||
                                                "[Đã gửi tệp]"}
                                        </p>
                                    )}
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
