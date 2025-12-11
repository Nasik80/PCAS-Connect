import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, Alert, TouchableOpacity, ScrollView } from 'react-native';
import DashboardLayout from '../components/DashboardLayout';
import StatusTiles from '../components/StatusTiles';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, Calendar, Megaphone, UserPlus, ClipboardList } from 'lucide-react-native';
import axios from 'axios';
import { BASE_URL } from '../services/api';

const HODDashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [user, setUser] = useState(null);

    const fetchData = async () => {
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');

            if (!teacherId) return;

            // Fetch HOD Dashboard Data
            const response = await axios.get(`${BASE_URL}/api/teacher/dashboard/hod/${teacherId}/`);

            const d = response.data;

            setUser({
                name: d.hod.name,
                role: "HOD",
                department: d.hod.department,
                email: "hod@pcas.edu",
                phone: ""
            });

            setData(d);

        } catch (error) {
            console.log("HOD Dashboard Error", error);
            Alert.alert("Error", "Failed to load HOD dashboard");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
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
                <Text>Loading Dashboard...</Text>
            </View>
        );
    }

    const { stats, announcements, low_attendance } = data || {};

    const tiles = [
        {
            title: "Students",
            value: stats?.students || 0,
            color: '#4F46E5',
            onPress: () => navigation.navigate('Students') // Navigate to Tab
        },
        {
            title: "Teachers",
            value: stats?.teachers || 0,
            color: '#10B981',
            onPress: () => navigation.navigate('Teachers') // Navigate to Tab
        },
        {
            title: "Today's Attend.",
            value: `${stats?.today_attendance}%`,
            label: "Avg Dept Attendance",
            color: '#F59E0B',
            onPress: () => navigation.navigate('Attendance')
        },
        {
            title: "Subjects",
            value: stats?.subjects || 0,
            color: '#EC4899',
            onPress: () => { } // Maybe navigate to a subjects list if exists?
        }
    ];

    const QuickAction = ({ icon, label, onPress, color }) => (
        <TouchableOpacity style={[styles.qaBtn, { backgroundColor: color }]} onPress={onPress}>
            {icon}
            <Text style={styles.qaText}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <DashboardLayout
            user={user}
            onNavigate={(screen) => navigation.navigate(screen)}
            onLogout={handleLogout}
        >
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Department Overview</Text>
            </View>
            <StatusTiles tiles={tiles} />

            {/* Quick Actions Grid */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>

            <View style={styles.qaGrid}>
                <QuickAction
                    icon={<UserPlus color="white" size={24} />}
                    label="Promote Students"
                    color="#6366F1"
                    onPress={() => navigation.navigate('HODPromote')}
                />
                <QuickAction
                    icon={<Calendar color="white" size={24} />}
                    label="Timetable"
                    color="#8B5CF6"
                    onPress={() => navigation.navigate('Timetable')} // Tab
                />
                <QuickAction
                    icon={<ClipboardList color="white" size={24} />}
                    label="Assign Teacher"
                    color="#EC4899"
                    onPress={() => navigation.navigate('HODAssignTeacher')}
                />
                <QuickAction
                    icon={<Megaphone color="white" size={24} />}
                    label="Announcement"
                    color="#F59E0B"
                    onPress={() => navigation.navigate('HODAnnouncement')}
                />
            </View>

            {/* Low Attendance */}
            {low_attendance && low_attendance.length > 0 && (
                <View style={styles.warningSection}>
                    <Text style={styles.warningTitle}>Low Attendance Alerts</Text>
                    {low_attendance.map((s, i) => (
                        <Text key={i} style={styles.warningText}>{s.name} ({s.attendance}%)</Text>
                    ))}
                </View>
            )}

            {/* Announcements */}
            {announcements && announcements.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Latest Announcements</Text>
                    </View>
                    {announcements.map((ann, index) => (
                        <View key={index} style={styles.annCard}>
                            <Text style={styles.annTitle}>{ann.title}</Text>
                            <Text style={styles.annDate}>{ann.date}</Text>
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

    qaGrid: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between'
    },
    qaBtn: {
        width: '48%', Padding: 15, height: 100, borderRadius: 16, marginBottom: 16,
        justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 3
    },
    qaText: { color: 'white', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },

    annCard: {
        backgroundColor: 'white', padding: 16, marginHorizontal: 16, marginBottom: 10,
        borderRadius: 12, borderWidth: 1, borderColor: '#eee'
    },
    annTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    annDate: { fontSize: 12, color: '#888' },

    warningSection: { margin: 16, padding: 15, backgroundColor: '#FEF2F2', borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
    warningTitle: { color: '#EF4444', fontWeight: 'bold', marginBottom: 8 },
    warningText: { color: '#B91C1C', marginBottom: 4 }
});

export default HODDashboardScreen;
