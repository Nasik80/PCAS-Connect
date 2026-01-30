import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const login = async (username, password) => {
    try {
        const response = await api.post("/api/admin/login/", { username, password });
        return { ...response.data, role: 'admin' };
    } catch (error) {
        throw error.response?.data?.error || "Login Failed";
    }
};

export const loginStudent = async (email, password) => {
    try {
        const response = await api.post("/api/student/login/", { email, password });
        return { ...response.data, role: 'student' };
    } catch (error) {
        throw error.response?.data?.error || "Login Failed";
    }
};

export const loginTeacher = async (email, password) => {
    try {
        const response = await api.post("/api/teacher/login/", { email, password });
        const data = response.data;
        // Normalize role for frontend consistency
        if (data.role && data.role.toUpperCase() === 'TEACHER') {
            data.role = 'teacher';
        }
        return data;
    } catch (error) {
        throw error.response?.data?.error || "Login Failed";
    }
};

export default api;
