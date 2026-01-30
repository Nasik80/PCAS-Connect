import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Users, GraduationCap, School, UserCheck, TrendingUp, Bell, FileText } from 'lucide-react';
import { getHODDashboard } from '../../services/teacherService';

const HODDashboard = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!authUser?.teacher_id) return;
            try {
                const dashboardData = await getHODDashboard(authUser.teacher_id);
                setData(dashboardData);
            } catch (error) {
                console.error("Error fetching HOD dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authUser]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const { stats, department_info } = data || {};

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <School className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">PCAS Connect</h1>
                            <p className="text-xs text-gray-500">Head of Department</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{data?.hod_name || authUser?.name}</p>
                            <p className="text-xs text-gray-500">{department_info?.name}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Stats Tiles */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Department Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Total Students */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_students || 0}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-full cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => navigate('/hod/students')}>
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>

                        {/* Total Teachers */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Faculty Members</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_teachers || 0}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-full cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => navigate('/hod/teachers')}>
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>

                        {/* Total Courses */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active Courses</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_courses || 0}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-full">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Management</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-sm transition-colors"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium">My Teaching Dashboard</span>
                        </button>

                        <button
                            onClick={() => navigate('/hod/assign')}
                            className="flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 p-4 rounded-xl shadow-sm transition-colors"
                        >
                            <UserCheck className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Assign Teacher</span>
                        </button>

                        <button
                            onClick={() => navigate('/hod/promote')}
                            className="flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 p-4 rounded-xl shadow-sm transition-colors"
                        >
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                            <span className="font-medium">Promote Students</span>
                        </button>

                        <button
                            onClick={() => navigate('/hod/announcement')}
                            className="flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 p-4 rounded-xl shadow-sm transition-colors"
                        >
                            <Bell className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">Announcement</span>
                        </button>

                        <button
                            onClick={() => navigate('/hod/internal-marks')}
                            className="flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 p-4 rounded-xl shadow-sm transition-colors"
                        >
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium">Internal Marks</span>
                        </button>
                    </div>
                </div>

            </main>
        </div >
    );
};

export default HODDashboard;
