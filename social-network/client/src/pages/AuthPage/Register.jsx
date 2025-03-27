import { useState } from "react";
import { register } from "~/api/auth";
import { useNavigate } from "react-router-dom";
import AuthLayout from "~/components/layout/AuthLayout";

const Register = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        dateOfBirth: { day: "", month: "", year: "" }
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    // Danh sách ngày, tháng, năm
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    // Kiểm tra dữ liệu hợp lệ
    const validateField = (name, value) => {
        let error = "";

        if (name === "username") {
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(value)) {
                error = "Tên tài khoản chỉ chứa chữ, số, _ và không dấu!";
            }
        }

        if (name === "email") {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            if (!emailRegex.test(value)) {
                error = "Email phải có định dạng @gmail.com!";
            }
        }

        if (name === "password") {
            if (value.length < 8) {
                error = "Mật khẩu phải có ít nhất 8 ký tự!";
            }
        }

        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            dateOfBirth: { ...prev.dateOfBirth, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (Object.values(errors).some(error => error)) return;
        if (!formData.dateOfBirth.day || !formData.dateOfBirth.month || !formData.dateOfBirth.year) {
            setErrors(prev => ({ ...prev, dateOfBirth: "Vui lòng chọn đầy đủ ngày sinh!" }));
            return;
        }

        const { day, month, year } = formData.dateOfBirth;
        const formattedDate = new Date(year, month - 1, day); // Chuyển đổi thành kiểu Date

        try {
            await register({ ...formData, dateOfBirth: formattedDate });
            setMessage("Đăng ký thành công!");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            setMessage(error.response?.data?.message || "Lỗi đăng ký");
        }
    };

    return (
        <AuthLayout>
            <div className="flex items-center justify-center">
                <form onSubmit={handleSubmit} className="p-6 bg-black rounded-lg shadow-lg w-96 border border-gray-700">
                    <h2 className="text-white text-3xl font-bold text-center mb-6">KONEX</h2>

                    {/* Họ và tên */}
                    <input
                        className="w-full p-3 mb-3 border border-gray-700 bg-black text-white rounded-md focus:outline-none focus:border-gray-500"
                        type="text"
                        name="fullName"
                        placeholder="Họ và tên"
                        onChange={handleChange}
                        required
                    />

                    {/* Ngày sinh */}
                    <div className="flex space-x-2 mb-3">
                        <select
                            name="day"
                            className="w-1/3 p-3 border border-gray-700 bg-black text-white rounded-md focus:outline-none"
                            onChange={handleDateChange}
                        >
                            <option value="">Ngày</option>
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select
                            name="month"
                            className="w-1/3 p-3 border border-gray-700 bg-black text-white rounded-md focus:outline-none"
                            onChange={handleDateChange}
                        >
                            <option value="">Tháng</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                            name="year"
                            className="w-1/3 p-3 border border-gray-700 bg-black text-white rounded-md focus:outline-none"
                            onChange={handleDateChange}
                        >
                            <option value="">Năm</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mb-2">{errors.dateOfBirth}</p>}

                    {/* Tài khoản */}
                    <input
                        className="w-full p-3 mb-3 border border-gray-700 bg-black text-white rounded-md focus:outline-none focus:border-gray-500"
                        type="text"
                        name="username"
                        placeholder="Tên tài khoản"
                        onChange={handleChange}
                        required
                    />
                    {errors.username && <p className="text-red-500 text-sm mb-2">{errors.username}</p>}

                    {/* Email */}
                    <input
                        className="w-full p-3 mb-3 border border-gray-700 bg-black text-white rounded-md focus:outline-none focus:border-gray-500"
                        type="email"
                        name="email"
                        placeholder="Email (@gmail.com)"
                        onChange={handleChange}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

                    {/* Mật khẩu */}
                    <input
                        className="w-full p-3 mb-1 border border-gray-700 bg-black text-white rounded-md focus:outline-none focus:border-gray-500"
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        onChange={handleChange}
                        required
                    />
                    {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

                    {/* Nút đăng ký */}
                    <button
                    type="submit"
                    className={`w-full p-3 mt-3 text-white rounded-md transition duration-300 font-bold ${
                        Object.values(errors).some(error => error) || 
                        !formData.fullName || 
                        !formData.username || 
                        !formData.email || 
                        !formData.password || 
                        !formData.dateOfBirth.day || 
                        !formData.dateOfBirth.month || 
                        !formData.dateOfBirth.year
                        ? "bg-blue-400" // Màu xanh nhạt khi chưa nhập đủ
                        : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer" // Bình thường
                    }`}
                    disabled={
                        Object.values(errors).some(error => error) || 
                        !formData.fullName || 
                        !formData.username || 
                        !formData.email || 
                        !formData.password || 
                        !formData.dateOfBirth.day || 
                        !formData.dateOfBirth.month || 
                        !formData.dateOfBirth.year
                    }
                >
                    Đăng ký
                </button>

                    <div className="border-t border-gray-600 my-4"></div>

                    {/* Liên kết chuyển sang đăng nhập */}
                    <p className="text-gray-400 text-center mt-3">
                        Bạn đã có tài khoản?{" "}
                        <span
                            className="text-blue-500 font-bold cursor-pointer hover:underline"
                            onClick={() => navigate("/login")}
                        >
                            Đăng nhập
                        </span>
                    </p>

                    {/* Thông báo lỗi chung */}
                    {message && <p className="text-red-500 mt-3 text-center">{message}</p>}
                </form>
            </div>
        </AuthLayout>
    );
};

export default Register;
