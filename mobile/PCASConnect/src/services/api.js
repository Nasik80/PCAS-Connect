import axios from 'axios';

// ⚠️ UPDATED IP ADDRESS
const BASE_URL = "http://10.219.6.134:8000";


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Used for Login (if you move logic here later, otherwise auth.js handles it)
export const loginUser = async (role, email, password) => {
  const response = await api.post(`/api/${role}/login/`, { email, password });
  return response.data;
};

// 1. Get Student Dashboard Profile
export const getStudentProfile = async (studentId) => {
  // Matches: path('api/student/<int:student_id>/dashboard/', student_dashboard)
  const response = await api.get(`/api/student/${studentId}/dashboard/`);
  return response.data;
};

// 2. Get Today's Attendance
export const getTodayAttendance = async (studentId) => {
  // Matches: path('api/student/<int:student_id>/attendance/today/', student_attendance_today)
  const response = await api.get(`/api/student/${studentId}/attendance/today/`);
  return response.data;
};

// 3. Get Monthly Attendance
export const getMonthlyAttendance = async (studentId, year, month) => {
  // Matches: path('api/student/<int:student_id>/attendance/monthly/<int:year>/<int:month>/', ...)
  const response = await api.get(`/api/student/${studentId}/attendance/monthly/${year}/${month}/`);
  return response.data;
};

// 4. Get Semester Subjects
export const getSemesterSubjects = async (departmentId, semester) => {
  // Matches: path('api/subjects/<int:department_id>/<int:semester>/', semester_subjects)
  // Note: This requires an Integer ID for department, not a name string.
  const response = await api.get(`/api/subjects/${departmentId}/${semester}/`);
  return response.data;
};

export default api;