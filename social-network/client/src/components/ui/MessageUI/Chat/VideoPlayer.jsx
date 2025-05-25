import { useEffect } from "react";
import useCall from "~/context/CallContext";

const AudioCallPlayer = () => {
    const { callAccepted, callEnded, stream } = useCall();

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
            {stream ? (
                <div className="p-4 bg-green-200 rounded">
                    <p>Đang phát âm thanh của bạn</p>
                    {/* Bạn có thể thêm icon micro hoặc ảnh đại diện */}
                </div>
            ) : (
                <div className="p-4 bg-gray-200 rounded">Đang lấy micro...</div>
            )}

            {callAccepted && !callEnded ? (
                <div className="p-4 bg-blue-200 rounded">
                    <p>Đang gọi...</p>
                    {/* Thêm thông tin người gọi hoặc nút kết thúc */}
                </div>
            ) : (
                <div className="p-4 bg-gray-300 rounded">Chưa có cuộc gọi</div>
            )}
        </div>
    );
};

export default AudioCallPlayer;
