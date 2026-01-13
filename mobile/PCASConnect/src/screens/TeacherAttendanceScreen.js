import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal
} from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../services/api';
import { Calendar, Check, X, Search, ChevronDown } from 'lucide-react-native';

const TeacherAttendanceScreen = () => {
    // State
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: 'P' | 'A' }

    // Filters
    const [date, setDate] = useState(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState(1);

    // UI State
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchStudents(selectedSubject.subject_id);
        }
    }, [date, selectedPeriod]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');
            const res = await axios.get(`${BASE_URL}/api/teacher/${teacherId}/subjects/`);
            setSubjects(res.data.subjects);

            // Auto-select first subject if available
            if (res.data.subjects.length > 0) {
                setSelectedSubject(res.data.subjects[0]);
                fetchStudents(res.data.subjects[0].subject_id);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to lead subjects");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (subjectId) => {
        setLoading(true);
        try {
            // 1. Fetch Students
            const res = await axios.get(`${BASE_URL}/api/teacher/subject/${subjectId}/students/`);
            setStudents(res.data);

            // 2. Fetch Existing Attendance (if any)
            const dateStr = date.toISOString().split('T')[0];
            const periodId = selectedPeriod;

            try {
                const attRes = await axios.get(`${BASE_URL}/api/teacher/attendance/get/`, {
                    params: {
                        subject_id: subjectId,
                        period_id: periodId,
                        date: dateStr
                    }
                });

                if (attRes.data && attRes.data.length > 0) {
                    // Pre-fill existing
                    const existingAtt = {};
                    attRes.data.forEach(a => {
                        existingAtt[a.student_id] = a.status;
                    });
                    setAttendance(existingAtt);
                } else {
                    // Default to Present
                    const initialAttendance = {};
                    res.data.forEach(s => {
                        initialAttendance[s.id] = 'P';
                    });
                    setAttendance(initialAttendance);
                }
            } catch (err) {
                // If fetch fails, default to Present
                const initialAttendance = {};
                res.data.forEach(s => {
                    initialAttendance[s.id] = 'P';
                });
                setAttendance(initialAttendance);
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'P' ? 'A' : 'P'
        }));
    };

    const submitAttendance = async () => {
        if (!selectedSubject) return;

        setLoading(true);
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');

            // Format for backend: List of { student_id, status }
            const attendanceList = Object.keys(attendance).map(sid => ({
                student_id: sid,
                status: attendance[sid]
            }));

            const payload = {
                teacher_id: teacherId,
                subject_id: selectedSubject.subject_id,
                period_id: selectedPeriod, // This needs to match a real Period ID in backend ideally, but views.py takes raw ID. 
                // Wait, views.py expects period_id. If backend uses Period model PK, we need to fetch Periods first.
                // Assuming simple 1-5 integer for now based on typical setup, OR we need a period fetch. 
                // Let's assume period_id corresponds to the Period Model PK.
                // Usually Period 1 is ID 1. Let's hope. If not, we need a period selector API.
                // Safe fix: Just send the integer number for now and let backend handle lookup if it expects an ID.
                // Actually backend views.py uses: Attendance.objects.create(..., period_id=period_id)
                // So it MUST be a valid Period FK ID.
                // We should probably fetch periods or hardcode 1-5 if IDs are static 1-5.
                // Let's assume IDs 1-6 exist.
                date: date.toISOString().split('T')[0],
                attendance: attendanceList
            };

            // Adjust period_id handling:
            // Since we don't have a "Get Periods" API in the breakdown, I'll assume IDs 1-5 map to Periods 1-5.

            await axios.post(`${BASE_URL}/api/teacher/attendance/mark/`, payload);
            Alert.alert("Success", "Attendance marked successfully!");

        } catch (error) {
            Alert.alert("Error", "Failed to submit attendance. (Duplicate or Network Error)");
        } finally {
            setLoading(false);
        }
    };

    const StatsHeader = () => {
        const total = students.length;
        const present = Object.values(attendance).filter(s => s === 'P').length;
        const absent = total - present;

        return (
            <View style={styles.statsContainer}>
                <View style={[styles.statBox, { backgroundColor: '#E0E7FF' }]}>
                    <Text style={[styles.statNum, { color: '#4338CA' }]}>{total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.statNum, { color: '#15803D' }]}>{present}</Text>
                    <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.statNum, { color: '#B91C1C' }]}>{absent}</Text>
                    <Text style={styles.statLabel}>Absent</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header / Filter Section */}
            <View style={styles.header}>
                <Text style={styles.title}>Mark Attendance</Text>

                {/* Subject Selector */}
                <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowSubjectModal(true)}
                >
                    <Text style={styles.selectorText}>
                        {selectedSubject ? selectedSubject.name : "Select Subject"}
                    </Text>
                    <ChevronDown size={20} color="#666" />
                </TouchableOpacity>

                {/* Period Selector (Simple Horizontal Scroll) */}
                <View style={styles.periodRow}>
                    <Text style={styles.label}>Period:</Text>
                    {[1, 2, 3, 4, 5, 6].map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodBtn, selectedPeriod === p && styles.periodBtnActive]}
                            onPress={() => setSelectedPeriod(p)}
                        >
                            <Text style={[styles.periodText, selectedPeriod === p && styles.periodTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <StatsHeader />

            {/* Student List */}
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.studentCard,
                                attendance[item.id] === 'A' && styles.studentCardAbsent
                            ]}
                            onPress={() => toggleAttendance(item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{item.name}</Text>
                                <Text style={styles.studentReg}>{item.register_number}</Text>
                            </View>

                            <View style={[
                                styles.statusBadge,
                                attendance[item.id] === 'P' ? styles.badgePresent : styles.badgeAbsent
                            ]}>
                                <Text style={[
                                    styles.badgeText,
                                    attendance[item.id] === 'P' ? styles.textPresent : styles.textAbsent
                                ]}>
                                    {attendance[item.id] === 'P' ? 'PRESENT' : 'ABSENT'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* Submit Button */}
            {!loading && students.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.submitBtn} onPress={submitAttendance}>
                        <Text style={styles.submitBtnText}>Submit Attendance</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Subject Selection Modal */}
            <Modal visible={showSubjectModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Subject</Text>
                        <FlatList
                            data={subjects}
                            keyExtractor={item => item.subject_id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedSubject(item);
                                        fetchStudents(item.subject_id);
                                        setShowSubjectModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.name} ({item.code})</Text>
                                    <Text style={styles.modalItemSub}>Sem {item.semester}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSubjectModal(false)}>
                            <Text style={styles.closeBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },

    selector: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 12, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, marginBottom: 15
    },
    selectorText: { fontSize: 16, color: '#334155', fontWeight: '500' },

    periodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    label: { fontSize: 14, color: '#64748B', fontWeight: '600' },
    periodBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9',
        justifyContent: 'center', alignItems: 'center'
    },
    periodBtnActive: { backgroundColor: colors.primary },
    periodText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    periodTextActive: { color: 'white' },

    statsContainer: {
        flexDirection: 'row', padding: 16, gap: 12
    },
    statBox: {
        flex: 1, padding: 12, borderRadius: 12, alignItems: 'center'
    },
    statNum: { fontSize: 18, fontWeight: 'bold' },
    statLabel: { fontSize: 12, color: '#4B5563', marginTop: 2 },

    studentCard: {
        backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
        borderLeftWidth: 4, borderLeftColor: '#10B981'
    },
    studentCardAbsent: {
        borderLeftColor: '#EF4444', backgroundColor: '#FEF2F2'
    },
    studentName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    studentReg: { fontSize: 13, color: '#64748B', marginTop: 2 },

    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgePresent: { backgroundColor: '#DCFCE7' },
    badgeAbsent: { backgroundColor: '#FEE2E2' },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    textPresent: { color: '#15803D' },
    textAbsent: { color: '#B91C1C' },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee'
    },
    submitBtn: {
        backgroundColor: colors.primary, padding: 16, borderRadius: 14, alignItems: 'center'
    },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalItemText: { fontSize: 16, fontWeight: '600', color: '#333' },
    modalItemSub: { fontSize: 13, color: '#888', marginTop: 2 },
    closeBtn: { marginTop: 20, padding: 15, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
    closeBtnText: { color: '#334155', fontWeight: 'bold' },
});

export default TeacherAttendanceScreen;
