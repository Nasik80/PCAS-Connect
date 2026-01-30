import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Save, ArrowLeft, Users } from 'lucide-react';

const InternalMarkEntry = () => {
    const { subjectId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // We can pass subject object in state to avoid re-fetching details
    const subject = location.state?.subject;

    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({}); // { student_id: mark_value }
    const [maxMarks, setMaxMarks] = useState(20); // Default to 20, could depend on exam type

    useEffect(() => {
        if (subjectId) {
            fetchStudentsAndMarks();
        }
    }, [subjectId]);

    const fetchStudentsAndMarks = async () => {
        setLoading(true);
        try {
            // 1. Fetch Students
            const res = await api.get(`/api/teacher/subject/${subjectId}/students/`);
            const studentList = res.data;
            setStudents(studentList);

            // 2. Fetch existing marks if any (not implemented in backend properly yet? check endpoint)
            // Assuming we might have an endpoint or just defaulting to empty
            // For now, let's just initialize
            const initialMarks = {};
            studentList.forEach(s => initialMarks[s.id] = '');
            setMarks(initialMarks);

        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, value) => {
        // Validate if number
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= maxMarks)) {
            setMarks(prev => ({
                ...prev,
                [studentId]: value
            }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const marksList = Object.keys(marks).map(sid => ({
                student_id: sid,
                marks: marks[sid] === '' ? 0 : parseInt(marks[sid])
            })).filter(m => m.marks >= 0); // Send logic

            await api.post(`/api/teacher/internal-marks/${subjectId}/`, {
                marks: marksList,
                max_marks: maxMarks
            });

            alert("Marks Saved Successfully!");
            navigate('/teacher/internal-marks');
        } catch (error) {
            console.error("Save error", error);
            alert("Failed to save marks.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={() => navigate('/teacher/internal-marks')} className="p-2 hover:bg-gray-200 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Enter Marks</h1>
                        <p className="text-sm text-gray-500">{subject?.name || 'Subject'} ({subject?.code})</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Max Marks:</span>
                    <input
                        type="number"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 w-20 text-center"
                    />
                </div>

                {/* Students List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No students found.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {students.map(student => (
                                <div key={student.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.register_number}</p>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={marks[student.id]}
                                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                        placeholder="-"
                                        className="w-16 p-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer Action */}
                    {!loading && students.length > 0 && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Marks
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default InternalMarkEntry;
