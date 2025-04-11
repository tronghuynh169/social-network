import React, { useState, useEffect } from "react";
import SearchFriendModal from "~/components/ui/MessageUI/SearchFriendModal";
import { useUser } from "~/context/UserContext";
import Sidebar from "~/components/ui/MessageUI/Sidebar";
import ChatBox from "~/components/ui/MessageUI/ChatBox";
import { useParams } from "react-router-dom";
import { getMessages, getConversationById } from "~/api/chat";
import { getProfileById } from "~/api/profile";
import { sendMessage } from "~/api/chat";

const MessagePage = () => {
    const { profile } = useUser();
    const { conversationId } = useParams();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [nameGroupChat, setNameGroupChat] = useState("");
    const [admin, setAdmin] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [imageFile, setImageFile] = useState(null);

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

            // Lấy profile từng user
            const fullMembers = await Promise.all(
                data.members.map(async (id) => {
                    const profile = await getProfileById(id);
                    return profile || { _id: id, fullName: "Không rõ" };
                })
            );

            // Gắn lại vào conversation
            data.members = fullMembers;
            setConversation(data);

            // 👇 Lấy thông tin admin
            if (data.admin) {
                const adminProfile = await getProfileById(data.admin);
                // Bạn có thể lưu vào state nếu muốn dùng trong ChatBox
                setAdmin(adminProfile); // cần tạo thêm useState admin
            }
        };

        if (conversationId) {
            fetchConversation();
        }
    }, [conversationId]);

    const handleSendMessage = async () => {
        if (!message.trim() && !imageFile) return;

        try {
            const newMsg = await sendMessage({
                conversationId,
                sender: profile._id,
                text: message,
                image: imageFile,
            });
            console.log(newMsg);
            setMessages((prev) => [
                ...prev,
                {
                    ...newMsg.data, // 👈 đảm bảo lấy data thật từ response
                    sender: profile._id,
                    senderName: profile.fullName,
                },
            ]);

            setMessage("");
            setImageFile(null);
        } catch (err) {
            console.error("❌ Gửi tin nhắn lỗi:", err);
        }
    };

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar trái */}
            <Sidebar setNameGroupChat={setNameGroupChat} />

            {/* Nội dung tin nhắn */}
            {conversationId ? (
                // Nếu đã chọn người, hiển thị ChatBox
                <ChatBox
                    message={message}
                    setMessage={setMessage}
                    messages={messages}
                    isGroup={conversation?.isGroup}
                    nameGroupChat={nameGroupChat}
                    admin={admin}
                    onSend={handleSendMessage}
                    setImageFile={setImageFile}
                    imageFile={imageFile}
                    currentUserId={profile._id}
                />
            ) : (
                // Nếu chưa chọn ai, hiển thị trang chờ
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
            {/* Modal tìm kiếm bạn bè */}
            {showModal && profile && (
                <SearchFriendModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    profileId={profile._id}
                />
            )}
        </div>
    );
};

export default MessagePage;
