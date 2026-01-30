import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Bell, Users, Send } from 'lucide-react';

const HODAnnouncement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('DEPT');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handlePost = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            // Get Dept ID
            const dashboardRes = await api.get(`/api/teacher/dashboard/hod/${user.teacher_id}/`);
            const deptId = dashboardRes.data.department_info.id;

            await api.post('/api/teacher/hod/announcement/', {
                teacher_id: user.teacher_id,
                department_id: deptId,
                title,
                content,
                audience
            });

            setMessage({ type: 'success', text: "Announcement posted successfully." });
            setTitle('');
            setContent('');
            setAudience('DEPT');
        } catch (error) {
            console.error("Post failed", error);
            setMessage({ type: 'error', text: "Failed to post announcement." });
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
                        <h1 className="text-2xl font-bold text-gray-900">Make Announcement</h1>
                        <p className="text-sm text-gray-500">Broadcast messages to your department</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">

                    {message && (
                        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handlePost} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <div className="relative">
                                <Bell className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Mid-Term Exam Schedule"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                            <textarea
                                required
                                rows="6"
                                placeholder="Type your message here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                                <select
                                    value={audience}
                                    onChange={(e) => setAudience(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="DEPT">Entire Department</option>
                                    <option value="STUDENTS">Students Only</option>
                                    <option value="TEACHERS">Teachers Only</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Posting...' : <><Send size={18} /> Post Announcement</>}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default HODAnnouncement;
