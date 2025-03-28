import { useState, useEffect } from 'react';
import { login } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import AuthLayout from "../../components/layout/AuthLayout";
import { Link } from "react-router-dom";
import Register from './Register';
import ForgotPassword from './ForgotPassword';
const Login = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra token khi component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usernameOrEmail || !formData.password) {
      setMessage('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData);
      localStorage.setItem('token', res.data.token);
      setMessage('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi đăng nhập. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className='flex items-center justify-center'>
        <form className="bg-black text-white p-6 rounded-lg shadow-md w-96 text-center border border-gray-700 " onSubmit={handleSubmit}>
          {/* Logo Instagram */}
          <div className='p-2 mb-4'>
            <h1 className="text-3xl font-semibold mb-3 font-serif">MOCHI</h1>
          </div>

          {/* Input Username or Email */}
          <input
          className="w-full p-3 mb-3 border border-gray-600 bg-black text-white rounded-md 
                    focus:outline-none focus:ring-0 focus:border-gray-500 
                    autofill:bg-black autofill:text-white autofill:shadow-none"
          name="usernameOrEmail"
          placeholder="Tên người dùng hoặc email"
          onChange={handleChange}
          required
          autoComplete="off"
        />

          {/* Input Password */}
          <input
            className="w-full p-3 mb-3 border border-gray-600 bg-black text-white rounded-md 
                      focus:outline-none focus:ring-0 focus:border-gray-500"
            type="password"
            name="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
            required
          />

          {/* Nút Đăng nhập */}
          <button 
            type="submit" 
            disabled={!formData.usernameOrEmail || !formData.password || loading}
            className={`w-full p-3 mt-2 text-white font-bold rounded-md transition 
                        ${(!formData.usernameOrEmail || !formData.password || loading) 
                          ? 'bg-blue-400' 
                          : 'bg-blue-600 hover:bg-blue-500 cursor-pointer'}`}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          {/* Quên mật khẩu */}
          <Link to="/forgot-password" className="block mt-6 text-gray-400 hover:underline text-sm">
            Quên mật khẩu?
          </Link>

          {/* Đường kẻ ngang */}
          <div className="border-t border-gray-600 my-4"></div>

          {/* Chuyển sang trang đăng ký */}
          <p className="text-gray-400">
            Bạn chưa có tài khoản?{" "}
            <Link className="text-blue-500 font-bold hover:underline"
              to="/register"
            >
              Đăng ký
            </Link>
          </p>

          {/* Thông báo lỗi */}
          {message && <p className="text-red-500 mt-2">{message}</p>}
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
