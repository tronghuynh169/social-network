import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Fallback nếu không có biến môi trường

export const updateAvatar = async (file, slug) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("slug", slug);

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token");

        const response = await axios.post(
            `${API_URL}/api/avatar/update`, // Sử dụng biến môi trường
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật avatar:", error);
        throw error;
    }
};

export const deleteAvatar = async (profileSlug) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token");

        const response = await axios.delete(
            `${API_URL}/api/avatar/${profileSlug}`, // Sử dụng biến môi trường
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data.imageUrl;
    } catch (error) {
        console.error("Lỗi khi xóa avatar:", error);
        throw error;
    }
};
