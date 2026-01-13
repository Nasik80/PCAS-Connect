import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const login = async (username, password) => {
    try {
        const response = await api.post("/api/admin/login/", { username, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || "Login Failed";
    }
};

export default api;
