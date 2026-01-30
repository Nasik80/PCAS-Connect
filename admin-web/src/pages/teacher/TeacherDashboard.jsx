import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Clock, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import { getTeacherDashboard } from '../../services/teacherService';

const TeacherDashboard = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!authUser?.teacher_id) return;
            try {
                const dashboardData = await getTeacherDashboard(authUser.teacher_id);
                setData(dashboardData);
            } catch (error) {
                console.error("Error fetching teacher dashboard:", error);
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

    const { stats, announcements } = data || {};

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <BookOpen className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">PCAS Connect</h1>
                            <p className="text-xs text-gray-500">Faculty Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{data?.teacher?.name || authUser?.name}</p>
                            <p className="text-xs text-gray-500">{data?.teacher?.department}</p>
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
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Subjects Tile */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Subjects Taught</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.subjects_count || 0}</p>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-full">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>

                        {/* Classes Today Tile */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Classes Today</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.today_classes || 0}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-full">
                                <Clock className="w-6 h-6 text-green-600" />
                            </div>
                        </div>

                        {/* Pending Attendance Tile */}
                        <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 flex items-center justify-between ${stats?.pending_attendance > 0 ? 'border-red-500' : 'border-green-500'
                            }`}>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Attendance</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.pending_attendance || 0}</p>
                                {stats?.pending_attendance > 0 && (
                                    <span className="text-xs text-red-500 font-medium">Action Required</span>
                                )}
                            </div>
                            <div className={`${stats?.pending_attendance > 0 ? 'bg-red-50' : 'bg-green-50'} p-3 rounded-full`}>
                                <AlertCircle className={`w-6 h-6 ${stats?.pending_attendance > 0 ? 'text-red-600' : 'text-green-600'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/teacher/attendance')}
                            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-sm transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Mark Attendance</span>
                        </button>
                        <button
                            onClick={() => navigate('/teacher/internal-marks')}
                            className="flex items-center justify-center space-x-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 p-4 rounded-xl shadow-sm transition-all"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium">Internal Marks</span>
                        </button>
                    </div>
                </div>

                {/* Announcements */}
                {announcements && announcements.length > 0 && (
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Latest Announcements</h2>
                        </div>
                        <div className="space-y-4">
                            {announcements.map((ann, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
                                    <h3 className="font-bold text-gray-900 mb-1">{ann.title}</h3>
                                    <p className="text-sm text-gray-500">{ann.date} • {ann.sender}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default TeacherDashboard;
