import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_API_URL = `${API_URL}/api/notifications`;

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

// Lấy danh sách notification
export const getNotifications = async (userId) => {
    try {
        const response = await apiClient.get("/", {
            params: { userId },
        });
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi lấy thông báo:", error);
        return [];
    }
};

// Đánh dấu 1 notification đã đọc
export const markAsRead = async (id) => {
    try {
        const response = await apiClient.patch(`/${id}/read`);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi đánh dấu đã đọc:", error);
        throw error;
    }
};

// Đánh dấu tất cả đã đọc
export const markAllAsRead = async (userId) => {
    try {
        const response = await apiClient.patch(
            `/read/all`,
            {},
            { params: { userId } }
        );
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi đánh dấu tất cả đã đọc:", error);
        throw error;
    }
};

// Xóa một notification
export const deleteNotification = async (id) => {
    try {
        const response = await apiClient.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi xóa thông báo:", error);
        throw error;
    }
};
