import React, { useState, useEffect, useRef } from "react";
import SearchFriendModal from "~/components/ui/MessageUI/Modal/SearchFriendModal";
import { useUser } from "~/context/UserContext";
import Sidebar from "~/components/ui/MessageUI/Sidebar";
import ChatBox from "~/components/ui/MessageUI/chat";
import ChatInfo from "~/components/ui/MessageUI/ChatInfo";
import { useParams, useNavigate } from "react-router-dom";
import {
    getMessages,
    getConversationById,
    uploadImage,
    addMembersToConversation,
    getUserConversations,
    removeMemberFromConversation,
    changeAdmin,
    updateEmoji,
} from "~/api/chat";
import { getProfileById } from "~/api/profile";
import socket from "~/socket";
import AddMemberModal from "../../components/ui/MessageUI/Modal/AddMemberModal";
import EmojiModal from "~/components/EmojiModal";

const MessagePage = () => {
    const { profile } = useUser();
    const { conversationId } = useParams();
    const navigate = useNavigate();

    const inputRef = useRef(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [nameGroupChat, setNameGroupChat] = useState("");
    const [admin, setAdmin] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [avatar, setAvatar] = useState("");
    const [showInfo, setShowInfo] = useState(false);
    const [replyMessage, setReplyMessage] = useState(null);
    const [usersInfo, setUsersInfo] = useState([]);
    const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false); // Kiểm soát trạng thái modal
    const [selectedEmoji, setSelectedEmoji] = useState("👍"); // Lưu emoji đã chọn

    const handleOpenModal = () => {
        setIsEmojiModalOpen(true);
    };
    const handleCloseModal = () => setIsEmojiModalOpen(false);

    const handleEmojiSelect = async (emoji) => {
        try {
            setSelectedEmoji(emoji); // Cập nhật emoji trong state
            await updateEmoji(conversationId, emoji); // Gửi yêu cầu API cập nhật emoji

            socket.emit("emojiUpdated", { conversationId, emoji });
        } catch (error) {
            console.error("❌ Lỗi khi chọn emoji:", error);
        }
    };

    useEffect(() => {
        const fetchConversation = async () => {
            const data = await getConversationById(conversationId);
            setSelectedEmoji(data.emoji || "👍"); // Lấy emoji từ server
        };

        if (conversationId) {
            fetchConversation();
        }
    }, [conversationId]);

    useEffect(() => {
        const handleEmojiUpdated = ({ conversationId: updatedId, emoji }) => {
            if (updatedId === conversationId) {
                setSelectedEmoji(emoji); // Cập nhật emoji real-time
            }
        };

        // Lắng nghe sự kiện từ server
        socket.on("emojiUpdated", handleEmojiUpdated);

        return () => {
            socket.off("emojiUpdated", handleEmojiUpdated); // Gỡ bỏ sự kiện khi component unmount
        };
    }, [conversationId]);

    useEffect(() => {
        const fetchMessages = async () => {
            const data = await getMessages(conversationId);
            setMessages(data);
        };
        if (conversationId) {
            fetchMessages();
        }
    }, [conversationId]);

    useEffect(() => {
        const fetchConversation = async () => {
            const data = await getConversationById(conversationId);
            if (!data) return;

            if (!data.members.includes(profile._id)) {
                return navigate("/");
            }

            const fullMembers = await Promise.all(
                data.members.map(async (id) => {
                    const profile = await getProfileById(id);
                    return profile || { _id: id, fullName: "Không rõ" };
                })
            );

            data.members = fullMembers;
            setConversation(data);

            setNameGroupChat(
                data.isGroup
                    ? data.name
                    : fullMembers.find((m) => m._id !== profile._id)
                          ?.fullName || "Cuộc trò chuyện"
            );

            setAvatar(data.avatar);

            if (data.admin) {
                const adminProfile = await getProfileById(data.admin);
                setAdmin(adminProfile);
            }
        };

        if (conversationId) {
            fetchConversation();
        }
    }, [conversationId, profile._id]);

    useEffect(() => {
        const handleReceiveMessage = (newMessage) => {
            // Nếu đúng phòng thì thêm vào messages
            if (
                newMessage.conversation === conversationId ||
                newMessage.conversation?._id === conversationId
            ) {
                setMessages((prev) => [...prev, newMessage]);
            }
        };
        socket.on("receiveMessage", handleReceiveMessage);

        return () => socket.off("receiveMessage", handleReceiveMessage);
    });

    const handleSendMessage = async () => {
        if (!message.trim() && selectedFiles.length === 0) return;

        // Gửi text nếu có
        if (message.trim()) {
            const textMessage = {
                conversationId,
                sender: profile._id,
                text: message,
                files: [], // Không có file
                replyTo: replyMessage
                    ? {
                          _id: replyMessage._id,
                          text: replyMessage.text,
                          files: replyMessage.files,
                          sender: replyMessage.sender, // ✅ thêm dòng này
                      }
                    : null,
            };

            socket.emit("sendMessage", textMessage);
            setMessage("");
            setReplyMessage(null);
        }

        // Gửi từng file
        if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append("messages", file);

                let uploadedFile;
                try {
                    const res = await uploadImage(formData);
                    console.log("Upload response:", res);
                    uploadedFile = res.files[0]; // Giả sử server trả về {files: [...]}
                } catch (err) {
                    console.error("❌ Upload file thất bại:", err);
                    continue;
                }

                const fileMessage = {
                    conversationId,
                    sender: profile._id,
                    text: "", // Không có text
                    files: [uploadedFile], // Chỉ gửi 1 file
                    replyTo: replyMessage
                        ? {
                              _id: replyMessage._id,
                              text: replyMessage.text,
                              files: replyMessage.files,
                              sender: replyMessage.sender, // ✅ thêm dòng này
                          }
                        : null,
                };

                socket.emit("sendMessage", fileMessage);
            }
            setSelectedFiles([]);
            setReplyMessage(null); // Reset sau khi gửi file
        }
    };

    // Đoạn useEffect để đóng Chat Info nếu không có đoạn chat
    useEffect(() => {
        if (!conversationId) {
            setShowInfo(false); // Đóng Chat Info
        }
    }, [conversationId]);

    const handleAddMembers = async (selectedUsers) => {
        const newIds = selectedUsers.map((u) => u._id);
        try {
            // 1. Gửi request lên server để thêm thành viên
            const updatedConv = await addMembersToConversation(
                conversationId,
                newIds
            );

            if (!updatedConv) {
                console.error(
                    "Failed to add members: No updated conversation returned."
                );
                return;
            }

            // 2. Phát sự kiện qua Socket.IO để thông báo tới tất cả thành viên
            socket.emit("conversationUpdated", updatedConv);

            // 3. Cập nhật thông tin cuộc trò chuyện hiện tại trên giao diện
            setConversation(updatedConv);

            // 4. Lấy lại danh sách cuộc trò chuyện từ server để cập nhật Sidebar
            const updatedConversations = await getUserConversations(
                profile._id
            );
            updateSidebar(updatedConversations);

            // 5. Đóng modal thêm thành viên
            setShowAddMemberModal(false);
        } catch (err) {
            console.error("Error adding members:", err);
            alert("Không thể thêm thành viên. Vui lòng thử lại.");
        }
    };

    const updateSidebar = (updatedConversations) => {
        const sortedConvs = updatedConversations.sort((a, b) => {
            const dateA = new Date(a.latestMessage?.createdAt || a.createdAt);
            const dateB = new Date(b.latestMessage?.createdAt || b.createdAt);
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
        };

        fetchUsers();
    };

    useEffect(() => {
        const handleConversationUpdated = (updatedConv) => {
            if (updatedConv._id === conversationId) {
                setConversation(updatedConv);
                setUsersInfo((prev) =>
                    prev.map((c) =>
                        c.conversationId === conversationId
                            ? { ...c, members: updatedConv.members }
                            : c
                    )
                );
            }
        };

        // Listen for conversation updates
        socket.on("conversationUpdated", handleConversationUpdated);

        return () => {
            socket.off("conversationUpdated", handleConversationUpdated);
        };
    });

    const handleRemoveMember = async (memberId) => {
        try {
            const response = await removeMemberFromConversation(
                conversationId,
                memberId,
                profile._id
            );

            // Cập nhật giao diện
            const updatedConversation = response.conversation;
            setConversation(updatedConversation);

            // Cập nhật danh sách cuộc trò chuyện trong Sidebar
            const updatedConversations = await getUserConversations(
                profile._id
            );
            updateSidebar(updatedConversations);

            // Phát sự kiện qua Socket.IO để thông báo tới các thành viên khác
            socket.emit("conversationUpdated", updatedConversation);
        } catch (err) {
            console.error("❌ Lỗi xóa thành viên:", err);
            alert("Không thể xóa thành viên. Vui lòng thử lại.");
        }
    };

    useEffect(() => {
        if (conversationId) {
            // Lắng nghe sự kiện cập nhật cuộc trò chuyện hiện tại
            const handleConversationUpdated = (updatedConv) => {
                if (updatedConv._id === conversationId) {
                    setConversation(updatedConv); // Cập nhật giao diện
                    setUsersInfo((prev) =>
                        prev.map((conv) =>
                            conv.conversationId === conversationId
                                ? { ...conv, members: updatedConv.members }
                                : conv
                        )
                    );
                }
            };

            socket.on("conversationUpdated", handleConversationUpdated);

            return () => {
                socket.off("conversationUpdated", handleConversationUpdated);
            };
        }
    });

    useEffect(() => {
        const handleRemovedFromConversation = ({ conversationId, message }) => {
            if (conversationId === conversationId) {
                alert(message); // Hoặc sử dụng thư viện như react-toastify để hiển thị toast
                navigate("/"); // Điều hướng người dùng ra khỏi nhóm
            }
        };

        socket.on("removedFromConversation", handleRemovedFromConversation);

        return () => {
            socket.off(
                "removedFromConversation",
                handleRemovedFromConversation
            );
        };
    }, [conversationId, navigate]);

    useEffect(() => {
        const handleConversationDeleted = ({ conversationId }) => {
            if (conversationId === conversationId) {
                navigate("/message"); // Redirect the user to the homepage
            }
        };

        socket.on("conversationDeleted", handleConversationDeleted);

        return () => {
            socket.off("conversationDeleted", handleConversationDeleted);
        };
    }, [conversationId, navigate]);

    const handleChangeAdmin = async (newAdminId) => {
        if (newAdminId === admin._id) {
            return;
        }

        try {
            // Gọi API để đổi admin
            const updatedConversation = await changeAdmin(
                conversationId,
                newAdminId
            );

            // Phát sự kiện qua Socket.IO
            socket.emit("changeAdmin", {
                conversationId,
                newAdminId,
            });

            // Cập nhật giao diện nhóm ngay lập tức
            setConversation(updatedConversation);
            setAdmin(updatedConversation.admin);
        } catch (error) {
            alert("Không thể đổi quản trị viên. Vui lòng thử lại.");
        }
    };

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            <Sidebar
                setNameGroupChat={setNameGroupChat}
                messages={messages}
                avatar={avatar}
                setUsersInfo={setUsersInfo}
                inputRef={inputRef}
            />

            {/* Chat content */}
            {conversationId ? (
                <ChatBox
                    message={message}
                    setMessage={setMessage}
                    messages={messages}
                    setMessages={setMessages}
                    isGroup={conversation?.isGroup}
                    nameGroupChat={nameGroupChat}
                    admin={admin}
                    onSend={handleSendMessage}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    currentUserId={profile._id}
                    avatar={avatar}
                    conversationId={conversationId}
                    onToggleInfo={() => setShowInfo((prev) => !prev)}
                    showInfo={showInfo}
                    replyMessage={replyMessage}
                    setReplyMessage={setReplyMessage}
                    socket={socket}
                    usersInfo={usersInfo}
                    inputRef={inputRef}
                    emoji={selectedEmoji}
                />
            ) : (
                <div className="flex flex-col justify-center items-center flex-1">
                    <div className="bg-[var(--secondary-color)] p-5 rounded-full mb-4">
                        <svg
                            width="48"
                            height="48"
                            fill="#ffffff66"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 3C6.477 3 2 6.925 2 11.5c0 2.372 1.17 4.506 3.035 6.035a.5.5 0 0 1 .16.567L4.28 21.72a.75.75 0 0 0 .996.996l3.618-1.916a.5.5 0 0 1 .567.16A10.48 10.48 0 0 0 12 20c5.523 0 10-3.925 10-8.5S17.523 3 12 3Z" />
                        </svg>
                    </div>
                    <div className="text-xl font-semibold mb-1">
                        Tin nhắn của bạn
                    </div>
                    <div className="text-[var(--text-secondary-color)] text-sm mb-3 text-center">
                        Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[var(--button-enable-color)] hover:bg-blue-500 text-sm px-4 py-1.5 rounded-lg cursor-pointer"
                    >
                        Gửi tin nhắn
                    </button>
                </div>
            )}

            {showInfo && (
                <ChatInfo
                    nameGroupChat={nameGroupChat}
                    setNameGroupChat={setNameGroupChat}
                    admin={admin}
                    onClose={() => false}
                    isGroup={conversation?.isGroup}
                    membersInfo={conversation?.members}
                    conversationId={conversationId}
                    myProfileId={profile._id}
                    avatar={avatar}
                    usersInfo={usersInfo}
                    setShowAddMemberModal={setShowAddMemberModal}
                    handleRemoveMember={handleRemoveMember}
                    handleChangeAdmin={handleChangeAdmin}
                    handleOpenModal={handleOpenModal}
                />
            )}

            {/* Modal */}
            {showModal && profile && (
                <SearchFriendModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    profileId={profile._id}
                />
            )}

            {showAddMemberModal && (
                <AddMemberModal
                    open={showAddMemberModal}
                    onClose={() => setShowAddMemberModal(false)}
                    membersInfo={conversation?.members}
                    onSelect={handleAddMembers}
                />
            )}
            <EmojiModal
                isOpen={isEmojiModalOpen}
                onClose={handleCloseModal}
                title="Chọn biểu tượng cảm xúc"
                onEmojiSelect={handleEmojiSelect} // Truyền callback xử lý emoji đã chọn
            />
        </div>
    );
};

export default MessagePage;
