import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Search, ArrowLeft, Mail, BookOpen } from 'lucide-react';

const HODTeacherList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTeachers();
    }, [user]);

    const fetchTeachers = async () => {
        if (!user?.teacher_id) return;
        setLoading(true);
        try {
            // First get department ID if not available 
            const dashboardRes = await api.get(`/api/teacher/dashboard/hod/${user.teacher_id}/`);
            const deptId = dashboardRes.data.department_info.id;

            // Now fetch teachers
            const res = await api.get(`/api/teacher/hod/teachers/${deptId}/`);
            setTeachers(res.data);
        } catch (error) {
            console.error("Failed to load teachers", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTeachers = () => {
        return teachers.filter(t => {
            return t.name.toLowerCase().includes(search.toLowerCase()) ||
                t.email.toLowerCase().includes(search.toLowerCase());
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/hod/dashboard')} className="p-2 hover:bg-gray-200 rounded-full">
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Department Faculty</h1>
                            <p className="text-sm text-gray-500">View teachers in your department</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading faculty...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3 text-center">Subjects</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {getFilteredTeachers().length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                No teachers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        getFilteredTeachers().map(teacher => (
                                            <tr key={teacher.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                                                        {teacher.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p>{teacher.name}</p>
                                                        {teacher.is_hod && <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded">HOD</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{teacher.email}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        <BookOpen className="w-3 h-3 mr-1" />
                                                        {teacher.subjects_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">View Profile</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default HODTeacherList;
