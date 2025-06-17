import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const register = async (userData) => {
    return axios.post(`${API_URL}/register`, userData);
};

export const login = async (userData) => {
    return axios.post(`${API_URL}/login`, userData);
};

export const forgotPassword = async (email) => {
    return axios.post(`${API_URL}/forgot-password`, { email });
};

export const resetPassword = (token, newPassword) => {
    console.log("📤 Gửi request đến:", `/api/auth/reset-password/${token}`);

    return axios.post(`${API_URL}/reset-password/${token}`, {
        password: newPassword,
    });
};
