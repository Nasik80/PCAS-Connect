import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../services/api';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/colors';

import DashboardLayout from '../components/DashboardLayout';

const TeacherSubjectsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [teacherName, setTeacherName] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchSubjects = async () => {
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');
            if (!teacherId) return;

            const res = await axios.get(`${BASE_URL}/api/teacher/${teacherId}/subjects/`);
            setSubjects(res.data.subjects);
            setTeacherName(res.data.teacher);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSubjects();
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    // Render components
    const renderSubject = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={styles.iconBox}>
                <BookOpen color={colors.primary} size={24} />
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.codeBadge}>{item.code}</Text>
                    <Text style={styles.semText}>Semester {item.semester}</Text>
                </View>
            </View>
            <View style={styles.arrowBox}>
                <ChevronRight color="#CBD5E1" size={20} />
            </View>
        </TouchableOpacity>
    );

    return (
        <DashboardLayout
            user={null}
            disableScroll={true}
            onNavigate={(screen) => {
                if (screen === 'Home') {
                    navigation.navigate('TeacherDashboard');
                } else {
                    navigation.navigate(screen);
                }
            }}
            onLogout={handleLogout}
        >
            <View style={styles.header}>
                <Text style={styles.title}>My Subjects</Text>
                <Text style={styles.subtitle}>Assigned Courses</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : subjects.length === 0 ? (
                <View style={[styles.center, { marginTop: 50 }]}>
                    <BookOpen size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No subjects assigned yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={subjects}
                    keyExtractor={(item) => item.subject_id.toString()}
                    renderItem={renderSubject}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </DashboardLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },

    listContent: { padding: 16 },

    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    iconBox: {
        width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF',
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    infoBox: { flex: 1 },
    subjectName: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 6 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    codeBadge: {
        fontSize: 12, fontWeight: 'bold', color: '#4F46E5',
        backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6
    },
    semText: { fontSize: 13, color: '#64748B' },

    arrowBox: { paddingLeft: 10 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' }
});

export default TeacherSubjectsScreen;
