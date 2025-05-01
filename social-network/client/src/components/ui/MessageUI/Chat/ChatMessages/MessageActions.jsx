import React from "react";
import { Smile, Reply, MoreVertical } from "lucide-react";

const MessageActions = ({ msg, currentUserId, socket, setReplyMessage }) => {
    return (
        <>
            <button
                className="p-1 cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                onClick={() =>
                    socket.emit("likeMessage", {
                        messageId: msg._id,
                        userId: currentUserId,
                    })
                }
            >
                <Smile size={16} />
            </button>
            <button
                className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full"
                onClick={() => setReplyMessage(msg)}
            >
                <Reply size={20} />
            </button>
            <button className="cursor-pointer hover:bg-[var(--secondary-color)] rounded-full">
                <MoreVertical size={16} />
            </button>
        </>
    );
};

export default MessageActions;
