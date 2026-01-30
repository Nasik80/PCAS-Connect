import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';

const HODInternalMarks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [marksData, setMarksData] = useState([]);
    const [actionLoading, setActionLoading] = useState(null); // subject_id being processed

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user?.teacher_id) return;
        setLoading(true);
        try {
            // Get Dept ID
            const dashboardRes = await api.get(`/api/teacher/dashboard/hod/${user.teacher_id}/`);
            const deptId = dashboardRes.data.department_info.id;

            const res = await api.get(`/api/teacher/hod/internal-marks/${deptId}/`);
            setMarksData(res.data);
        } catch (error) {
            console.error("Failed to load marks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (subjectId, action) => {
        if (!window.confirm(`Are you sure you want to ${action === 'APPROVE' ? 'approve' : 'return'} these marks?`)) return;

        setActionLoading(subjectId);
        try {
            await api.post('/api/teacher/hod/internal-marks/action/', {
                subject_id: subjectId,
                action: action // 'APPROVE' or 'RETURN'
            });
            // Refresh data
            loadData();
        } catch (error) {
            console.error("Action failed", error);
            alert("Failed to process action.");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Approved</span>;
            case 'Submitted': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">Submitted</span>;
            case 'Draft': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">Draft</span>;
            default: return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
        }
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
                            <h1 className="text-2xl font-bold text-gray-900">Internal Marks Oversight</h1>
                            <p className="text-sm text-gray-500">Review and approve marks submitted by faculty</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 flex justify-center items-center gap-2">
                            <Loader2 className="animate-spin" /> Loading...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">Subject</th>
                                        <th className="px-6 py-3">Teacher</th>
                                        <th className="px-6 py-3">Semester</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {marksData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No internal mark submissions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        marksData.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    <div>{item.subject_name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{item.code}</div>
                                                </td>
                                                <td className="px-6 py-4">{item.teacher}</td>
                                                <td className="px-6 py-4">Sem {item.semester}</td>
                                                <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    {item.status === 'Submitted' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleAction(item.subject_id, 'RETURN')}
                                                                disabled={actionLoading === item.subject_id}
                                                                className="p-1  text-red-500 hover:bg-red-50 rounded"
                                                                title="Return to Teacher"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(item.subject_id, 'APPROVE')}
                                                                disabled={actionLoading === item.subject_id}
                                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {item.status === 'Approved' && <CheckCircle size={18} className="text-gray-300" />}
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

export default HODInternalMarks;
