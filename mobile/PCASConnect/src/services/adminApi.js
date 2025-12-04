import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// REPLACE WITH YOUR IP
const BASE_URL = "http://10.200.3.62:8000"; 

export const adminLogin = async (username, password) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/login/`, {
            username,
            password
        });
        return res.data;
    } catch (error) {
        throw error.response?.data?.error || "Login Failed";
    }
};

export const getAdminStats = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/api/admin/dashboard/stats/`);
        return res.data;
    } catch (error) {
        console.error("Stats Error", error);
        return { students: 0, teachers: 0, departments: 0, subjects: 0 };
    }
};
