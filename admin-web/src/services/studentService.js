import api from "./api";

// STUDENT DASHBOARD API
export const getStudentProfile = async (studentId) => {
    const res = await api.get(`/api/student/${studentId}/dashboard/`);
    return res.data;
};

// TODAY ATTENDANCE
export const getTodayAttendance = async (studentId) => {
    const res = await api.get(`/api/student/${studentId}/attendance/today/`);
    return res.data;
};

// MONTHLY ATTENDANCE
export const getMonthlyAttendance = async (studentId, year, month) => {
    const res = await api.get(
        `/api/student/${studentId}/attendance/monthly/${year}/${month}/`
    );
    return res.data;
};

// SUBJECTS OF SEMESTER
export const getSemesterSubjects = async (deptId, semester) => {
    const res = await api.get(`/api/subjects/${deptId}/${semester}/`);
    return res.data;
};

// GET STUDENT TIMETABLE
export const getStudentTimetable = async (studentId) => {
    const res = await api.get(`/api/student/${studentId}/timetable/`);
    return res.data;
};
