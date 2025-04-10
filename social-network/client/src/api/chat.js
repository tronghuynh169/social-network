import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_API_URL = `${API_URL}/api/chat`;

const apiClient = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tạo cuộc trò chuyện
export const createConversation = async (conversationData) => {
    try {
        const response = await apiClient.post(
            "/conversation",
            conversationData
        );
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi tạo cuộc trò chuyện:", error);
        throw error;
    }
};

// Gửi tin nhắn
export const sendMessage = async ({ conversationId, sender, text }) => {
    try {
        const response = await apiClient.post("/message", {
            conversationId,
            sender,
            text,
        });
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi gửi tin nhắn:", error);
        throw error;
    }
};

// Lấy tất cả tin nhắn của 1 cuộc trò chuyện
export const getMessages = async (conversationId) => {
    try {
        const response = await apiClient.get(`/message/${conversationId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi lấy tin nhắn:", error);
        return [];
    }
};

// Lấy các cuộc trò chuyện của người dùng
export const getUserConversations = async (userId) => {
    try {
        const response = await apiClient.get(`/conversation/${userId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách cuộc trò chuyện:", error);
        return [];
    }
};
