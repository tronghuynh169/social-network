import { getUserConversations, createConversation } from "~/api/chat";
import socket from "~/socket";

export const handleStartPrivateChat = async ({
    currentUserId,
    friend,
    navigate,
}) => {
    if (!currentUserId || !friend?._id) return;

    try {
        const conversations = await getUserConversations(currentUserId);

        const existing = conversations.find(
            (conv) =>
                !conv.isGroup &&
                conv.members.includes(currentUserId) &&
                conv.members.includes(friend._id)
        );

        if (existing) {
            navigate(`/message/${existing._id}`);
        } else {
            const newConv = await createConversation({
                members: [currentUserId, friend._id],
                isGroup: false,
                name: friend.fullName,
                avatar: friend.avatar,
            });
            socket.emit("newGroupCreated", newConv);
            navigate(`/message/${newConv._id}`);
        }
    } catch (err) {
        console.error("Lỗi tạo cuộc trò chuyện 1-1:", err);
    }
};
