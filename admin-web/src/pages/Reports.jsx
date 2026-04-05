import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Download, FileText, Loader2, Users, Building, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('department'); // 'department' or 'student'
    const [loading, setLoading] = useState(false);

    // Department Data
    const [departmentsReport, setDepartmentsReport] = useState([]);

    // Student Data
    const [studentsReport, setStudentsReport] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filterDept, setFilterDept] = useState('');
    const [filterSem, setFilterSem] = useState('');

    useEffect(() => {
        if (activeTab === 'department') {
            fetchDepartmentReport();
        } else {
            fetchStudentReport();
            if (departments.length === 0) fetchDepartments();
        }
    }, [activeTab, filterDept, filterSem]);

    const fetchDepartmentReport = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/reports/departments/');
            setDepartmentsReport(res.data);
        } catch (error) {
            console.error("Failed to fetch department reports", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentReport = async () => {
        setLoading(true);
        try {
            let query = '/api/admin/reports/students/?';
            if (filterDept) query += `department_id=${filterDept}&`;
            if (filterSem) query += `semester=${filterSem}`;

            const res = await api.get(query);
            setStudentsReport(res.data);
        } catch (error) {
            console.error("Failed to fetch student reports", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/api/admin/utils/departments/');
            setDepartments(res.data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    // Export Handlers
    const exportToExcel = () => {
        const isDept = activeTab === 'department';
        const data = isDept ? departmentsReport : studentsReport;

        let formattedData = [];
        if (isDept) {
            formattedData = data.map(d => ({
                'Department': d.department_name,
                'Total Students': d.total_students,
                'Avg Attendance (%)': `${d.attendance_percentage}%`,
                'Avg Internal Marks (%)': `${d.marks_percentage}%`
            }));
        } else {
            formattedData = data.map(s => ({
                'Register Number': s.register_number,
                'Student Name': s.name,
                'Department': s.department_name,
                'Semester': s.semester,
                'Attendance (%)': `${s.attendance_percentage}%`,
                'Internal Marks (%)': `${s.marks_percentage}%`
            }));
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(wb, ws, "Report");

        const fileName = isDept ? 'Department_Report.xlsx' : 'Student_Report.xlsx';
        XLSX.writeFile(wb, fileName);
    };

    const exportToPDF = () => {
        const isDept = activeTab === 'department';
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(isDept ? 'Department Report' : 'Student Report', 14, 22);

        let head = [];
        let body = [];

        if (isDept) {
            head = [['Department', 'Total Students', 'Avg Attendance (%)', 'Avg Internal Marks (%)']];
            body = departmentsReport.map(d => [
                d.department_name,
                d.total_students,
                `${d.attendance_percentage}%`,
                `${d.marks_percentage}%`
            ]);
        } else {
            head = [['Reg No', 'Name', 'Department', 'Sem', 'Attend (%)', 'Marks (%)']];
            body = studentsReport.map(s => [
                s.register_number,
                s.name,
                s.department_name,
                s.semester,
                `${s.attendance_percentage}%`,
                `${s.marks_percentage}%`
            ]);
        }

        autoTable(doc, {
            startY: 30,
            head: head,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] } // Indigo 600
        });

        const fileName = isDept ? 'Department_Report.pdf' : 'Student_Report.pdf';
        doc.save(fileName);
    };

    return (
        <Layout>
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
                    <p className="text-slate-500">View and export academic performance reports</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={exportToExcel}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <FileText size={18} className="text-green-600" />
                        Export Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Download size={18} />
                        Export PDF
                    </button>
                </div>
            </header>

            {/* Tabs & Filters */}
            <div className="bg-white rounded-t-xl border-b border-slate-200">
                <div className="flex border-b border-slate-200">
                    <button
                        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'department' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('department')}
                    >
                        <Building size={18} />
                        Department Wise
                    </button>
                    <button
                        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'student' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('student')}
                    >
                        <Users size={18} />
                        Student Wise
                    </button>
                </div>

                {activeTab === 'student' && (
                    <div className="p-4 bg-slate-50 flex gap-4 border-b border-slate-200">
                        <select
                            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select
                            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={filterSem}
                            onChange={(e) => setFilterSem(e.target.value)}
                        >
                            <option value="">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-slate-200 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : activeTab === 'department' ? (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Department</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Total Students</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Avg Attendance</th>
                                <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Avg Internal Marks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {departmentsReport.map((dept) => (
                                <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{dept.department_name}</td>
                                    <td className="px-6 py-4 text-slate-600">{dept.total_students}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-100 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${dept.attendance_percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                    style={{ width: `${Math.min(dept.attendance_percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{dept.attendance_percentage}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-100 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-indigo-500"
                                                    style={{ width: `${Math.min(dept.marks_percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{dept.marks_percentage}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {departmentsReport.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500 pb-16">
                                        No department data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Register No</th>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Student Name</th>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Category</th>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Attendance</th>
                                    <th className="text-left px-6 py-4 font-semibold text-slate-600 text-sm">Internal Marks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {studentsReport.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-600">{student.register_number}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {student.department_name} • Sem {student.semester}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${student.attendance_percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {student.attendance_percentage}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                {student.marks_percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {studentsReport.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500 pb-16">
                                            No student records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Reports;
