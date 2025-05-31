import { useState, useEffect } from "react";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Import useUser
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useUser(); // Lấy hàm setUser từ UserContext
    const [showPassword, setShowPassword] = useState(false);

    // Kiểm tra token khi component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/");
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.usernameOrEmail || !formData.password) {
            setMessage("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        setLoading(true);
        try {
            const res = await login(formData);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user)); // Lưu user vào localStorage
            setUser(res.data.user); // Cập nhật context để Sidebar nhận dữ liệu
            navigate("/");
            setUser(res.data.user);
            console.log("User sau khi đăng nhập:", res.data.user);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Lỗi đăng nhập. Vui lòng thử lại."
            );
        }
        setLoading(false);
    };

    return (
        <AuthLayout>
            <div className="flex items-center justify-center">
                <form
                    className="bg-black text-white p-6 rounded-lg shadow-md w-96 text-center border border-gray-700"
                    onSubmit={handleSubmit}
                >
                    <div className="p-2 mb-4">
                        <h1 className="text-3xl font-semibold mb-3 font-serif">
                            MOCHI
                        </h1>
                    </div>

                    <input
                        className="w-full p-3 mb-3 border border-gray-600 bg-black text-white rounded-md 
                        focus:outline-none focus:ring-0 focus:border-gray-500"
                        name="usernameOrEmail"
                        placeholder="Tên người dùng hoặc email"
                        onChange={handleChange}
                        required
                        autoComplete="off" // Tắt autocomplete
                    />

                    <div className="relative mb-3">
                        <input
                            className="w-full p-3 pr-10 border border-gray-600 bg-black text-white rounded-md 
                            focus:outline-none focus:ring-0 focus:border-gray-500"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Mật khẩu"
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                        <div
                            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            !formData.usernameOrEmail ||
                            !formData.password ||
                            loading
                        }
                        className={`w-full p-3 mt-2 text-white font-bold rounded-md transition 
              ${
                  !formData.usernameOrEmail || !formData.password || loading
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
              }`}
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>

                    <Link
                        to="/forgot-password"
                        className="block mt-6 text-gray-400 hover:underline text-sm"
                    >
                        Quên mật khẩu?
                    </Link>

                    <div className="border-t border-gray-600 my-4"></div>

                    <p className="text-gray-400">
                        Bạn chưa có tài khoản?{" "}
                        <Link
                            className="text-blue-500 font-bold hover:underline"
                            to="/register"
                        >
                            Đăng ký
                        </Link>
                    </p>

                    {message && <p className="text-red-500 mt-2">{message}</p>}
                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;
