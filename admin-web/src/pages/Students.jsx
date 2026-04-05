import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Search, Filter, Loader2, Mail, GraduationCap } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedSem, setSelectedSem] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', register_number: '', department: '', semester: '1', dob: '',
        phone_number: '', address: '', blood_group: '', profile_image: null
    });
    const [submitting, setSubmitting] = useState(false);

    const [viewingStudent, setViewingStudent] = useState(null);
    const [viewMode, setViewMode] = useState('view'); // 'view' or 'edit'
    const [editFormData, setEditFormData] = useState({});
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [selectedDept, selectedSem]);

    useEffect(() => {
        const timer = setTimeout(() => fetchStudents(), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchInitialData = async () => {
        try {
            const deptRes = await api.get('/api/admin/utils/departments/');
            setDepartments(deptRes.data);
            fetchStudents();
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            let query = `/api/admin/students/list/?`;
            if (selectedDept) query += `department_id=${selectedDept}&`;
            if (selectedSem) query += `semester=${selectedSem}&`;
            if (search) query += `search=${search}`;

            const res = await api.get(query);
            setStudents(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewStudent = async (student) => {
        try {
            const res = await api.get(`/api/admin/student/${student.id}/`);
            setViewingStudent(res.data);
            setEditFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                register_number: res.data.register_number || '',
                department: res.data.department || '',
                semester: res.data.semester || '1',
                dob: res.data.dob || '',
                phone_number: res.data.phone_number || '',
                address: res.data.address || ''
            });
            setViewMode('view');
        } catch (error) {
            console.error("Failed to fetch student details", error);
            alert("Failed to load student details.");
        }
    };

    const handleDeleteStudent = async () => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        setActionLoading(true);
        try {
            await api.delete(`/api/admin/student/${viewingStudent.id}/`);
            setViewingStudent(null);
            fetchStudents();
        } catch (error) {
            console.error("Failed to delete student", error);
            alert("Failed to delete student.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.put(`/api/admin/student/${viewingStudent.id}/`, editFormData);
            setViewMode('view');
            const res = await api.get(`/api/admin/student/${viewingStudent.id}/`);
            setViewingStudent(res.data);
            fetchStudents();
        } catch (error) {
            console.error("Failed to update student", error);
            alert("Failed to update student.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, profile_image: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });

            await api.post('/api/admin/add/student/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false);
            setFormData({ name: '', email: '', register_number: '', department: '', semester: '1', dob: '', phone_number: '', address: '', blood_group: '', profile_image: null });
            fetchStudents();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.register_number ? "Register Number already exists" :
                error.response?.data?.email ? "Email already exists" :
                    "Failed to add student. Please check inputs.";
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Students</h1>
                    <p className="text-slate-500">Admissions & Promotions</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={20} />
                    Admit Student
                </button>
            </header>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name or Reg No..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select
                    className="p-2 border rounded-xl bg-white"
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                >
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select
                    className="p-2 border rounded-xl bg-white"
                    value={selectedSem}
                    onChange={e => setSelectedSem(e.target.value)}
                >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
                        <tr>
                            <th className="px-6 py-4 text-left">Student Info</th>
                            <th className="px-6 py-4 text-left">Academic</th>
                            <th className="px-6 py-4 text-left">Contact</th>
                            <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{student.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">{student.register_number}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-700">{student.department_name}</div>
                                    <div className="inline-block px-2 py-0.5 mt-1 text-xs font-bold text-indigo-700 bg-indigo-50 rounded">
                                        Sem {student.semester}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-2"><Mail size={14} /> {student.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleViewStudent(student)} className="text-indigo-600 font-medium text-sm hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && !loading && (
                            <tr><td colSpan="4" className="text-center py-8 text-slate-500">No students found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">New Admission</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Student Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Register Number</label>
                                <input required value={formData.register_number} onChange={e => setFormData({ ...formData, register_number: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                                <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                <input type="tel" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-slate-700">Address</label>
                                <textarea rows="2" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Blood Group</label>
                                <input type="text" placeholder="e.g. O+" value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Profile Image</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full mt-1 p-2 border rounded-lg text-sm" />
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Department</label>
                                    <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-white">
                                        <option value="">Select Dept</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Starting Semester</label>
                                    <select value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-white">
                                        {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                                    {submitting ? 'Admitting...' : 'Complete Admission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View/Edit Modal */}
            {viewingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                                {viewMode === 'view' ? 'Student Details' : 'Edit Student'}
                            </h3>
                            {viewMode === 'view' && (
                                <div className="flex gap-2">
                                    <button onClick={() => setViewMode('edit')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                                        Edit
                                    </button>
                                    <button onClick={handleDeleteStudent} disabled={actionLoading} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        {viewMode === 'view' ? (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Name</p>
                                    <p className="text-slate-800 font-semibold">{viewingStudent.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Register Number</p>
                                    <p className="text-slate-800 font-semibold">{viewingStudent.register_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Email</p>
                                    <p className="text-slate-800">{viewingStudent.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Phone Number</p>
                                    <p className="text-slate-800">{viewingStudent.phone_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Department</p>
                                    <p className="text-slate-800">{viewingStudent.department_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Semester</p>
                                    <p className="text-slate-800">Semester {viewingStudent.semester}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Date of Birth</p>
                                    <p className="text-slate-800">{viewingStudent.dob || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-slate-500 font-medium">Address</p>
                                    <p className="text-slate-800">{viewingStudent.address || 'N/A'}</p>
                                </div>
                                <div className="col-span-2 flex justify-end pt-4 border-t mt-2">
                                    <button onClick={() => setViewingStudent(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateStudent} className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Student Name</label>
                                    <input required value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Register Number</label>
                                    <input required value={editFormData.register_number} onChange={e => setEditFormData({ ...editFormData, register_number: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Email</label>
                                    <input type="email" required value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                                    <input type="date" value={editFormData.dob} onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <input type="tel" value={editFormData.phone_number} onChange={e => setEditFormData({ ...editFormData, phone_number: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Address</label>
                                    <textarea rows="2" value={editFormData.address} onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" />
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Department</label>
                                        <select required value={editFormData.department} onChange={e => setEditFormData({ ...editFormData, department: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-white">
                                            <option value="">Select Dept</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Semester</label>
                                        <select value={editFormData.semester} onChange={e => setEditFormData({ ...editFormData, semester: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-white">
                                            {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
                                    <button type="button" onClick={() => setViewMode('view')} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                                    <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                                        {actionLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

        </Layout>

    );
};

export default Students;
