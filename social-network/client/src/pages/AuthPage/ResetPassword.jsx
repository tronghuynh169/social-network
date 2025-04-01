import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "~/api/auth";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            setMessage("Mật khẩu phải có ít nhất 8 ký tự!");
            return;
        }
    
        console.log("Gửi request với password:", newPassword); // Debug
    
        try {
            const res = await resetPassword(token, newPassword);
            setMessage(res.data.message);
            setTimeout(() => navigate("/"), 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Lỗi hệ thống!");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="p-6 bg-black text-white rounded-md w-96 shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold text-center mb-4">Đặt Lại Mật Khẩu</h2>
                <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    className="w-full p-3 mb-3 border border-gray-600 bg-black text-white rounded-md"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-300 font-semibold cursor-pointer"
                >
                    Cập Nhật
                </button>
                {message && <p className="text-red-400 text-sm mt-2 text-center">{message}</p>}
            </form>
        </div>
    );
};

export default ResetPassword;
