import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Book, ArrowLeft, ChevronRight } from 'lucide-react';

const TeacherInternalMarks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            // Reusing the teacher subjects endpoint
            const res = await api.get(`/api/teacher/${user.teacher_id}/subjects/`);
            setSubjects(res.data.subjects);
        } catch (error) {
            console.error("Failed to load subjects", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredSubjects = () => {
        if (selectedSemester === 'ALL') return subjects;
        return subjects.filter(s => s.semester.toString() === selectedSemester);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={() => navigate('/teacher/dashboard')} className="p-2 hover:bg-gray-200 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Internal Marks</h1>
                        <p className="text-sm text-gray-500">Select a subject to enter marks</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-end">
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        <option value="ALL">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                    </select>
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center py-10">Loading subjects...</div>
                ) : (
                    <div className="grid gap-4">
                        {getFilteredSubjects().length === 0 ? (
                            <div className="text-center text-gray-500 py-10">No subjects found.</div>
                        ) : (
                            getFilteredSubjects().map(subject => (
                                <div
                                    key={subject.subject_id}
                                    onClick={() => navigate(`/teacher/internal-marks/${subject.subject_id}`, { state: { subject } })}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Book className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{subject.name}</h3>
                                            <p className="text-gray-500 text-sm">Semester {subject.semester} • {subject.code}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherInternalMarks;
