import axios from "axios";

export const updateAvatar = async (file, slug) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("slug", slug); // Gửi slug để xác định profile

    const response = await axios.post(
        "http://localhost:5000/api/avatar/update",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data; // Trả về imageUrl mới từ server
};

export const deleteAvatar = async (profileSlug) => {
    try {
        const response = await axios.delete(
            `http://localhost:5000/api/avatar/${profileSlug}`
        );
        return response.data.imageUrl; // Trả về ảnh mặc định từ backend
    } catch (error) {
        console.error("Lỗi khi xóa avatar:", error);
        throw error;
    }
};
