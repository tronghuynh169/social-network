import { useState, useEffect } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import AuthLayout from "../components/layout/AuthLayout";

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
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
    
    if (!formData.username || !formData.password) {
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
        <div className='my-auto mr-10 translate-y-[-50%]'>
          <h2 className=''>FACEBOOK</h2>
          <p>Facebook giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống của bạn</p>
        </div>
        <div className='rml-10 '>
          <form className='p-20 mt-[50%] translate-y-[-50%] shadow-md rounded-lg bg-white flex flex-col' onSubmit={handleSubmit}>
            <input
              className="text-black"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />
            <input
              className="text-black"
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading} className='text-white-500 bg-white p-0'>
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
            {message && <p>{message}</p>}
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
