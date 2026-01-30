import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Search, ArrowLeft, Mail, GraduationCap } from 'lucide-react';

const HODStudentList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('ALL');

    useEffect(() => {
        // We need department_id. 
        // If it's not in user object, we might need to fetch it or use the dashboard endpoint first.
        // Assuming user.department_id exists or we can get it from HOD dashboard cache?
        // Let's try to fetch HOD details first if missing.
        fetchStudents();
    }, [user]);

    const fetchStudents = async () => {
        if (!user?.teacher_id) return;
        setLoading(true);
        try {
            // First get department ID if not available 
            // (Optimize this later by storing in context info)
            const dashboardRes = await api.get(`/api/teacher/dashboard/hod/${user.teacher_id}/`);
            const deptId = dashboardRes.data.department_info.id;

            // Now fetch students
            const res = await api.get(`/api/teacher/hod/students/${deptId}/`);
            setStudents(res.data);
        } catch (error) {
            console.error("Failed to load students", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredStudents = () => {
        return students.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.reg_no.includes(search);
            const matchesSemester = selectedSemester === 'ALL' || s.semester.toString() === selectedSemester;
            return matchesSearch && matchesSemester;
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
                            <h1 className="text-2xl font-bold text-gray-900">Department Students</h1>
                            <p className="text-sm text-gray-500">Manage and view students in your department</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or register number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>

                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full md:w-48"
                    >
                        <option value="ALL">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                    </select>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading students...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Reg No</th>
                                        <th className="px-6 py-3">Semester</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {getFilteredStudents().length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No students found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        getFilteredStudents().map(student => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    {student.name}
                                                </td>
                                                <td className="px-6 py-4 font-mono">{student.reg_no}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md">
                                                        Sem {student.semester}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{student.email}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">View Details</button>
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

export default HODStudentList;
