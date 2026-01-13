import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Users, GraduationCap, Building2, BookOpen, Loader2 } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/admin/dashboard/stats/');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, bg }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all duration-200">
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${bg} group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={24} className={color} />
            </div>
        </div>
    );

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
                <p className="text-slate-500">Welcome back, Administrator</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats?.students || 0}
                    icon={GraduationCap}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatCard
                    title="Teachers"
                    value={stats?.teachers || 0}
                    icon={Users}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Departments"
                    value={stats?.departments || 0}
                    icon={Building2}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <StatCard
                    title="Subjects"
                    value={stats?.subjects || 0}
                    icon={BookOpen}
                    color="text-rose-600"
                    bg="bg-rose-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activities</h3>
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <p>Activity Log coming soon...</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition-colors">
                            <span className="font-semibold text-slate-700 block">Add Student</span>
                            <span className="text-xs text-slate-500">Create new student profile</span>
                        </button>
                        <button className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-left transition-colors">
                            <span className="font-semibold text-slate-700 block">Add Teacher</span>
                            <span className="text-xs text-slate-500">Onboard new faculty</span>
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
