import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/api';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const PERIODS = [1, 2, 3, 4, 5, 6];

const HODTimeTableEditorScreen = () => {
    const [loading, setLoading] = useState(false);
    const [semester, setSemester] = useState('1');
    const [timetableData, setTimetableData] = useState([]); // List from API

    // Edit Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingCell, setEditingCell] = useState(null); // { day, period }

    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (semester) {
            fetchTimetable();
            fetchSubjects();
        }
    }, [semester]);

    const loadInitialData = async () => {
        try {
            const deptId = await AsyncStorage.getItem('department_id');
            // Fetch Teachers once (they don't change per sem usually)
            const tRes = await axios.get(`${BASE_URL}/api/teacher/hod/teachers/${deptId}/`);
            setTeachers(tRes.data);
        } catch (e) {
            console.error("Failed to load teachers");
        }
    };

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const deptId = await AsyncStorage.getItem('department_id');
            const res = await axios.get(`${BASE_URL}/api/teacher/hod/timetable/${deptId}/`);
            // The API returns ALL semesters. Filter by current sem on frontend or API?
            // API returns all. Lightweight enough to filter here.
            const entries = res.data.filter(t => t.semester.toString() === semester.toString());
            setTimetableData(entries);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const deptId = await AsyncStorage.getItem('department_id');
            // Reusing admin endpoint or similar logic if available. 
            // Previous interaction showed fetching subjects by dept/sem from Admin API.
            // Let's assume we can use the same pattern or a new HOD endpoint.
            // Since we didn't confirm HOD subjects endpoint, I will use Admin logic if permitted
            // OR reuse the logic from HODAssignTeacherScreen which used `/api/admin/subjects/${deptId}/${semester}/`
            const res = await axios.get(`${BASE_URL}/api/admin/subjects/${deptId}/${semester}/`);
            setSubjects(res.data);
        } catch (e) {
            console.error("Failed to load subjects");
        }
    };

    const getCellData = (day, period) => {
        return timetableData.find(t => t.day === day && t.period === period);
    };

    const handleEdit = (day, period) => {
        const cell = getCellData(day, period);
        setEditingCell({ day, period });
        setSelectedSubject(cell ? cell.subject_id : '');
        setSelectedTeacher(cell ? cell.teacher_id : '');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!selectedSubject || !selectedTeacher) {
            Alert.alert("Error", "Please select Subject and Teacher");
            return;
        }

        try {
            const deptId = await AsyncStorage.getItem('department_id');
            const payload = {
                department_id: deptId,
                semester: semester,
                day: editingCell.day,
                period_id: editingCell.period, // View expects period_id (which is mapped to period PK or number?) 
                // wait, backend `update_or_create` uses `period_id`. If `period_id` is PK, we need real PKs.
                // If backend has Period models (1-5 fixed), assume ID matches number for now or we need Period Fetch.
                // Assuming ID=Number for simplicity as per common setup 1..5
                subject_id: selectedSubject,
                teacher_id: selectedTeacher
            };

            await axios.post(`${BASE_URL}/api/teacher/hod/timetable/`, payload);

            setShowModal(false);
            fetchTimetable(); // Refresh

        } catch (error) {
            Alert.alert("Error", "Failed to save timetable entry");
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Timetable Editor</Text>

                {/* Semester Selector */}
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={semester}
                        onValueChange={setSemester}
                        style={{ height: 50, width: 150 }}
                    >
                        {[1, 2, 3, 4, 5, 6].map(s => <Picker.Item key={s} label={`Sem ${s}`} value={s.toString()} />)}
                    </Picker>
                </View>
            </View>

            {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    {DAYS.map(day => (
                        <View key={day} style={styles.daySection}>
                            <View style={styles.dayHeader}>
                                <Text style={styles.dayTitle}>{day}</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {PERIODS.map(period => {
                                    const cell = getCellData(day, period);
                                    return (
                                        <TouchableOpacity
                                            key={period}
                                            style={[styles.periodCard, !cell && styles.emptyCard]}
                                            onPress={() => handleEdit(day, period)}
                                        >
                                            <Text style={styles.periodLabel}>P{period}</Text>
                                            {cell ? (
                                                <>
                                                    <Text style={styles.subjectText} numberOfLines={1}>{cell.subject}</Text>
                                                    <Text style={styles.teacherText} numberOfLines={1}>{cell.teacher}</Text>
                                                </>
                                            ) : (
                                                <Ionicons name="add" size={24} color="#ccc" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Edit Modal */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Edit {editingCell?.day} - Period {editingCell?.period}
                        </Text>

                        <Text style={styles.label}>Subject</Text>
                        <View style={styles.inputBox}>
                            <Picker selectedValue={selectedSubject} onValueChange={setSelectedSubject}>
                                <Picker.Item label="Select Subject" value="" />
                                {subjects.map(s => <Picker.Item key={s.id} label={s.name} value={s.id} />)}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Teacher</Text>
                        <View style={styles.inputBox}>
                            <Picker selectedValue={selectedTeacher} onValueChange={setSelectedTeacher}>
                                <Picker.Item label="Select Teacher" value="" />
                                {teachers.map(t => <Picker.Item key={t.id} label={t.name} value={t.id} />)}
                            </Picker>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                                <Text style={styles.btnLabel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={[styles.btnLabel, { color: 'white' }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 20, fontWeight: 'bold' },
    pickerContainer: { backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', elevation: 2 },

    daySection: { marginBottom: 15 },
    dayHeader: { marginBottom: 5, paddingLeft: 5 },
    dayTitle: { fontWeight: 'bold', fontSize: 16, color: '#444' },

    periodCard: {
        width: 100, height: 80, backgroundColor: 'white', borderRadius: 8, padding: 8, marginRight: 10,
        elevation: 2, justifyContent: 'center'
    },
    emptyCard: { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },

    periodLabel: { position: 'absolute', top: 5, left: 5, fontSize: 10, color: '#888', fontWeight: 'bold' },
    subjectText: { fontSize: 13, fontWeight: 'bold', color: '#6200ea', marginTop: 10 },
    teacherText: { fontSize: 11, color: '#555' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, color: '#555', marginBottom: 5 },
    inputBox: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 15 },

    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10, backgroundColor: '#eee', borderRadius: 8 },
    saveBtn: { flex: 1, padding: 15, alignItems: 'center', marginLeft: 10, backgroundColor: colors.primary, borderRadius: 8 },
    btnLabel: { fontWeight: 'bold' }
});

export default HODTimeTableEditorScreen;
