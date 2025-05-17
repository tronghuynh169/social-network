import { io } from "socket.io-client";

// Lấy userId từ localStorage, context, hoặc nơi bạn lưu sau khi login
const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;

// Lấy username
const userId = user?.id;


const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    query: { userId },
});

export default socket;
