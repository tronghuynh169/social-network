import { useState } from 'react';
import { register } from '../api/auth';
import AuthLayout from "../components/layout/AuthLayout";

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            setMessage('Đăng ký thành công!');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Lỗi đăng ký');
        }
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit}>
                <input
                    className="text-black"
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    required
                />
                <input
                    className="text-black"
                    type="email"
                    name="email"
                    placeholder="Email"
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
                <button className="h-[32px] w-[64px]" type="submit">Đăng Ký</button>
                {message && <p>{message}</p>}
            </form>
        </AuthLayout>
    );
};

export default Register;
