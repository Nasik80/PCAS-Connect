import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Clock, Activity, User, BookOpen } from 'lucide-react';
import {
    getStudentProfile,
    getTodayAttendance,
    getMonthlyAttendance
} from '../../services/studentService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [todayData, setTodayData] = useState(null);
    const [monthData, setMonthData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!authUser?.student_id) return;

            try {
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth() + 1;

                const [profileRes, todayRes, monthRes] = await Promise.all([
                    getStudentProfile(authUser.student_id),
                    getTodayAttendance(authUser.student_id),
                    getMonthlyAttendance(authUser.student_id, currentYear, currentMonth)
                ]);

                setProfile(profileRes);
                setTodayData(todayRes);
                setMonthData(monthRes);
            } catch (error) {
                console.error("Error fetching student dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
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

    // Stats Logic
    const presentCount = monthData?.present || 0;
    const totalCount = monthData?.total || 0;
    const monthPercentage = monthData?.percentage || 0;
    const absentCount = totalCount - presentCount;

    const pieData = [
        { name: 'Present', value: presentCount, color: '#4F46E5' }, // Indigo-600
        { name: 'Absent', value: absentCount, color: '#E5E7EB' },   // Gray-200
    ];

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
                            <p className="text-xs text-gray-500">Student Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{profile?.student_name || authUser?.name}</p>
                            <p className="text-xs text-gray-500">{profile?.department} • Sem {profile?.semester}</p>
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Today's Status */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Today's Status</h3>
                                <p className="text-sm text-gray-500">{new Date().toDateString()}</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Clock className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{todayData?.total || 0}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Classes</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{todayData?.present || 0}</p>
                                <p className="text-xs text-green-600 uppercase tracking-wide">Present</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-2xl font-bold text-red-600">{todayData?.absent || 0}</p>
                                <p className="text-xs text-red-600 uppercase tracking-wide">Absent</p>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Attendance */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center relative overflow-hidden">
                        <div className="z-10">
                            <div className="flex items-center space-x-2 mb-1">
                                <Activity className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Current Semester</p>

                            <div className="flex items-baseline space-x-1">
                                <span className="text-4xl font-bold text-indigo-600">{monthPercentage}%</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Total {presentCount}/{totalCount} Sessions</p>
                        </div>

                        <div className="h-32 w-32 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={40}
                                        paddingAngle={5}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/student/study-notes')}
                            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-sm transition-colors"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium">Study Notes</span>
                        </button>
                    </div>
                </div>

                {/* Today's Schedule */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Today's Schedule</h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            Today
                        </div>
                    </div>

                    <div className="p-6">
                        {todayData?.details?.length > 0 ? (
                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>

                                <div className="space-y-6">
                                    {todayData.details.map((item, index) => (
                                        <div key={index} className="relative flex items-start group">
                                            {/* Period Bubble */}
                                            <div className="flex flex-col items-center mr-6 min-w-[3rem] z-10 bg-white">
                                                <span className="text-xs font-semibold text-gray-400 mb-1">Pd {item.period}</span>
                                                <div className={`w-3 h-3 rounded-full border-2 ${item.status === 'P' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
                                                    }`}></div>
                                            </div>

                                            {/* Card */}
                                            <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{item.subject}</h4>
                                                        <div className="flex items-center mt-1 text-sm text-gray-500">
                                                            <User className="w-3 h-3 mr-1" />
                                                            {item.teacher || "No Tutor"}
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'P'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {item.status === 'P' ? 'Present' : 'Absent'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500">No classes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default StudentDashboard;
