import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, BookOpen, Loader2, Trash2 } from 'lucide-react';

const Syllabus = () => {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', code: '', semester: '1', credit: '4', subject_type: 'CORE', department: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const [filterDept, setFilterDept] = useState('');
    const [filterSem, setFilterSem] = useState('1');

    const subjectTypes = [
        { value: 'CORE', label: 'Major (Core)' },
        { value: 'SEC', label: 'Skill Enhancement (SEC)' },
        { value: 'VAC', label: 'Value Added (VAC)' },
        { value: 'MDC', label: 'Multidisciplinary (MDC)' },
        { value: 'AEC', label: 'Ability Enhancement (AEC)' },
        { value: 'DSE', label: 'Minor (DSE)' }
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (filterDept) {
            fetchSubjects();
        }
    }, [filterDept, filterSem]);

    const fetchInitialData = async () => {
        try {
            const deptRes = await api.get('/api/admin/utils/departments/');
            setDepartments(deptRes.data);
            if (deptRes.data.length > 0) {
                setFilterDept(deptRes.data[0].id); // Default to first dept
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            // Backend expects: /api/admin/subjects/<dept_id>/<semester>/
            const res = await api.get(`/api/admin/subjects/${filterDept}/${filterSem}/`);
            setSubjects(res.data);
        } catch (error) {
            // Graceful handling if 404 or empty
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/admin/add/subject/', formData);
            setShowModal(false);
            setFormData({ ...formData, name: '', code: '' });
            fetchSubjects();
        } catch (error) {
            alert("Failed to add subject. Code might be duplicate.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Syllabus & Subjects</h1>
                    <p className="text-slate-500">MGU UG 2024 Curriculum</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={20} />
                    Add Course
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 mb-6">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
                    <select
                        className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                    >
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="w-32">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Semester</label>
                    <select
                        className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                        value={filterSem}
                        onChange={(e) => setFilterSem(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                            No subjects found for this semester.
                        </div>
                    ) : (
                        subjects.map(sub => (
                            <div key={sub.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-start group hover:border-indigo-200 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${sub.subject_type === 'CORE' ? 'bg-indigo-100 text-indigo-700' :
                                                sub.subject_type === 'SEC' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {subjectTypes.find(t => t.value === sub.subject_type)?.label || sub.subject_type}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">{sub.code}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800">{sub.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{sub.credit} Credits</p>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                                    <BookOpen size={20} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Course</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Course Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. Data Structures"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Course Code</label>
                                    <input
                                        required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded-lg outline-none"
                                        placeholder="e.g. CS101"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Credits</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.credit}
                                        onChange={e => setFormData({ ...formData, credit: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded-lg outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Semester</label>
                                    <select
                                        value={formData.semester}
                                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded-lg outline-none bg-white"
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Category</label>
                                    <select
                                        value={formData.subject_type}
                                        onChange={e => setFormData({ ...formData, subject_type: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded-lg outline-none bg-white"
                                    >
                                        {subjectTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Department</label>
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full mt-1 p-2 border rounded-lg outline-none bg-white"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </Layout>
    );
};

export default Syllabus;
