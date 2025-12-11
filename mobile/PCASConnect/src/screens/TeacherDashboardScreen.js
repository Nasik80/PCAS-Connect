import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import DashboardLayout from '../components/DashboardLayout';
import StatusTiles from '../components/StatusTiles';
import { colors } from '../constants/colors';
import { getTeacherDashboard } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckCircle, Clock } from 'lucide-react-native';
import axios from 'axios';
import { BASE_URL } from '../services/api';

// Need to implement getTeacherDashboard in API service or do axios call here for now.
// I will implement a local fetch helper for now to keep it self-contained or use axios directly.

const TeacherDashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [user, setUser] = useState(null);

    const fetchData = async () => {
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');

            if (!teacherId) {
                // Should redirect to login
                return;
            }

            // Fetch Dashboard Data
            const response = await axios.get(`${BASE_URL}/api/teacher/dashboard/teacher/${teacherId}/`);

            const d = response.data;

            // Normalize user data for layout
            setUser({
                name: d.teacher.name,
                role: d.teacher.role,
                department: d.teacher.department,
                email: "teacher@pcas.edu", // Fallback or need to fetch from profile
                phone: ""
            });

            setData(d);

        } catch (error) {
            console.log("Dashboard Error", error);
            // Alert.alert("Error", "Failed to load dashboard");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Also fetch profile manually if needed to get email/phone if dash doesn't return it
        // For now sticking to what dash returns.
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    if (loading && !data) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const { stats, subjects, announcements } = data || {};

    const tiles = [
        {
            title: "Subjects Taught",
            value: stats?.subjects_count || 0,
            color: '#4F46E5',
            onPress: () => navigation.navigate('Subjects')
        },
        {
            title: "Classes Today",
            value: stats?.today_classes || 0,
            color: '#10B981',
            onPress: () => navigation.navigate('Timetable')
        },
        {
            title: "Pending Attendance",
            value: stats?.pending_attendance || 0,
            label: "Action Required",
            color: stats?.pending_attendance > 0 ? '#EF4444' : '#10B981',
            onPress: () => navigation.navigate('Attendance') // Or today's status
        }
    ];

    return (
        <DashboardLayout
            user={user}
            onNavigate={(screen) => navigation.navigate(screen)}
            onLogout={handleLogout}
        >
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Overview</Text>
            </View>
            <StatusTiles tiles={tiles} />

            {/* Quick Actions / Today's Highlights */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>

            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('Attendance')}
            >
                <CheckCircle size={24} color="white" />
                <Text style={styles.actionBtnText}>Mark Attendance</Text>
            </TouchableOpacity>

            {/* Announcements Preview */}
            {announcements && announcements.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Latest Announcements</Text>
                    </View>
                    {announcements.map((ann, index) => (
                        <View key={index} style={styles.annCard}>
                            <Text style={styles.annTitle}>{ann.title}</Text>
                            <Text style={styles.annDate}>{ann.date} • {ann.sender}</Text>
                        </View>
                    ))}
                </>
            )}

        </DashboardLayout>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionHeader: { paddingHorizontal: 20, marginBottom: 10, marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

    actionBtn: {
        backgroundColor: colors.primary, marginHorizontal: 16, padding: 16, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        marginBottom: 20, elevation: 3
    },
    actionBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    annCard: {
        backgroundColor: 'white', padding: 16, marginHorizontal: 16, marginBottom: 10,
        borderRadius: 12, borderWidth: 1, borderColor: '#eee'
    },
    annTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    annDate: { fontSize: 12, color: '#888' }
});

export default TeacherDashboardScreen;
