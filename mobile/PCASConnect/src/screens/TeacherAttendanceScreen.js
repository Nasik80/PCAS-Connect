import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image
} from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../services/api';
import { Calendar, ChevronLeft, ChevronRight, Edit2, Save } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import DashboardLayout from '../components/DashboardLayout';

const TeacherAttendanceScreen = ({ navigation }) => {
    // State
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [schedule, setSchedule] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(1);
    const [currentClass, setCurrentClass] = useState(null);

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    // Fetch Schedule when Date changes
    useEffect(() => {
        fetchSchedule();
    }, [date]);

    // Update Current Class when Schedule or Period changes
    useEffect(() => {
        if (schedule.length > 0) {
            const found = schedule.find(p => p.period_number === selectedPeriod);
            setCurrentClass(found || null);
        } else {
            setCurrentClass(null);
        }
    }, [selectedPeriod, schedule]);

    // Fetch Students when Current Class changes
    useEffect(() => {
        if (currentClass) {
            fetchStudentsAndAttendance();
        } else {
            setStudents([]);
        }
    }, [currentClass]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');
            const dateStr = date.toISOString().split('T')[0];
            const res = await axios.get(`${BASE_URL}/api/teacher/schedule/${teacherId}/?date=${dateStr}`);
            setSchedule(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load schedule");
        } finally {
            setLoading(false);
            setInitialLoadDone(true);
        }
    };

    const fetchStudentsAndAttendance = async () => {
        if (!currentClass) return;
        setLoading(true);
        setIsEditing(false); // Reset edit mode on class switch

        try {
            // 1. Fetch Students
            const res = await axios.get(`${BASE_URL}/api/teacher/subject/${currentClass.subject_id}/students/`);
            setStudents(res.data);

            // 2. Check if Attendance already done (from Schedule or explicitly fetch)
            // The schedule endpoint already told us "attendance_done".
            // If done, fetch existing records. If not, default to "P".

            if (currentClass.attendance_done) {
                const dateStr = date.toISOString().split('T')[0];
                const attRes = await axios.get(`${BASE_URL}/api/teacher/attendance/get/`, {
                    params: {
                        subject_id: currentClass.subject_id,
                        period_id: selectedPeriod,
                        date: dateStr
                    }
                });

                const existingAtt = {};
                attRes.data.forEach(a => existingAtt[a.student_id] = a.status);
                setAttendance(existingAtt);
            } else {
                // Default Present
                const initialAtt = {};
                res.data.forEach(s => initialAtt[s.id] = 'P');
                setAttendance(initialAtt);
            }

        } catch (error) {
            Alert.alert("Error", "Failed to load class data");
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId) => {
        // Prevent editing if attendance done and not in edit mode
        if (currentClass?.attendance_done && !isEditing) return;

        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'P' ? 'A' : 'P'
        }));
    };

    const handleSave = async () => {
        if (!currentClass) return;

        setLoading(true);
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');
            const attendanceList = Object.keys(attendance).map(sid => ({
                student_id: sid,
                status: attendance[sid]
            }));

            const payload = {
                teacher_id: teacherId,
                subject_id: currentClass.subject_id,
                period_id: selectedPeriod,
                date: date.toISOString().split('T')[0],
                attendance: attendanceList
            };

            await axios.post(`${BASE_URL}/api/teacher/attendance/mark/`, payload);

            Alert.alert("Success", "Attendance Saved!");
            setIsEditing(false);
            fetchSchedule(); // Refresh schedule to update 'attendance_done' flag

        } catch (error) {
            Alert.alert("Error", "Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    // Render Logic
    const isReadOnly = currentClass?.attendance_done && !isEditing;

    return (
        <DashboardLayout
            user={null}
            disableScroll={true} // We have a FlatList inside
            onNavigate={(screen) => {
                if (screen === 'Home') {
                    navigation.navigate('TeacherDashboard');
                } else {
                    navigation.navigate(screen);
                }
            }}
            onLogout={handleLogout}
        >
            <View style={{ flex: 1 }}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.title}>Mark Attendance</Text>
                        {currentClass?.attendance_done && (
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => setIsEditing(true)}
                                disabled={isEditing}
                            >
                                <Edit2 size={20} color={isEditing ? '#ccc' : colors.primary} />
                                <Text style={[styles.editBtnText, isEditing && { color: '#ccc' }]}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Date Picker */}
                    <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                        <Calendar size={20} color="#666" />
                        <Text style={styles.dateText}>{date.toDateString()}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
                    )}

                    {/* Period Selector */}
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

                {/* Class Info Box */}
                <View style={styles.infoBox}>
                    {currentClass ? (
                        <View>
                            <Text style={styles.subTitle}>Subject</Text>
                            <Text style={styles.subName}>{currentClass.subject}</Text>
                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, styles.semBadge]}>
                                    <Text style={styles.badgeText}>Semester {currentClass.semester}</Text>
                                </View>
                                {currentClass.attendance_done && (
                                    <View style={[styles.badge, styles.doneBadge]}>
                                        <Text style={[styles.badgeText, { color: '#15803D' }]}>Saved</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.noClassText}>No class assigned for Period {selectedPeriod}</Text>
                    )}
                </View>

                {/* Student List */}
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={students}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        ListEmptyComponent={
                            !loading && initialLoadDone && currentClass && <Text style={styles.emptyText}>No students found.</Text>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.studentCard,
                                    attendance[item.id] === 'A' && styles.studentCardAbsent,
                                    isReadOnly && { opacity: 0.8 }
                                ]}
                                onPress={() => toggleAttendance(item.id)}
                                activeOpacity={isReadOnly ? 1 : 0.7}
                                disabled={isReadOnly}
                            >
                                <View>
                                    <Text style={styles.studentName}>{item.name}</Text>
                                    <Text style={styles.studentReg}>{item.register_number}</Text>
                                </View>

                                <View style={[
                                    styles.statusBadge,
                                    attendance[item.id] === 'P' ? styles.badgePresent : styles.badgeAbsent
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        attendance[item.id] === 'P' ? styles.textPresent : styles.textAbsent
                                    ]}>
                                        {attendance[item.id] === 'P' ? 'P' : 'A'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}

                {/* Save Button */}
                {currentClass && (!currentClass.attendance_done || isEditing) && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
                            <Save size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.submitBtnText}>Save Attendance</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </DashboardLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },

    editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 8, borderRadius: 8 },
    editBtnText: { marginLeft: 5, color: colors.primary, fontWeight: '600' },

    dateSelector: {
        flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#CBD5E1',
        borderRadius: 12, marginBottom: 15
    },
    dateText: { marginLeft: 10, fontSize: 16, color: '#334155' },

    periodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    label: { fontSize: 14, color: '#64748B', fontWeight: '600' },
    periodBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    periodBtnActive: { backgroundColor: colors.primary },
    periodText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    periodTextActive: { color: 'white' },

    infoBox: { padding: 20, backgroundColor: '#EFF6FF' },
    subTitle: { fontSize: 12, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
    subName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginVertical: 4 },
    badgeRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    semBadge: { backgroundColor: '#DBEAFE' },
    doneBadge: { backgroundColor: '#DCFCE7' },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#1E40AF' },

    noClassText: { fontSize: 16, color: '#64748B', textAlign: 'center', fontStyle: 'italic', marginTop: 10 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },

    studentCard: {
        backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        elevation: 2, borderLeftWidth: 4, borderLeftColor: '#10B981'
    },
    studentCardAbsent: { borderLeftColor: '#EF4444', backgroundColor: '#FEF2F2' },
    studentName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    studentReg: { fontSize: 13, color: '#64748B', marginTop: 2 },

    statusBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#DCFCE7' },
    badgePresent: { backgroundColor: '#DCFCE7' },
    badgeAbsent: { backgroundColor: '#FEE2E2' },
    statusText: { fontWeight: 'bold' },
    textPresent: { color: '#15803D' },
    textAbsent: { color: '#B91C1C' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
    submitBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default TeacherAttendanceScreen;
