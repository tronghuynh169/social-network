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
