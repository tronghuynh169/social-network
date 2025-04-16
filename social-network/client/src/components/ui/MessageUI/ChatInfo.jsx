import React from "react";
import { ScrollArea } from "~/components/ui/scroll-area";

const ChatInfo = ({  }) => {
    return (
        <div className="w-[350px] border-l border-[var(--secondary-color)] bg-[var(--background-color)] flex flex-col h-full">
            {/* Header */}
            <div className="p-5 flex justify-between items-center border-b border-[var(--secondary-color)] h-[75px]">
                <h2 className="text-[20px] font-semibold">Chi tiết</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Group Info Section */}
                <div className="mb-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-2">
                            <span>Đổi tên nhóm</span>
                            <button className="bg-[var(--secondary-color)] hover:bg-[var(--button-color)] cursor-pointer py-2 px-3 text-sm rounded-lg">
                                Thay đổi
                            </button>
                        </div>
                        <div className="flex items-center p-2 hover:bg-[var(--secondary-color)] rounded cursor-pointer">
                            <input
                                type="checkbox"
                                id="mute-notifications"
                                className="mr-2"
                            />
                            <label htmlFor="mute-notifications">
                                Tắt thông báo về tin nhắn
                            </label>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-[var(--secondary-color)] my-4"></div>

                {/* Members Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Thành viên</h3>
                        <button className="text-sm text-[var(--button-enable-color)] hover:text-[var(--text-primary-color)] cursor-pointer">
                            Thêm người
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Admin */}
                        <div className="flex items-center p-2 hover:bg-[var(--secondary-color)] rounded cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                            <div>
                                <div className="font-medium">
                                    Rikka Takanashi
                                </div>
                                <div className="text-xs text-[var(--text-secondary-color)]">
                                    Quản trị viên · bfngoc.bfngoc
                                </div>
                            </div>
                        </div>

                        {/* Members */}
                        <div className="flex items-center p-2 hover:bg-[var(--secondary-color)] rounded cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                            <div>
                                <div className="font-medium">Hoàng Quân</div>
                                <div className="text-xs text-[var(--text-secondary-color)]">
                                    quannnvu275
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center p-2 hover:bg-[var(--secondary-color)] rounded cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                            <div>
                                <div className="font-medium">
                                    tronghuynh1609
                                </div>
                                <div className="text-xs text-[var(--text-secondary-color)]">
                                    tronghuynh1609
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Section */}
            <div className="p-4 border-t border-[var(--secondary-color)]">
                {/* Leave Chat Section */}
                <div className="mb-4">
                    <button className="w-full text-start text-[var(--text-button-color)] py-2 rounded font-medium cursor-pointer">
                        Rời khỏi đoạn chat
                    </button>
                    <p className="text-xs text-[var(--text-secondary-color)] mt-2">
                        Bạn sẽ không thể gửi hoặc nhận tin nhắn trừ khi có ai đó    
                        thêm bạn trở lại cuộc trò chuyện. Sẽ không có ai được
                        thông báo rằng bạn đã rời khỏi cuộc trò chuyện.
                    </p>
                </div>

                {/* Delete Chat */}
                <button className="w-full text-start text-[var(--text-button-color)] py-2 rounded font-medium cursor-pointer">
                    Xóa đoạn chat
                </button>
            </div>
        </div>
    );
};

export default ChatInfo;
