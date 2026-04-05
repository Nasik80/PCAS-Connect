import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentStudyNotes } from '../../services/studentService';
import { FileText, Download, BookOpen } from 'lucide-react';

const StudentStudyNotes = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotes = async () => {
            if (!user?.student_id) return;
            try {
                const data = await getStudentStudyNotes(user.student_id);
                setNotes(data);
            } catch (error) {
                console.error("Failed to fetch study notes", error);
            } finally {
                setLoading(false);
            }
        };
        loadNotes();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading study materials...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <BookOpen className="mr-2 text-indigo-600" /> Study Materials
            </h1>
            <p className="text-gray-500 mb-6 font-medium">Download notes uploaded by your teachers for your current semester.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                    {notes.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500">No study notes available for your semester yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {notes.map(note => (
                                <div key={note.id} className="flex border rounded-lg p-4 hover:shadow-md transition-shadow hover:border-indigo-100 group">
                                    <div className="flex-none flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-900 leading-tight mb-1">{note.title}</h3>
                                        <p className="text-sm text-gray-500">{note.subject_name}</p>
                                        <p className="text-xs text-gray-400 mt-1">By {note.uploaded_by} • {new Date(note.uploaded_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex-none flex items-center ml-2">
                                        <a
                                            href={note.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                            title="Download Note"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
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

export default StudentStudyNotes;
