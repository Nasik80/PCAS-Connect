import api from "./api";

// --- TEACHER ENDPOINTS ---

export const getTeacherDashboard = async (teacherId) => {
    try {
        const response = await api.get(`/api/teacher/dashboard/teacher/${teacherId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTeacherProfile = async (teacherId) => {
    try {
        // Mobile used /profile/{teacherId} but checked backend url likely /api/teacher/profile/{teacherId}/
        const response = await api.get(`/api/teacher/profile/${teacherId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTeacherSubjects = async (teacherId) => {
    try {
        const response = await api.get(`/api/teacher/${teacherId}/subjects/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTeacherTodayTimetable = async (teacherId) => {
    try {
        const response = await api.get(`/api/teacher/${teacherId}/timetable/today/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- HOD ENDPOINTS ---

export const getHODDashboard = async (teacherId) => {
    try {
        const response = await api.get(`/api/teacher/hod/dashboard/${teacherId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getHODProfile = async (teacherId) => {
    try {
        const response = await api.get(`/api/teacher/hod/profile/${teacherId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getHODStudents = async (departmentId) => {
    try {
        const response = await api.get(`/api/teacher/hod/students/${departmentId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getHODTeachers = async (departmentId) => {
    try {
        const response = await api.get(`/api/teacher/hod/teachers/${departmentId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const promoteStudents = async (departmentId, currentSemester) => {
    try {
        const response = await api.post(`/api/teacher/hod/promote/`, {
            department_id: departmentId,
            current_semester: currentSemester
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const assignTeacherToSubject = async (teacherId, subjectId) => {
    try {
        const response = await api.post(`/api/teacher/hod/assign-teacher/`, {
            teacher_id: teacherId,
            subject_id: subjectId
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const postAnnouncement = async (teacherId, title, content, audience, departmentId) => {
    try {
        const response = await api.post(`/api/teacher/hod/announcement/`, {
            teacher_id: teacherId,
            title,
            content,
            audience,
            department_id: departmentId
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
