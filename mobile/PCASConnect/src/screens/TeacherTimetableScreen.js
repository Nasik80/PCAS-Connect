import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { colors } from '../constants/colors';
import { Picker } from '@react-native-picker/picker';

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const PERIODS = [1, 2, 3, 4, 5, 6];

const TeacherTimetableScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('ALL');

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');
            if (!teacherId) return;

            const res = await axios.get(`${BASE_URL}/api/teacher/timetable/weekly/${teacherId}/`);
            setTimetable(res.data);
        } catch (error) {
            console.error("Timetable Fetch Error", error);
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

    const getCell = (day, period) => {
        // Filter first
        let data = timetable;
        if (selectedSemester !== 'ALL') {
            data = timetable.filter(t => t.semester.toString() === selectedSemester);
        }
        return data.find(t => t.day === day && t.period === period);
    };

    // Filter out rows (days) if they have NO classes for selected semester?
    // Or just show empty rows. For stability, showing all days is better, just empty slots.

    return (
        <DashboardLayout
            user={null}
            onNavigate={(screen) => {
                if (screen === 'Home') {
                    navigation.navigate('TeacherDashboard');
                } else {
                    navigation.navigate(screen);
                }
            }}
            onLogout={handleLogout}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>Weekly Timetable</Text>
                        <Text style={styles.subtitle}>My Class Schedule</Text>
                    </View>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedSemester}
                            onValueChange={(itemValue) => setSelectedSemester(itemValue)}
                            style={styles.picker}
                            dropdownIconColor={colors.primary}
                        >
                            <Picker.Item label="Sem 1" value="1" />
                            <Picker.Item label="Sem 2" value="2" />
                            <Picker.Item label="Sem 3" value="3" />
                            <Picker.Item label="Sem 4" value="4" />
                            <Picker.Item label="Sem 5" value="5" />
                            <Picker.Item label="Sem 6" value="6" />
                        </Picker>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {DAYS.map(day => (
                            <View key={day} style={styles.dayRow}>
                                {/* Day Header (Side) */}
                                <View style={styles.dayLabelContainer}>
                                    <Text style={styles.dayLabel}>{day}</Text>
                                </View>

                                {/* Periods (Horizontal) */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodsScroll}>
                                    {PERIODS.map(p => {
                                        const cell = getCell(day, p);
                                        return (
                                            <View key={p} style={[styles.card, !cell && styles.emptyCard]}>
                                                <Text style={styles.periodNum}>P{p}</Text>
                                                {cell ? (
                                                    <View>
                                                        <Text style={styles.subjectText} numberOfLines={2}>
                                                            {cell.subject}
                                                        </Text>
                                                        <View style={styles.metaRow}>
                                                            <Text style={styles.semText}>Sem {cell.semester}</Text>
                                                            <Text style={styles.codeText}>{cell.code}</Text>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <Text style={styles.freeText}>Free</Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </DashboardLayout>
    );
};

const styles = StyleSheet.create({
    content: { flex: 1 },
    header: {
        padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    headerLeft: { flex: 1 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

    pickerContainer: {
        width: 170, height: 55, backgroundColor: '#EFF6FF', borderRadius: 8, justifyContent: 'center',
        borderWidth: 1, borderColor: '#DBEAFE', overflow: 'hidden'
    },
    picker: { height: 55, width: 180, color: colors.primary },

    scrollContainer: { padding: 16 },

    dayRow: { marginBottom: 20 },
    dayLabelContainer: { marginBottom: 8 },
    dayLabel: { fontSize: 18, fontWeight: 'bold', color: '#334155' },

    periodsScroll: { flexDirection: 'row' },
    card: {
        width: 140, height: 100, backgroundColor: 'white',
        borderRadius: 12, padding: 12, marginRight: 12,
        shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        justifyContent: 'center'
    },
    emptyCard: { backgroundColor: '#F8FAFC', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },

    periodNum: { position: 'absolute', top: 8, right: 8, fontSize: 12, color: '#94A3B8', fontWeight: 'bold' },

    subjectText: { fontSize: 14, fontWeight: 'bold', color: colors.primary, marginBottom: 4, marginRight: 10 },

    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    semText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    codeText: { fontSize: 10, color: '#94A3B8', backgroundColor: '#F1F5F9', paddingHorizontal: 4, borderRadius: 4 },

    freeText: { alignSelf: 'center', color: '#CBD5E1', fontWeight: '600', fontSize: 16 }
});

export default TeacherTimetableScreen;
