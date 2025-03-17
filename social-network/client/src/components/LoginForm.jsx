import { useState } from 'react';
import { login } from '../api/auth';

const LoginForm = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login(formData);
            localStorage.setItem('token', res.data.token);
            setMessage('Đăng nhập thành công!');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Lỗi đăng nhập');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="username"
                placeholder="username"
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
            <button type="submit">Đăng Nhập</button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default LoginForm;
