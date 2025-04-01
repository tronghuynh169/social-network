import axios from 'axios';

const API_URL = 'http://localhost:5000/api/posts';

export const fetchPosts = async () => {
    try {
        const response = await axios.get(API_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
};

export const uploadPost = async (images, caption) => {
    try {
        const token = localStorage.getItem('token'); // 🔥 Lấy token từ localStorage
        if (!token) {
            throw new Error('Bạn chưa đăng nhập! Hãy đăng nhập lại.');
        }

        const formData = new FormData();
        images.forEach((image) => formData.append('images', image));
        formData.append('caption', caption);

        const response = await axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`, // 🔥 Gửi token vào header
            },
            withCredentials: true,
        });

        return response.data;
    } catch (error) {
        console.error(
            'Lỗi khi upload bài viết:',
            error.response?.data || error.message
        );
        return null;
    }
};

export const likePost = async (postId) => {
    try {
        const response = await axios.post(
            `${API_URL}/${postId}/like`,
            {},
            { withCredentials: true }
        );
        return response.data.post.likes;
    } catch (error) {
        console.error('Error liking post:', error);
        return null;
    }
};

export const addComment = async (postId, text) => {
    try {
        const response = await axios.post(
            `${API_URL}/${postId}/comments`,
            { text },
            { withCredentials: true }
        );
        return response.data.comment;
    } catch (error) {
        console.error('Error adding comment:', error);
        return null;
    }
};

export const toggleCommentLike = async (postId, commentId) => {
    try {
        const response = await axios.post(
            `${API_URL}/${postId}/comments/${commentId}/like`,
            {},
            { withCredentials: true }
        );
        return response.data.comment.likes;
    } catch (error) {
        console.error('Error liking comment:', error);
        return null;
    }
};

export const addReply = async (postId, commentId, text) => {
    try {
        const response = await axios.post(
            `${API_URL}/${postId}/comments/${commentId}/replies`,
            { text },
            { withCredentials: true }
        );
        return response.data.reply;
    } catch (error) {
        console.error('Error adding reply:', error);
        return null;
    }
};

export const toggleReplyLike = async (postId, commentId, replyId) => {
    try {
        const response = await axios.post(
            `${API_URL}/${postId}/comments/${commentId}/replies/${replyId}/like`,
            {},
            { withCredentials: true }
        );
        return response.data.reply.likes;
    } catch (error) {
        console.error('Error liking reply:', error);
        return null;
    }
};
