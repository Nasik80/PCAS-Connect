import axios from "axios";

import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;
// change this

// STUDENT DASHBOARD STATS
export const getStudentDashboard = async (studentId) => {
  const res = await axios.get(`${BASE_URL}/api/student/${studentId}/dashboard/`);
  return res.data;
};

// STUDENT PROFILE DETAILS
export const getStudentProfile = async (studentId) => {
  const res = await axios.get(`${BASE_URL}/api/student/${studentId}/profile/`);
  return res.data;
};

// UPDATE STUDENT PROFILE
export const updateStudentProfile = async (studentId, formData) => {
  const res = await axios.put(`${BASE_URL}/api/student/${studentId}/profile/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// TODAY ATTENDANCE
export const getTodayAttendance = async (studentId) => {
  const res = await axios.get(`${BASE_URL}/api/student/${studentId}/attendance/today/`);
  return res.data;
};

// MONTHLY ATTENDANCE
export const getMonthlyAttendance = async (studentId, year, month) => {
  const res = await axios.get(
    `${BASE_URL}/api/student/${studentId}/attendance/monthly/${year}/${month}/`
  );
  return res.data;
};

// SUBJECTS OF SEMESTER
export const getSemesterSubjects = async (deptId, semester) => {
  const res = await axios.get(`${BASE_URL}/api/subjects/${deptId}/${semester}/`);
  return res.data;
};

// GET STUDENT TIMETABLE
export const getStudentTimetable = async (studentId) => {
  const res = await axios.get(`${BASE_URL}/api/student/${studentId}/timetable/`);
  return res.data;
};

// GET STUDENT ANNOUNCEMENTS
export const getStudentAnnouncements = async (studentId) => {
  const res = await axios.get(`${BASE_URL}/api/student/${studentId}/announcements/`);
  return res.data;
};

// GET STUDENT INTERNAL MARKS
export const getStudentInternalMarks = async (studentId) => {
  const res = await axios.get(`${BASE_URL}/api/student/${studentId}/internal-marks/`);
  return res.data;
};