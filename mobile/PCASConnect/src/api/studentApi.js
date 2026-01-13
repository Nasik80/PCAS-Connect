import axios from "axios";

import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;
// change this

// STUDENT DASHBOARD API
export const getStudentProfile = async (studentId) => {
  const res = await axios.get(`${BASE_URL}/api/student/${studentId}/dashboard/`);
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