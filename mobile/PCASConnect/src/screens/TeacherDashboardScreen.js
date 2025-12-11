import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import IdentityCard from '../components/IdentityCard';
import StatusCard from '../components/StatusCard';
import { getTeacherDashboard } from '../api/teacherApi';
import { BookOpen, Calendar, Clock, Bell, Menu } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const TeacherDashboardScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total_subjects_handling: 0,
        todays_classes: 0,
        pending_attendance_count: 0,
        announcements_count: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const userDataStr = await AsyncStorage.getItem('user_data');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                setUser(userData);

                // Fetch Stats
                const dashboardData = await getTeacherDashboard(userData.teacher_id);
                setStats(dashboardData);
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Menu color={colors.textPrimary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PCAS CONNECT</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {user && (
                    <IdentityCard
                        name={user.name}
                        role="Faculty"
                        department={user.department}
                        email={user.email}
                        phone={user.phone} // If available
                    />
                )}

                <View style={styles.statsGrid}>
                    <StatusCard
                        title="Subjects"
                        value={stats.total_subjects_handling}
                        icon={<BookOpen color="white" size={24} />}
                        gradient={colors.gradientPrimary}
                    />
                    <StatusCard
                        title="Today's Classes"
                        value={stats.todays_classes}
                        icon={<Calendar color="white" size={24} />}
                        gradient={colors.gradientSecondary}
                    />
                    <StatusCard
                        title="Pending Attendance"
                        value={stats.pending_attendance_count}
                        icon={<Clock color="white" size={24} />}
                        gradient={['#F43F5E', '#E11D48']} // Rose gradient
                    />
                    <StatusCard
                        title="Announcements"
                        value={stats.announcements_count}
                        icon={<Bell color="white" size={24} />}
                        gradient={['#10B981', '#059669']} // Emerald gradient
                    />
                </View>

                {/* Additional Quick Actions or Info can go here */}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollContent: {
        paddingBottom: 40
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 24
    }
});

export default TeacherDashboardScreen;
