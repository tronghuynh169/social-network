import React, { useState, useEffect } from "react";
import SearchFriendModal from "~/components/ui/MessageUI/SearchFriendModal";
import { useUser } from "~/context/UserContext";
import Sidebar from "~/components/ui/MessageUI/Sidebar";
import ChatBox from "~/components/ui/MessageUI/chat";
import ChatInfo from "~/components/ui/MessageUI/ChatInfo";
import { useParams, useNavigate } from "react-router-dom";
import { getMessages, getConversationById, uploadImage } from "~/api/chat";
import { getProfileById } from "~/api/profile";
import { io } from "socket.io-client";
import AddMemberModal from "../../components/ui/MessageUI/Modal/AddMemberModal";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const MessagePage = () => {
    const { profile } = useUser();
    const { conversationId } = useParams();
    const navigate = useNavigate();

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
        if (conversationId) {
            socket.emit("joinConversation", conversationId);

            socket.on("receiveMessage", (newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
            });
        }

        return () => {
            socket.off("receiveMessage");
        };
    }, [conversationId]);

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

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            <Sidebar
                setNameGroupChat={setNameGroupChat}
                messages={messages}
                avatar={avatar}
                setUsersInfo={setUsersInfo}
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
                    membersInfo={conversation?.members}
                    open={showAddMemberModal}
                    onClose={() => setShowAddMemberModal(false)}
                />
            )}
        </div>
    );
};

export default MessagePage;
