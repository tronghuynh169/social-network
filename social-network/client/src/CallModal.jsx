import React from "react";
import { useCall } from "~/context/CallContext";

const CallModal = () => {
    const {
        callModalVisible,
        setCallModalVisible,
        callMembers,
        setCallMembers,
        leaveCall,
        userAudio,
    } = useCall();

    if (!callModalVisible) return null;

    return (
        <div className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50">
            <div className="bg-[var(--secondary-color)] rounded-lg w-[90%] max-w-md max-h-[80vh] p-4 relative overflow-hidden">
                <h2 className="text-xl font-semibold mb-4">
                    Danh sách người gọi
                </h2>
                {callMembers.length === 0 ? (
                    <p>Không có người nào trong cuộc gọi.</p>
                ) : (
                    <ul className="mb-4 max-h-48 overflow-auto">
                        {callMembers.map((userId) => (
                            <li
                                key={userId}
                                className="border-b border-gray-200 py-2"
                            >
                                {/* Bạn có thể thay userId bằng tên thật hoặc avatar nếu có */}
                                User ID:{" "}
                                <span className="font-medium">{userId}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <audio ref={userAudio} autoPlay />

                <p>Cuộc gọi đang diễn ra...</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={leaveCall}
                        className="px-4 py-2 bg-[var(--button-color)] rounded cursor-pointer"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={leaveCall}
                        className="px-4 py-2 bg-red-500 rounded cursor-pointer"
                    >
                        Rời cuộc gọi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallModal;
