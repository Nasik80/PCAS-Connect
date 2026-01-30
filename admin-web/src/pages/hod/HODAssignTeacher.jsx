import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, BookOpen, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';

const HODAssignTeacher = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semester, setSemester] = useState('1');

    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        if (user?.teacher_id) {
            fetchSubjects(semester);
        }
    }, [semester, user]);

    const loadData = async () => {
        if (!user?.teacher_id) return;
        setLoading(true);
        try {
            // Get Department ID first (CACHE THIS LOGIC LATER)
            const dashboardRes = await api.get(`/api/teacher/dashboard/hod/${user.teacher_id}/`);
            const deptId = dashboardRes.data.department_info.id;

            // Fetch Teachers
            const tRes = await api.get(`/api/teacher/hod/teachers/${deptId}/`);
            setTeachers(tRes.data);

        } catch (error) {
            console.error("Failed to load teachers", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async (sem) => {
        try {
            // We need deptId again... inefficient to re-fetch but safe for now.
            // Ideally store in context or local state from loadData?
            // Let's toggle logical dependency.
            const dashboardRes = await api.get(`/api/teacher/dashboard/hod/${user.teacher_id}/`);
            const deptId = dashboardRes.data.department_info.id;

            const res = await api.get(`/api/admin/subjects/${deptId}/${sem}/`);
            setSubjects(res.data);
        } catch (error) {
            console.error("Failed to load subjects", error);
            setSubjects([]);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!selectedTeacher || !selectedSubject) {
            setMessage({ type: 'error', text: 'Please select both a teacher and a subject.' });
            return;
        }

        setSubmitLoading(true);
        try {
            await api.post('/api/teacher/hod/assign-teacher/', {
                teacher_id: selectedTeacher,
                subject_id: selectedSubject
            });
            setMessage({ type: 'success', text: 'Teacher successfully assigned to the subject.' });
            setSelectedSubject(''); // Reset subject selection
        } catch (error) {
            console.error("Assignment failed", error);
            setMessage({ type: 'error', text: 'Failed to assign teacher. Please try again.' });
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-2">
                    <button onClick={() => navigate('/hod/dashboard')} className="p-2 hover:bg-gray-200 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Assign Teacher</h1>
                        <p className="text-sm text-gray-500">Allocate subjects to faculty members</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading data...</div>
                    ) : (
                        <form onSubmit={handleAssign} className="space-y-6">

                            {/* Message Alert */}
                            {message && (
                                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-sm font-medium">{message.text}</p>
                                </div>
                            )}

                            {/* Teacher Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Faculty</label>
                                <div className="relative">
                                    <UserCheck className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <select
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white"
                                        required
                                    >
                                        <option value="">Select a Teacher...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.subjects_count} subjects)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Semester Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5, 6].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSemester(s.toString())}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${semester === s.toString()
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            Sem {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white"
                                        required
                                    >
                                        <option value="">Select a Subject...</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                </div>
                                {subjects.length === 0 && (
                                    <p className="text-xs text-orange-500 mt-1">No subjects found for this semester.</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading || !selectedTeacher || !selectedSubject}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-md shadow-indigo-200"
                            >
                                {submitLoading ? 'Assigning...' : 'Assign Class'}
                            </button>

                        </form>
                    )}
                </div>

            </div>
        </div>
    );
};

export default HODAssignTeacher;
