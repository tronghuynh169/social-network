import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import socket from "~/socket";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ImageModal from "./ImageModal";

const ChatBox = ({
    messages,
    setMessages,
    setMessage,
    message,
    isGroup,
    nameGroupChat,
    admin,
    onSend,
    selectedFiles,
    setSelectedFiles,
    currentUserId,
    conversationId,
    avatar,
}) => {
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const [viewingImage, setViewingImage] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        if (!conversationId) return;
        const handleReceiveMessage = (msg) => {
            if (msg.conversation === conversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        };
        socket.on("newMessage", handleReceiveMessage);
        return () => socket.off("newMessage", handleReceiveMessage);
    }, [conversationId, setMessages]);

    useEffect(() => {
        if (conversationId) {
            socket.emit("joinRoom", conversationId);
        }
    }, [conversationId]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
        }, 0);
        return () => clearTimeout(timeout);
    }, [messages]);

    return (
        <div className="flex-1 relative flex flex-col">
            <ChatHeader
                isGroup={isGroup}
                nameGroupChat={nameGroupChat}
                avatar={avatar}
                admin={admin}
            />
            <ScrollArea className="flex-1 overflow-auto px-6 py-4 text-sm space-y-2">
                <ChatMessages
                    messages={messages}
                    currentUserId={currentUserId}
                    isGroup={isGroup}
                    setViewingImage={setViewingImage}
                    setIsImageModalOpen={setIsImageModalOpen}
                />
                <div ref={bottomRef} />
            </ScrollArea>
            <ChatInput
                message={message}
                setMessage={setMessage}
                onSend={onSend}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                inputRef={inputRef}
            />
            <ImageModal
                isOpen={isImageModalOpen}
                image={viewingImage}
                onClose={() => {
                    setViewingImage(null);
                    setIsImageModalOpen(false);
                }}
            />
        </div>
    );
};

export default ChatBox;
