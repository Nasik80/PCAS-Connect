import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Search, Filter, Loader2, Mail, Phone } from 'lucide-react';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', department: '', phone: '', qualification: '', gender: 'Male', role: 'TEACHER'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [selectedDept]); // Refetch when filter changes

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchTeachers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [deptRes] = await Promise.all([
                api.get('/api/admin/utils/departments/')
            ]);
            setDepartments(deptRes.data);
            await fetchTeachers();
        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            let query = `/api/admin/teachers/list/?`;
            if (selectedDept) query += `department_id=${selectedDept}&`;
            if (search) query += `search=${search}`;

            const res = await api.get(query);
            setTeachers(res.data);
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/admin/add/teacher/', formData);
            setShowModal(false);
            setFormData({
                name: '', email: '', department: '', phone: '', qualification: '', gender: 'Male', role: 'TEACHER'
            });
            fetchTeachers();
        } catch (error) {
            alert("Failed to add teacher. Email might be duplicate.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
                    <p className="text-slate-500">Manage faculty members</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={20} />
                    Add Teacher
                </button>
            </header>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                >
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>

            {loading && !teachers.length ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Name</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Contact</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Department</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Role</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{teacher.name}</div>
                                        <div className="text-xs text-slate-400">ID: {teacher.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                            <Mail size={14} /> {teacher.email}
                                        </div>
                                        {teacher.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone size={14} /> {teacher.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm font-medium">
                                            {teacher.department_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-sm font-medium ${teacher.is_hod ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {teacher.is_hod ? 'HOD' : teacher.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">View</button>
                                    </td>
                                </tr>
                            ))}
                            {teachers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No teachers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Teacher</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email" required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Qualification</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. MSc Computer Science, PhD"
                                    value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Adding...' : 'Add Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Teachers;
