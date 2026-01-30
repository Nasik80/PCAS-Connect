import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Removed invalid imports
import api from '../../services/api';
import { Calendar, Save, ArrowLeft, Clock, Users } from 'lucide-react';

const TeacherAttendance = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedule, setSchedule] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(1);
    const [currentClass, setCurrentClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, [date]);

    useEffect(() => {
        if (schedule.length > 0) {
            const found = schedule.find(p => p.period_number === selectedPeriod);
            setCurrentClass(found || null);
        } else {
            setCurrentClass(null);
        }
    }, [selectedPeriod, schedule]);

    useEffect(() => {
        if (currentClass) {
            fetchStudentsAndAttendance();
        } else {
            setStudents([]);
        }
    }, [currentClass]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            // Check api.js for this endpoint, if not present create it or use direct api call
            const res = await api.get(`/api/teacher/schedule/${user.teacher_id}/?date=${date}`);
            setSchedule(res.data);
        } catch (error) {
            console.error("Failed to load schedule", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentsAndAttendance = async () => {
        if (!currentClass) return;
        setLoading(true);
        setIsEditing(false);

        try {
            const res = await api.get(`/api/teacher/subject/${currentClass.subject_id}/students/`);
            const studentsList = res.data;
            setStudents(studentsList);

            if (currentClass.attendance_done) {
                const attRes = await api.get(`/api/teacher/attendance/get/`, {
                    params: {
                        subject_id: currentClass.subject_id,
                        period_id: selectedPeriod,
                        date: date
                    }
                });
                const existingAtt = {};
                attRes.data.forEach(a => existingAtt[a.student_id] = a.status);
                setAttendance(existingAtt);
            } else {
                const initialAtt = {};
                studentsList.forEach(s => initialAtt[s.id] = 'P');
                setAttendance(initialAtt);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId) => {
        if (currentClass?.attendance_done && !isEditing) return;
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'P' ? 'A' : 'P'
        }));
    };

    const handleSave = async () => {
        if (!currentClass) return;
        setLoading(true);
        try {
            const attendanceList = Object.keys(attendance).map(sid => ({
                student_id: sid,
                status: attendance[sid]
            }));

            await api.post(`/api/teacher/attendance/mark/`, {
                teacher_id: user.teacher_id,
                subject_id: currentClass.subject_id,
                period_id: selectedPeriod,
                date: date,
                attendance: attendanceList
            });

            alert("Attendance Saved!");
            setIsEditing(false);
            fetchSchedule();
        } catch (error) {
            alert("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const isReadOnly = currentClass?.attendance_done && !isEditing;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                    <button onClick={() => navigate('/teacher/dashboard')} className="p-2 hover:bg-gray-200 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
                        <p className="text-sm text-gray-500">Manage class attendance</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {[1, 2, 3, 4, 5, 6].map(p => (
                            <button
                                key={p}
                                onClick={() => setSelectedPeriod(p)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${selectedPeriod === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Class Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    {currentClass ? (
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{currentClass.subject}</h2>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-md">
                                        Semester {currentClass.semester}
                                    </span>
                                    {currentClass.attendance_done && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md flex items-center">
                                            <Users className="w-3 h-3 mr-1" /> Saved
                                        </span>
                                    )}
                                </div>
                            </div>
                            {currentClass.attendance_done && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                            No class scheduled for Period {selectedPeriod}
                        </div>
                    )}
                </div>

                {/* Students List */}
                {currentClass && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : students.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No students found in this class.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {students.map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleAttendance(student.id)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${attendance[student.id] === 'A'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-white border-gray-200 hover:border-indigo-300'
                                            } ${isReadOnly ? 'opacity-75 cursor-default' : ''}`}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.register_number}</p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${attendance[student.id] === 'A' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {attendance[student.id] === 'A' ? 'A' : 'P'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer Action */}
                        {!isReadOnly && students.length > 0 && (
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Attendance
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default TeacherAttendance;
