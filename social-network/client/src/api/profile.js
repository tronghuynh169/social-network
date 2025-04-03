import axios from "axios";

// Sử dụng biến môi trường, mặc định là http://localhost:5000 nếu không có
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_API_URL = `${API_URL}/api/profile`;

// Tạo instance axios để tái sử dụng cấu hình
const apiClient = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Thêm interceptor để tự động gắn token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getProfileBySlug = async (slug) => {
    try {
        const response = await apiClient.get(`/${slug}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy profile:", error);
        throw error;
    }
};

export const getProfileByUsername = async (username) => {
    try {
        const response = await apiClient.get(`/username/${username}`);
        return response.data;
    } catch (error) {
        console.error(
            "Lỗi khi lấy profile:",
            error.response?.data || error.message
        );
        return null;
    }
};

export const getProfileByUserId = async (userId) => {
    try {
        const response = await apiClient.get(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy profile từ userId:", error);
        return null;
    }
};

export const getProfileByFullName = async (fullname) => {
    try {
        // Chuẩn hóa fullname: bỏ dấu, chuyển thành chữ thường, xóa khoảng trắng thừa
        const normalizedFullname = fullname
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        const response = await apiClient.get(
            `/fullname/${encodeURIComponent(normalizedFullname)}`
        );

        // Kiểm tra nếu không có dữ liệu hoặc mảng rỗng
        if (!response.data || response.data.length === 0) {
            return []; // Trả về mảng rỗng khi không có kết quả
        }

        return response.data;
    } catch (error) {
        // Xử lý lỗi 404
        if (error.response?.status === 404) {
            console.warn("Không tìm thấy profile nào với tên này");
            return []; // Trả về mảng rỗng khi không tìm thấy profile
        }

        // Xử lý các lỗi khác (ví dụ: lỗi mạng, lỗi server)
        console.error("Lỗi khi tìm kiếm profile theo tên:", error);
        return []; // Trả về mảng rỗng trong trường hợp có lỗi khác
    }
};

export const updateProfileByUsername = async (username, updatedProfile) => {
    try {
        const response = await apiClient.put(`/${username}`, updatedProfile);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật profile:", error);
        return null;
    }
};

export const getFollowers = async (profileId) => {
    try {
        const response = await apiClient.get(`/${profileId}/followers`);
        return response.data.followers;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người theo dõi:", error);
        return [];
    }
};

export const getFollowing = async (profileId) => {
    try {
        const response = await apiClient.get(`/${profileId}/following`);
        return response.data.following;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đang theo dõi:", error);
        return [];
    }
};

export const followUser = async (currentUserId, profileId) => {
    try {
        const response = await apiClient.post(`/follow/${profileId}`, {
            userProfileId: currentUserId,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi theo dõi người dùng:", error);
        throw error;
    }
};

export const unfollowUser = async (profileId, currentUserId) => {
    try {
        const response = await apiClient.delete(`/unfollow/${profileId}`, {
            data: { currentUserId },
        });
        return response.data;
    } catch (error) {
        console.error(
            "❌ Lỗi khi gọi API unfollow:",
            error.response?.data || error.message
        );
        throw error;
    }
};

export const checkFollowingStatus = async (currentUserId, profileId) => {
    try {
        const response = await apiClient.get(
            `/${profileId}/is-following?user=${currentUserId}`
        );
        return { isFollowing: response.data.isFollowing };
    } catch (error) {
        console.error(
            "❌ Lỗi khi kiểm tra trạng thái theo dõi:",
            error.response?.data || error.message
        );
        return { isFollowing: false };
    }
};
