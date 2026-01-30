import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, loginStudent, loginTeacher } from '../services/api';
import { ShieldCheck, Lock, User, Loader2, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [role, setRole] = useState('student'); // 'student', 'teacher', 'admin'
    const [username, setUsername] = useState(''); // Used for email as well
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log("Attempting login as", role, username);
            let data;
            if (role === 'admin') {
                data = await login(username, password);
                console.log("Admin Login Success", data);
                authLogin(data);
                navigate('/dashboard');
            } else if (role === 'student') {
                data = await loginStudent(username, password);
                console.log("Student Login Success", data);
                authLogin(data);
                navigate('/student/dashboard');
            } else if (role === 'teacher') {
                data = await loginTeacher(username, password);
                console.log("Teacher Login Success", data);
                authLogin(data);
                if (data.role === 'HOD') {
                    navigate('/hod/dashboard');
                } else {
                    navigate('/teacher/dashboard');
                }
            }
        } catch (err) {
            console.error("Login Failed", err);
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = () => {
        switch (role) {
            case 'admin': return <ShieldCheck className="h-8 w-8 text-indigo-600" />;
            case 'student': return <GraduationCap className="h-8 w-8 text-indigo-600" />;
            case 'teacher': return <Briefcase className="h-8 w-8 text-indigo-600" />;
            default: return <ShieldCheck className="h-8 w-8 text-indigo-600" />;
        }
    };

    const getTitle = () => {
        switch (role) {
            case 'admin': return "Admin Portal";
            case 'student': return "Student Portal";
            case 'teacher': return "Faculty Portal";
            default: return "Portal";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg border border-gray-100">

                {/* Role Switcher Tabs */}
                <div className="flex justify-center space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${role === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('teacher')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${role === 'teacher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Teacher
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${role === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Admin
                    </button>
                </div>

                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300">
                        {getRoleIcon()}
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 transition-all duration-300">
                        {getTitle()}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to continue
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={role === 'admin' ? "text" : "email"}
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder={role === 'admin' ? "Username" : "Email Address"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
