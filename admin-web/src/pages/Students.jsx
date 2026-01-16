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
        name: '', email: '', register_number: '', department: '', semester: '1', dob: ''
    });
    const [submitting, setSubmitting] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/admin/add/student/', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', register_number: '', department: '', semester: '1', dob: '' });
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
                                    <button className="text-indigo-600 font-medium text-sm hover:underline">View</button>
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

        </Layout>
    );
};

export default Students;
