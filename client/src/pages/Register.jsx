import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Lock, Mail, User } from 'lucide-react';

const Register = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student',
        gender: 'Male'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { name, email, password, role, gender } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', { name, email, password, role, gender });
            localStorage.setItem('token', res.data.token);
            setAuth(true);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 glass-card p-10">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <User className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                            <input
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                value={name}
                                onChange={onChange}
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a:</label>
                        <div className="flex space-x-4">
                            <label className={`flex-1 cursor-pointer rounded-md border p-3 flex items-center justify-center space-x-2 transition-all ${role === 'Student' ? 'border-primary bg-indigo-50 text-primary ring-1 ring-primary' : 'border-gray-300 hover:border-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="Student"
                                    checked={role === 'Student'}
                                    onChange={onChange}
                                    className="sr-only"
                                />
                                <span className="font-medium">Student</span>
                            </label>
                            <label className={`flex-1 cursor-pointer rounded-md border p-3 flex items-center justify-center space-x-2 transition-all ${role === 'Professional' ? 'border-primary bg-indigo-50 text-primary ring-1 ring-primary' : 'border-gray-300 hover:border-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="Professional"
                                    checked={role === 'Professional'}
                                    onChange={onChange}
                                    className="sr-only"
                                />
                                <span className="font-medium">Professional</span>
                            </label>
                        </div>
                    </div>

                    {/* Gender Selection */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender:</label>
                        <div className="flex space-x-4">
                            <label className={`flex-1 cursor-pointer rounded-md border p-3 flex items-center justify-center space-x-2 transition-all ${gender === 'Male' ? 'border-primary bg-indigo-50 text-primary ring-1 ring-primary' : 'border-gray-300 hover:border-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Male"
                                    checked={gender === 'Male'}
                                    onChange={onChange}
                                    className="sr-only"
                                />
                                <span className="font-medium">Male</span>
                            </label>
                            <label className={`flex-1 cursor-pointer rounded-md border p-3 flex items-center justify-center space-x-2 transition-all ${gender === 'Female' ? 'border-primary bg-indigo-50 text-primary ring-1 ring-primary' : 'border-gray-300 hover:border-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Female"
                                    checked={gender === 'Female'}
                                    onChange={onChange}
                                    className="sr-only"
                                />
                                <span className="font-medium">Female</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-500 text-sm">Already have an account? Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
