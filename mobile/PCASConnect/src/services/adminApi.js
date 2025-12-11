import axios from "axios";

// REPLACE WITH YOUR ACTUAL IP ADDRESS
const BASE_URL = "http://10.219.6.134:8000";

// LOGIN
export const adminLogin = async (username, password) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/login/`, { username, password });
        return res.data;
    } catch (error) {
        throw error.response?.data?.error || "Login Failed";
    }
};

// DASHBOARD STATS
export const getAdminStats = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/api/admin/dashboard/stats/`);
        return res.data;
    } catch (error) {
        return { students: 0, teachers: 0, departments: 0, subjects: 0 };
    }
};

// GET DEPARTMENTS
export const getDepartments = async () => {
    const res = await axios.get(`${BASE_URL}/api/admin/utils/departments/`);
    return res.data;
};

// SEMESTER ATTENDANCE (Class Monitor)
export const getSemesterAttendance = async (deptId, semester, year, month) => {
    const res = await axios.get(
        `${BASE_URL}/api/admin/attendance/semester/${deptId}/${semester}/${year}/${month}/`
    );
    return res.data;
};

// EXPORT EXCEL URL
export const getExportUrl = (deptId, semester, year, month) => {
    return `${BASE_URL}/api/admin/export/semester/${deptId}/${semester}/${year}/${month}/`;
};

// SEARCH STUDENTS
export const searchStudents = async (query) => {
    const res = await axios.get(`${BASE_URL}/api/admin/search/students/?q=${query}`);
    return res.data;
};

// --- CREATE ENTITIES ---

export const addStudent = async (data) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/add/student/`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to add student";
    }
};

export const addTeacher = async (data) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/add/teacher/`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to add teacher";
    }
};

export const addDepartment = async (data) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/add/department/`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to add department";
    }
};

export const addSubject = async (data) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/add/subject/`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to add subject";
    }
};

export const promoteStudents = async (data) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/promote/students/`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to promote students";
    }
};

// --- STUDENT MANAGEMENT ---

export const getStudentList = async (deptId, semester, search) => {
    let url = `${BASE_URL}/api/admin/students/list/?`;
    if (deptId) url += `department_id=${deptId}&`;
    if (semester) url += `semester=${semester}&`;
    if (search) url += `search=${search}&`;

    const res = await axios.get(url);
    return res.data;
};

export const getStudentDetails = async (id) => {
    const res = await axios.get(`${BASE_URL}/api/admin/student/${id}/`);
    return res.data;
};

export const updateStudent = async (id, data) => {
    try {
        const res = await axios.put(`${BASE_URL}/api/admin/student/${id}/`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to update student";
    }
};

export const deleteStudent = async (id) => {
    try {
        const res = await axios.delete(`${BASE_URL}/api/admin/student/${id}/`);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to delete student";
    }
};

export const resetStudentPassword = async (id) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/student/${id}/reset-password/`);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to reset password";
    }
};

// --- TEACHER MANAGEMENT ---

export const getTeacherList = async (deptId, search) => {
    let url = `${BASE_URL}/api/admin/teachers/list/?`;
    if (deptId) url += `department_id=${deptId}&`;
    if (search) url += `search=${search}&`;

    const res = await axios.get(url);
    return res.data;
};

export const getTeacherDetails = async (id) => {
    const res = await axios.get(`${BASE_URL}/api/admin/teacher/${id}/`);
    return res.data;
};

export const updateTeacher = async (id, data) => {
    try {
        const res = await axios.put(`${BASE_URL}/api/admin/teacher/${id}/`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to update teacher";
    }
};

export const deleteTeacher = async (id) => {
    try {
        const res = await axios.delete(`${BASE_URL}/api/admin/teacher/${id}/`);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to delete teacher";
    }
};

export const resetTeacherPassword = async (id) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/teacher/${id}/reset-password/`);
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to reset password";
    }
};