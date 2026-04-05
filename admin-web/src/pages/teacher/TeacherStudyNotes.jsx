import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchTeacherStudyNotes, uploadStudyNote, deleteStudyNote, getTeacherSubjects, getTeacherDashboard } from '../../services/teacherService';
import { FileText, Download, Trash2, Upload, BookOpen } from 'lucide-react';

const TeacherStudyNotes = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teacherDeptId, setTeacherDeptId] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [title, setTitle] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user?.teacher_id) return;
        try {
            setLoading(true);
            const [notesData, subjectsData, dashboardData] = await Promise.all([
                fetchTeacherStudyNotes(user.teacher_id),
                getTeacherSubjects(user.teacher_id),
                getTeacherDashboard(user.teacher_id)
            ]);
            setNotes(notesData);
            setSubjects(subjectsData?.subjects || []);
            // Dashboard data includes department id if available or we can get it from subjects/contexts
            // We'll extract department from the teacher object or assume subjects have it backend-side.
            // Actually, backend StudyNoteSerializer requires department.
            // Let's assume the backend serializer infers department from teacher, or we send it if we must.
            // We can send auth teacher's department ID. Dashboard returns `department_id` in login response.
            setTeacherDeptId(user.department_id || 1); // fallback
        } catch (error) {
            console.error('Failed to load study notes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !selectedSubject || !file) return alert('Please fill all fields');
        
        try {
            setUploading(true);
            const sub = subjects.find(s => s.subject_id === parseInt(selectedSubject));
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('file', file);
            formData.append('subject', selectedSubject);
            formData.append('semester', sub.semester);
            formData.append('teacher_id', user.teacher_id);
            formData.append('department', user.department_id || 1); 

            await uploadStudyNote(formData);
            
            setTitle('');
            setSelectedSubject('');
            setFile(null);
            loadData();
            
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        try {
            await deleteStudyNote(noteId);
            loadData();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading notes...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <BookOpen className="mr-2" /> Study Notes Management
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Upload Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <h2 className="text-lg font-semibold mb-4 flex items-center"><Upload className="w-5 h-5 mr-1"/> Upload Note</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Chapter 1 Notes"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={selectedSubject}
                                onChange={e => setSelectedSubject(e.target.value)}
                                required
                            >
                                <option value="">Select a subject...</option>
                                {subjects.map(s => (
                                    <option key={s.subject_id} value={s.subject_id}>{s.name} (Sem {s.semester})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF, DOCX, JPG)</label>
                            <input
                                type="file"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                accept=".pdf,.docx,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`w-full py-2 px-4 rounded text-white font-medium ${uploading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {uploading ? 'Uploading...' : 'Upload Note'}
                        </button>
                    </form>
                </div>

                {/* Notes List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Your Uploaded Notes</h2>
                    {notes.length === 0 ? (
                        <p className="text-gray-500 text-sm">You haven't uploaded any notes yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {notes.map(note => (
                                <div key={note.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-start">
                                        <div className="p-2 bg-indigo-50 rounded text-indigo-600 mr-3">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{note.title}</h3>
                                            <p className="text-sm text-gray-500">{note.subject_name} • Sem {note.semester}</p>
                                            <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(note.uploaded_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <a href={note.file} target="_blank" rel="noreferrer" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                            <Download className="w-5 h-5" />
                                        </a>
                                        <button onClick={() => handleDelete(note.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherStudyNotes;
