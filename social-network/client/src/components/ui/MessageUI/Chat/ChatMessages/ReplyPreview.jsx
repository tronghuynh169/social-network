import React from "react";
import { Reply } from "lucide-react";

const ReplyPreview = ({ msg, currentUserId, scrollToMessage, isMe }) => {
    return (
        <div
            className={`mb-1 flex flex-col gap-1 ${
                isMe ? "items-end" : "items-start"
            } cursor-pointer`}
            onClick={() => scrollToMessage(msg.replyTo._id)}
        >
            <div className="text-sm font-semibold flex items-center gap-1 text-[var(--text-secondary-color)]">
                <Reply size={16} />
                {msg.sender?._id === currentUserId
                    ? "Bạn đang trả lời chính mình"
                    : `${msg.sender?.fullName} đang trả lời ${
                          msg.replyTo.sender?._id === currentUserId
                              ? "bạn"
                              : msg.replyTo.sender?.fullName || "người dùng"
                      }`}
            </div>
            <div
                className={`${
                    isMe ? "border-r-4 pr-2" : "border-l-4 pl-2"
                } border-[var(--secondary-color)]`}
            >
                <div className="text-sm text-[var(--text-secondary-color)] bg-[var(--secondary-color)] px-3 py-1 rounded-full max-w-full">
                    {msg.replyTo.text ||
                        msg.replyTo.files?.[0]?.name ||
                        "Tin nhắn đã bị xóa"}
                </div>
            </div>
        </div>
    );
};

export default ReplyPreview;
