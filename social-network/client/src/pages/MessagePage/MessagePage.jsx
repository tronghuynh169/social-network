import React, { useState } from "react";
import SearchFriendModal from "~/components/ui/MessageUI/SearchFriendModal";
import { useUser } from "~/context/UserContext";
import Sidebar from "~/components/ui/MessageUI/Sidebar";
import ChatBox from "~/components/ui/MessageUI/ChatBox";

const MessagePage = () => {
    const { profile } = useUser();
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar trái */}
            <Sidebar onSelectUser={setSelectedUser} />

            {/* Nội dung tin nhắn */}
            {selectedUser ? (
                // Nếu đã chọn người, hiển thị ChatBox
                <ChatBox
                    selectedUser={selectedUser}
                    message={message}
                    setMessage={setMessage}
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
                    onSelect={(user) => {
                        setSelectedUser(user.fullname);
                    }}
                />
            )}
        </div>
    );
};

export default MessagePage;
