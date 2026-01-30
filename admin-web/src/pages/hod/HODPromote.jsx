import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const HODPromote = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [currentSemester, setCurrentSemester] = useState('1');
    const [stats, setStats] = useState(null); // To show "X students will be promoted"
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Optional: Fetch stats about students in this semester to show a preview
        // fetchStudentCount();
    }, [currentSemester]);

    const handlePromote = async () => {
        const nextSem = parseInt(currentSemester) + 1;
        const confirmMsg = `Are you sure you want to promote all students from Semester ${currentSemester} to Semester ${nextSem}? \n\nThis will assume they passed and assign new subjects automatically.`;

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        setMessage(null);

        try {
            // Get Dept ID
            const dashboardRes = await api.get(`/api/teacher/dashboard/hod/${user.teacher_id}/`);
            const deptId = dashboardRes.data.department_info.id;

            const res = await api.post('/api/teacher/hod/promote/', {
                department_id: deptId,
                current_semester: currentSemester
            });

            setMessage({ type: 'success', text: res.data.message });
        } catch (error) {
            console.error("Promotion failed", error);
            setMessage({ type: 'error', text: error.response?.data?.error || "Promotion failed. Please try again." });
        } finally {
            setLoading(false);
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
                        <h1 className="text-2xl font-bold text-gray-900">Promote Students</h1>
                        <p className="text-sm text-gray-500">Move students to the next academic semester</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">

                    <div className="flex items-start gap-4 bg-orange-50 p-4 rounded-lg mb-8 border border-orange-100 text-orange-800">
                        <AlertTriangle className="w-6 h-6 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-sm uppercase mb-1">Warning: Irreversible Action</h3>
                            <p className="text-sm leading-relaxed opacity-90">
                                This action will bulk update all students in the selected semester.
                                Their semester will be incremented by 1, and previous subject enrollments will be removed.
                                Ensure all exam results are finalized before proceeding.
                            </p>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            <p className="font-medium">{message.text}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Select Current Semester</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setCurrentSemester(s.toString())}
                                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${currentSemester === s.toString()
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        Semester {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-6 text-center space-y-2">
                            <p className="text-indigo-900 font-medium">Target Action</p>
                            <div className="flex items-center justify-center gap-4 text-2xl font-bold text-indigo-700">
                                <span>Sem {currentSemester}</span>
                                <TrendingUp className="w-6 h-6" />
                                <span>Sem {parseInt(currentSemester) + 1}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePromote}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                        >
                            {loading ? 'Processing Promotion...' : 'Promote All Students'}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default HODPromote;
