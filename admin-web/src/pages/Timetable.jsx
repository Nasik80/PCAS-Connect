import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Calendar, Filter, Loader2, BookOpen } from 'lucide-react';

const Timetable = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedSem, setSelectedSem] = useState('1');
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDept && selectedSem) {
            fetchTimetable();
        }
    }, [selectedDept, selectedSem]);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/api/admin/utils/departments/');
            setDepartments(res.data);
            if (res.data.length > 0) setSelectedDept(res.data[0].id);
        } catch (error) {
            console.error("Failed to load departments", error);
        }
    };

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/timetable/list/?department_id=${selectedDept}&semester=${selectedSem}`);
            setTimetable(res.data);
        } catch (error) {
            console.error("Failed to load timetable", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get cell content
    const getCell = (day, period) => {
        const entry = timetable.find(t => t.day === day && t.period === period);
        if (!entry) return null;
        return (
            <div className="text-sm p-1 rounded hover:bg-indigo-50 transition-colors">
                <div className="font-bold text-slate-800 line-clamp-1">{entry.subject}</div>
                <div className="text-xs text-slate-500 line-clamp-1">{entry.teacher}</div>
            </div>
        );
    };

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const periods = [1, 2, 3, 4, 5, 6];

    return (
        <Layout>
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Timetable Management</h1>
                    <p className="text-slate-500">View class schedules</p>
                </div>
            </header>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Department</label>
                    <select
                        className="w-full p-2 border rounded-xl bg-slate-50 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                    >
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="w-[150px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Semester</label>
                    <select
                        className="w-full p-2 border rounded-xl bg-slate-50 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedSem}
                        onChange={e => setSelectedSem(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : timetable.length === 0 && selectedDept ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="mx-auto text-slate-300 mb-2" size={48} />
                    <p className="text-slate-500">No timetable entries found for this selection.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Day</th>
                                    {periods.map(p => (
                                        <th key={p} className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Period {p}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {days.map(day => (
                                    <tr key={day} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4 font-bold text-indigo-900 bg-indigo-50/50 border-r border-slate-100">
                                            {day}
                                        </td>
                                        {periods.map(p => (
                                            <td key={p} className="px-4 py-2 border-r border-slate-50 min-h-[80px] text-center align-top relative">
                                                {getCell(day, p) || (
                                                    <span className="text-slate-300 text-xs italic absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Free</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Timetable;
