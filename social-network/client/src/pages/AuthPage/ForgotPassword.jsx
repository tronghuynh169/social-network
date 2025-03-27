import { useState } from "react";
import { forgotPassword } from "~/api/auth";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await forgotPassword(email);
            setMessage(res.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || "Lỗi hệ thống!");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <form onSubmit={handleSubmit} className="p-6 bg-black text-white rounded-md w-96 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Quên Mật Khẩu</h2>
                <input
                    type="email"
                    placeholder="Nhập email"
                    className="w-full p-3 mb-3 border border-gray-600 bg-black text-white rounded-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-300 font-semibold"
                >
                    Gửi Yêu Cầu
                </button>
                {message && <p className="text-green-400 text-sm mt-2 text-center">{message}</p>}
            </form>
        </div>
    );
};

export default ForgotPassword;
