import axios from "axios";

const API_URL = "http://localhost:5000/api/profile";

export const getProfileBySlug = async (slug) => {
    try {
        const response = await axios.get(`${API_URL}/${slug}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy profile:", error);
        throw error;
    }
};
// Lấy profile theo username
export const getProfileByUsername = async (username) => {
    try {
        const response = await axios.get(`${API_URL}/username/${username}`);
        return response.data;
    } catch (error) {
        console.error(
            "Lỗi khi lấy profile:",
            error.response?.data || error.message
        );
        return null; // Trả về null nếu không tìm thấy profile
    }
};

export const getProfileByUserId = async (userId) => {
    try {
        console.log("📌 Debug: Đang gọi API lấy profile từ userId:", userId);
        const response = await axios.get(`${API_URL}/profile/user/${userId}`);
        console.log("✅ Debug: Kết quả API getProfileByUserId:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy profile từ userId:", error);
        return null;
    }
};

// 🔹 Lấy danh sách người theo dõi
export const getFollowers = async (profileId) => {
    try {
        const response = await axios.get(`${API_URL}/${profileId}/followers`);
        return response.data.followers;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người theo dõi:", error);
        return [];
    }
};

// 🔹 Lấy danh sách đang theo dõi
export const getFollowing = async (profileId) => {
    try {
        const response = await axios.get(`c/${profileId}/following`);
        return response.data.following;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách đang theo dõi:", error);
        return [];
    }
};

// 🔹 Theo dõi người dùng
export const followUser = async (currentUserId, profileId) => {
    try {
        const response = await axios.post(`${API_URL}/follow/${profileId}`, {
            userProfileId: currentUserId, // ID người thực hiện theo dõi
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi theo dõi người dùng:", error);
        throw error;
    }
};

export const unfollowUser = async (profileId, currentUserId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/unfollow/${profileId}`,
            {
                data: { currentUserId },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

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
        const response = await fetch(
            `${API_URL}/${profileId}/is-following?user=${currentUserId}`
        );
        const data = await response.json();
        return { isFollowing: data.isFollowing };
    } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái theo dõi:", error);
        return { isFollowing: false };
    }
};
