import React, { useRef, useState, useEffect } from "react";
import dayjs from "dayjs";
import MessageItem from "./MessageItem";

const shouldShowTime = (msg, index, messages) => {
    if (index === 0) return true;
    const prev = dayjs(messages[index - 1].createdAt);
    const curr = dayjs(msg.createdAt);
    return curr.diff(prev, "minute") >= 15;
};

const ChatMessages = ({
    messages,
    currentUserId,
    isGroup,
    setViewingImage,
    setIsImageModalOpen,
    setReplyMessage,
    setIsLikeModalOpen,
    setLikes,
    socket,
    setMessageId,
    openChatRoomsModal,
    setEditMessage,
}) => {
    const [activeMessageId, setActiveMessageId] = useState(null);
    const wrapperRef = useRef();
    const messageRefs = useRef({});
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "auto" }); // không mượt, nhảy ngay
        }
    }, [messages]);

    const scrollToMessage = (messageId) => {
        const el = messageRefs.current[messageId];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add(
                "bg-white",
                "scale-105",
                "transition",
                "duration-500"
            );
            setTimeout(() => el.classList.remove("bg-white", "scale-105"), 500);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setActiveMessageId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const lastSeenMap = {};
    messages.forEach((msg, i) => {
        msg.readBy?.forEach((user) => {
            if (user._id !== currentUserId) {
                lastSeenMap[user._id] = i;
            }
        });
    });

    return (
        <div ref={wrapperRef}>
            {messages.map((msg, index) => {
                const showTime = shouldShowTime(msg, index, messages);
                return (
                    <MessageItem
                        key={msg._id}
                        msg={msg}
                        index={index}
                        currentUserId={currentUserId}
                        isGroup={isGroup}
                        showTime={showTime}
                        messageRefs={messageRefs}
                        activeMessageId={activeMessageId}
                        setActiveMessageId={setActiveMessageId}
                        scrollToMessage={scrollToMessage}
                        setViewingImage={setViewingImage}
                        setIsImageModalOpen={setIsImageModalOpen}
                        setReplyMessage={setReplyMessage}
                        setIsLikeModalOpen={setIsLikeModalOpen}
                        setLikes={setLikes}
                        setMessageId={setMessageId}
                        socket={socket}
                        lastSeenMap={lastSeenMap}
                        openChatRoomsModal={openChatRoomsModal}
                        setEditMessage={setEditMessage}
                    />
                );
            })}
            <div ref={bottomRef} /> {/* Cuộn tới đây */}
        </div>
    );
};

export default ChatMessages;
