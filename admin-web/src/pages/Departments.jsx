import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Building2, Loader2, Trash2, Edit2, UserCheck, User } from 'lucide-react';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showHodModal, setShowHodModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [deptTeachers, setDeptTeachers] = useState([]);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/api/admin/utils/departments/');
            setDepartments(res.data);
        } catch (error) {
            console.error("Failed to load departments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing) {
                await api.put(`/api/admin/department/${editId}/`, formData);
            } else {
                await api.post('/api/admin/add/department/', formData);
            }
            setShowModal(false);
            setFormData({ name: '', code: '' });
            setIsEditing(false);
            setEditId(null);
            fetchDepartments(); // Refresh list
        } catch (error) {
            alert(`Failed to ${isEditing ? 'update' : 'add'} department. Code might be duplicate.`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (dept) => {
        setFormData({ name: dept.name, code: dept.code });
        setIsEditing(true);
        setEditId(dept.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department? This might affect related data.")) return;
        try {
            await api.delete(`/api/admin/department/${id}/`);
            fetchDepartments();
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Failed to delete department. Please check related dependencies.");
        }
    };

    const openHodModal = async (dept) => {
        setSelectedDept(dept);
        setDeptTeachers([]);
        setShowHodModal(true);
        try {
            // Fetch teachers for this dept
            // Assuming AdminTeacherListView supports ?department_id= queries
            // Actually, we need to check if we can fetch all teachers for a dept.
            // The AdminTeacherListView exists at /api/admin/teachers/list/ 
            // We need to verify if it supports filtering. It does! (As seen in views.py: dept_id = request.GET.get('department_id'))
            const res = await api.get(`/api/admin/teachers/list/?department_id=${dept.id}`);
            setDeptTeachers(res.data);
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        }
    };

    const handleAssignHOD = async (teacherId) => {
        if (!confirm("Are you sure you want to assign this teacher as HOD? This will replace the current HOD.")) return;

        try {
            await api.post('/api/admin/assign/hod/', {
                department_id: selectedDept.id,
                teacher_id: teacherId
            });
            setShowHodModal(false);
            fetchDepartments(); // Refresh to show new HOD
            alert("HOD Assigned Successfully!");
        } catch (error) {
            alert("Failed to assign HOD.");
            console.error(error);
        }
    };

    return (
        <Layout>
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
                    <p className="text-slate-500">Manage college departments</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', code: '' });
                        setIsEditing(false);
                        setEditId(null);
                        setShowModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={20} />
                    Add Department
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => (
                        <div key={dept.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl">
                                    <Building2 className="text-indigo-600" size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(dept)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(dept.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{dept.name}</h3>
                            <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
                                Code: {dept.code}
                            </p>

                            <div className="mt-4 pt-4 border-t border-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-500 font-medium">Head of Department</span>
                                    <button
                                        onClick={() => openHodModal(dept)}
                                        className="text-xs text-indigo-600 font-semibold hover:underline"
                                    >
                                        {dept.hod_name !== "Not Assigned" ? "Change" : "Assign"}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                    <UserCheck size={16} className="text-emerald-600" />
                                    <span className={`text-sm font-medium ${dept.hod_name === "Not Assigned" ? "text-slate-400 italic" : "text-slate-700"}`}>
                                        {dept.hod_name}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between text-sm text-slate-500">
                                <span>Students: -</span>
                                <span>Teachers: -</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">{isEditing ? 'Edit Department' : 'Add New Department'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Computer Science"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. CS"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
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
                                    {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Department' : 'Create Department')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HOD Assignment Modal */}
            {showHodModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 rounded-t-2xl">
                            <h2 className="text-lg font-bold text-slate-900">Assign HOD</h2>
                            <button onClick={() => setShowHodModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <p className="text-sm text-slate-500 mb-4">Select a teacher to appoint as HOD for <span className="font-bold text-slate-800">{selectedDept?.name}</span>.</p>

                            {deptTeachers.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                                    <User size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No teachers found in this department.</p>
                                    <p className="text-xs mt-1">Add teachers first.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {deptTeachers.map(teacher => (
                                        <div key={teacher.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 text-sm">{teacher.name}</p>
                                                    <p className="text-xs text-slate-500">{teacher.role}</p>
                                                </div>
                                            </div>
                                            {teacher.role === 'HOD' ? (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">Current HOD</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleAssignHOD(teacher.id)}
                                                    className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-900"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Departments;
