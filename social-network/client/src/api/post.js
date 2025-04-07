import axios from 'axios';

// Tạo instance để dễ quản lý baseURL và headers
const api = axios.create({
    baseURL: 'http://localhost:5000/api/posts', // Đổi URL nếu khác
    withCredentials: true, // nếu bạn dùng cookie-based auth
});

// Đăng bài viết (nhiều ảnh/video)
export const createPost = async (formData) => {
    return await api.post('/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// Lấy tất cả bài viết của mình và người follow
export const getAllPosts = async () => {
    return await api.get('/');
};

// Lấy bài viết của một user cụ thể
export const getUserPosts = async (userId) => {
    return await api.get(`/user/${userId}`);
};

// Xóa bài viết
export const deletePost = async (postId) => {
    return await api.delete(`/${postId}`);
};

// Like hoặc Unlike bài viết
export const toggleLike = async (postId) => {
    return await api.post(`/${postId}/like`);
};

// Thêm comment vào bài viết
export const addComment = async (postId, content) => {
    return await api.post(`/${postId}/comments`, { content });
};

// Thêm reply vào comment
export const addReply = async (postId, commentId, content) => {
    return await api.post(`/${postId}/comments/${commentId}/replies`, {
        content,
    });
};

// Like / Unlike comment
export const toggleCommentLike = async (postId, commentId) => {
    return await api.post(`/${postId}/comments/${commentId}/like`);
};

// Lấy chi tiết bài viết (likes + comments)
export const getPostDetails = async (postId) => {
    return await api.get(`/${postId}/details`);
};
