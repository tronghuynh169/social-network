import React from "react";
import { useCall } from "~/context/CallContext";
import socket from "~/socket";

const IncomingCallModal = () => {
    const {
        call,
        answerCall,
        leaveCall,
        setCallModalVisible,
        callMembers,
        setCallMembers,
        setCall,
        declineCall,
    } = useCall();

    if (!call?.isReceivingCall) return null;

    const handleAnswer = () => {
        answerCall();
        setCallModalVisible(true); // mở CallModal

        // Cập nhật lại danh sách member, ví dụ thêm người gọi vào danh sách nếu chưa có
        setCallMembers((prev) => {
            if (!prev.includes(call.from)) {
                return [...prev, call.from];
            }
            return prev;
        });

        // Đóng IncomingCallModal bằng cách xóa flag isReceivingCall
        setCall((prevCall) => ({ ...prevCall, isReceivingCall: false }));
    };

    return (
        <div className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50">
            <div className="bg-[var(--secondary-color)] rounded-lg w-[90%] max-w-md max-h-[80vh] p-4 relative overflow-hidden">
                <h2 className="text-lg font-semibold mb-4">
                    Có cuộc gọi đến từ: {call.from}
                </h2>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={declineCall}
                        className="bg-red-500 cursor-pointer px-4 py-2 rounded"
                    >
                        Từ chối
                    </button>
                    <button
                        onClick={handleAnswer}
                        className="bg-green-500 cursor-pointer px-4 py-2 rounded"
                    >
                        Trả lời
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
