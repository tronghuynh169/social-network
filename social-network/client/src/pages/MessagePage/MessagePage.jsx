import React, { useState } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import {
    Phone,
    Video,
    Info,
    Smile,
    Mic,
    ImageIcon,
    Heart,
    SquarePen,
} from "lucide-react";

const MessagePage = () => {
    const [message, setMessage] = useState("");
    return (
        <div className="flex h-screen w-full">
            {/* Sidebar trái */}
            <div className="w-[25%] border-r border-[var(--secondary-color)] flex flex-col">
                <div className="pt-9 pb-3 px-6 font-bold text-[20px] flex items-center justify-between">
                    <p>bfngoc.bfngoc</p>
                    <SquarePen className="w-5 h-5 cursor-pointer" />
                </div>
                <div className="px-6 pt-3.5 pb-2.5 text-[16px] font-bold">
                    Tin nhắn
                </div>
                <div className="flex-1 overflow-auto pt-3.5 pb-2.5">
                    <div className="hover:bg-[var(--secondary-color)] cursor-pointer flex items-center gap-3 px-6 py-2">
                        <img
                            src="https://i.imgur.com/1ZQZ1Z1.png"
                            alt="avatar"
                            className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className=" max-w-[80%]">Gia Trần</div>
                    </div>
                </div>
            </div>

            {/* Nội dung tin nhắn */}
            <div className="flex-1 relative flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--secondary-color)]">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://i.imgur.com/1ZQZ1Z1.png"
                            alt="avatar"
                            className="w-11 h-11 rounded-full object-cover"
                        />
                        <div className="font-semibold">Gia Trần</div>
                    </div>
                    <div className="flex gap-4">
                        <Phone className="cursor-pointer" />
                        <Video className="cursor-pointer" />
                        <Info className="cursor-pointer" />
                    </div>
                </div>

                {/* Profile xem trang cá nhân */}
                <div className="flex flex-col items-center py-10 gap-2">
                    <img
                        src="https://i.imgur.com/1ZQZ1Z1.png"
                        alt="avatar"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    <div className="font-semibold text-[20px]">Gia Trần</div>
                    <button className="bg-[var(--secondary-color)] hover:bg-[var(--button-color)] cursor-pointer text-sm px-4 py-1.5 rounded-lg mt-2">
                        Xem trang cá nhân
                    </button>
                </div>

                {/* Tin nhắn */}
                <ScrollArea className="flex-1 overflow-auto px-6 py-4 text-sm">
                    <div className="text-center text-xs text-[var(--text-secondary-color)] mb-4">
                        00:56
                    </div>
                    <div className="bg-[var(--secondary-color)] px-3 py-2 rounded-2xl inline-block">
                        /silent ai dọ
                    </div>
                    <div className="text-right">
                        <span className="bg-[var(--message-me-color)] px-3 py-2 rounded-2xl inline-block">
                            hello
                        </span>
                    </div>
                </ScrollArea>

                {/* Input nhắn tin */}
                <div className="pl-4 pr-6 py-3 w-[96.5%] h-[44px] mx-auto mb-5 border rounded-full border-[var(--secondary-color)] flex items-center gap-3">
                    <Smile className="" />
                    <Input
                        placeholder="Nhắn tin..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-black text-white border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {message.trim() ? (
                        <button className="text-[var(--button-enable-color)] cursor-pointer hover:text-[var(--text-primary-color)]">
                            Send
                        </button>
                    ) : (
                        <>
                            <Mic className="cursor-pointer" />
                            <ImageIcon className="cursor-pointer" />
                            <Heart className="cursor-pointer" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagePage;
