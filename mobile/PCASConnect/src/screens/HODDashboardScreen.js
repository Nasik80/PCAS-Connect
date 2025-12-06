import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../api/auth';

const HODDashboardScreen = ({ navigation }) => {
    const [stats, setStats] = useState(null);
    const [hodName, setHodName] = useState('');
    const [departmentName, setDepartmentName] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const teacherId = await AsyncStorage.getItem('teacher_id');
            const name = await AsyncStorage.getItem('name');
            const dept = await AsyncStorage.getItem('department');

            setHodName(name);
            setDepartmentName(dept);

            // Fetch dashboard stats from backend
            // Endpoint: /api/teacher/hod/dashboard/<teacher_id>/
            const response = await axios.get(`${BASE_URL}/api/teacher/hod/dashboard/${teacherId}/`);
            setStats(response.data);

        } catch (error) {
            console.error("Failed to fetch HOD stats", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchStats().then(() => setRefreshing(false));
    }, []);

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {hodName}</Text>
                    <Text style={styles.subGreeting}>HOD - {departmentName}</Text>
                </View>
                <TouchableOpacity onPress={async () => {
                    await AsyncStorage.clear();
                    navigation.replace('RoleSelect');
                }}>
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                    <Text style={styles.statNumber}>{stats ? stats.total_students : '-'}</Text>
                    <Text style={styles.statLabel}>Students</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={styles.statNumber}>{stats ? stats.total_teachers : '-'}</Text>
                    <Text style={styles.statLabel}>Teachers</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={styles.statNumber}>{stats ? stats.total_subjects : '-'}</Text>
                    <Text style={styles.statLabel}>Subjects</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
                    <Text style={styles.statNumber}>{stats ? stats.today_attendance_percent + '%' : '-'}</Text>
                    <Text style={styles.statLabel}>Today's Attd.</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Students')}>
                    <Ionicons name="school" size={24} color="#6200ea" />
                    <Text style={styles.actionText}>Students</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Teachers')}>
                    <Ionicons name="people" size={24} color="#6200ea" />
                    <Text style={styles.actionText}>Teachers</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Timetable')}>
                    <Ionicons name="calendar" size={24} color="#6200ea" />
                    <Text style={styles.actionText}>Timetable</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('hod-promote')}>
                    {/* We need to register this screen in stack or modal, or just inside StudentList */}
                    <Ionicons name="trending-up" size={24} color="#6200ea" />
                    <Text style={styles.actionText}>Promote</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('hod-announcement')}>
                    <Ionicons name="megaphone" size={24} color="#6200ea" />
                    <Text style={styles.actionText}>Post Notice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('hod-assign-teacher')}>
                    <Ionicons name="person-add" size={24} color="#6200ea" />
                    <Text style={styles.actionText}>Assign Subj</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        backgroundColor: '#6200ea',
        padding: 20,
        paddingTop: 50,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    greeting: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    subGreeting: { color: '#e0e0e0', fontSize: 14 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-between',
        marginTop: 20
    },
    statCard: {
        width: '48%',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2
    },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: 14, color: '#666', marginTop: 5 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginTop: 10, marginBottom: 10 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, paddingHorizontal: 10 },
    actionBtn: {
        backgroundColor: '#fff',
        width: 80,
        height: 80,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2
    },
    actionText: { fontSize: 12, marginTop: 5, color: '#333', textAlign: 'center' }
});

export default HODDashboardScreen;
