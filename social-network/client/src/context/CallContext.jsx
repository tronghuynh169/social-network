import React, {
    createContext,
    useContext,
    useRef,
    useState,
    useEffect,
} from "react";
import Peer from "simple-peer";
import socket from "~/socket";

const CallContext = createContext();
export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
    // Các state khác giữ nguyên
    const [stream, setStream] = useState(null);
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callModalVisible, setCallModalVisible] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    // Thêm state quản lý thành viên cuộc gọi
    const [callMembers, setCallMembers] = useState([]);

    const userAudio = useRef(null);
    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const connectionRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: false, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            });

        // Khi nhận cuộc gọi
        socket.on("incoming-call", ({ from, signal }) => {
            setCall({ isReceivingCall: true, from, signal });

            setCallMembers((prev) => {
                if (!prev.includes(from)) {
                    return [...prev, from];
                }
                return prev;
            });
        });

        // Khi cuộc gọi được chấp nhận
        socket.on("call-accepted", (signal) => {
            setCallAccepted(true);
            connectionRef.current?.signal(signal);
        });

        // Khi cuộc gọi bị từ chối
        socket.on("decline-call", () => {
            leaveCall();
        });

        // Khi có cập nhật danh sách thành viên cuộc gọi (do server gửi)
        socket.on("call-members-updated", (members) => {
            setCallMembers(members);
        });

        socket.on("user-left-call", (userId) => {
            console.log(`User ${userId} đã rời cuộc gọi`);

            setCallMembers((prev) => prev.filter((id) => id !== userId));
        });

        return () => {
            socket.off("incoming-call");
            socket.off("call-accepted");
            socket.off("decline-call");
            socket.off("call-members-updated");
            socket.off("user-left-call");
        };
    }, []);

    useEffect(() => {
        // Chỉ thoát khi đang gọi (đã nhận cuộc gọi) và chỉ còn 1 người (là mình)
        if (
            callAccepted &&
            callMembers.length === 1 &&
            callMembers[0] === socket.id
        ) {
            console.log("Chỉ còn mình mình, tự động thoát khỏi cuộc gọi");
            leaveCall();
        }
    }, [callMembers, callAccepted]);

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", (data) => {
            socket.emit("call-user", {
                userToCall: id,
                signalData: data,
                from: socket.id,
            });
        });

        peer.on("stream", (currentStream) => {
            if (userAudio.current) {
                userAudio.current.srcObject = currentStream;
            }
        });

        // Khi gọi, thêm người gọi (socket.id) vào danh sách thành viên
        setCallMembers((prev) => {
            if (!prev.includes(socket.id)) {
                const newMembers = [...prev, socket.id];
                socket.emit("update-call-members", newMembers); // gửi lên server cập nhật
                return newMembers;
            }
            return prev;
        });

        connectionRef.current = peer;
        setCallModalVisible(true);
    };

    const answerCall = () => {
        setCallAccepted(true);

        // Khi trả lời, thêm người nhận (call.from) vào danh sách thành viên
        setCallMembers((prev) => {
            const newMembers = new Set(prev);
            newMembers.add(socket.id);

            const updatedMembers = Array.from(newMembers);
            socket.emit("update-call-members", updatedMembers);
            return updatedMembers;
        });

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", (data) => {
            socket.emit("answer-call", { signal: data, to: call.from });
        });

        peer.on("stream", (currentStream) => {
            if (userAudio.current) {
                userAudio.current.srcObject = currentStream;
            }
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    const declineCall = () => {
        if (call?.from) {
            socket.emit("decline-call", { to: call.from });
        }
        leaveCall(); // reset UI luôn ở phía người nhận
    };

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current?.destroy();
        setCallModalVisible(false);
        setCall({});
        setCallAccepted(false);

        // Gửi thông báo rời cuộc gọi
        socket.emit("leave-call", { from: socket.id, members: callMembers });

        // Khi thoát, loại bỏ bản thân khỏi danh sách thành viên và gửi cập nhật lên server
        setCallMembers((prev) => {
            const updatedMembers = prev.filter(
                (member) => member !== socket.id
            );
            socket.emit("update-call-members", updatedMembers);
            return updatedMembers;
        });
    };

    return (
        <CallContext.Provider
            value={{
                call,
                callAccepted,
                callEnded,
                myVideo,
                userVideo,
                stream,
                callUser,
                answerCall,
                leaveCall,
                callModalVisible,
                setCallModalVisible,
                callMembers,
                setCallMembers,
                setCall,
                userAudio,
                declineCall,
            }}
        >
            {children}
        </CallContext.Provider>
    );
};
