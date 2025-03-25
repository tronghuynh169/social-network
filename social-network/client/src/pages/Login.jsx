import { useState, useEffect } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

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
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
        required
      />
      <input
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
  );
};

export default Login;
