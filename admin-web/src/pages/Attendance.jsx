import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Users, Filter, Loader2, AlertTriangle, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Attendance = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDept) fetchStats();
    }, [selectedDept]);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/api/admin/utils/departments/');
            setDepartments(res.data);
            if (res.data.length > 0) setSelectedDept(res.data[0].id);
        } catch (error) {
            console.error("Failed to load departments", error);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Reusing HOD stats endpoint but accessible to admin
            const res = await api.get(`/api/hod/attendance/stats/${selectedDept}/`);
            setStats(res.data); // { overall_percentage, subject_breakdown, low_attendance_students }
        } catch (error) {
            console.error("Failed to load attendance stats", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#4f46e5', '#e2e8f0']; // Indigo, Slate

    return (
        <Layout>
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Attendance Overview</h1>
                    <p className="text-slate-500">Monitor department-wise attendance</p>
                </div>
                <select
                    className="p-2 border rounded-xl bg-white min-w-[200px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                >
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : !stats ? (
                <div className="text-center py-12 text-slate-500">Select a department to view stats</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Overall Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Overall Attendance</h3>
                        <div className="h-64 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Present', value: stats.overall_percentage },
                                            { name: 'Absent', value: 100 - stats.overall_percentage }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        <Cell fill={COLORS[0]} />
                                        <Cell fill={COLORS[1]} />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-3xl font-bold text-slate-800">{stats.overall_percentage}%</span>
                                <span className="text-xs text-slate-500 font-medium uppercase">Last 30 Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Low Attendance List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <AlertTriangle className="text-amber-500" size={20} />
                                Low Attendance Alert
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 bg-amber-50 text-amber-700 rounded-full">Below 75%</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Student</th>
                                        <th className="px-4 py-3 text-left">Sem</th>
                                        <th className="px-4 py-3 text-left">Attendance</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.low_attendance_students.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-8 text-slate-500">No students below 75%</td></tr>
                                    ) : (
                                        stats.low_attendance_students.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-slate-800">{s.name}</div>
                                                    <div className="text-xs text-slate-500">{s.reg_no}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">Sem {s.semester}</td>
                                                <td className="px-4 py-3 font-bold text-slate-800">{s.percentage}%</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-red-600 bg-red-50 rounded-full">
                                                        <TrendingDown size={12} /> Critical
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Subject Breakdown */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-3">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Subject-wise Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.subject_breakdown.map((sub, idx) => (
                                <div key={idx} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-slate-700 line-clamp-1" title={sub.subject}>{sub.subject}</div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${sub.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {sub.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${sub.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${sub.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Attendance;
