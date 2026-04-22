import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, RefreshControl, Dimensions, TouchableOpacity
} from 'react-native';
import { colors } from '../constants/colors';
import {
  Calendar, Activity, Clock, User
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DashboardLayout from '../components/DashboardLayout';
import AttendanceProgress from '../components/AttendanceProgress';
import { API_BASE_URL } from '../config';
import {
  getStudentDashboard,
  getStudentProfile,
  getTodayAttendance,
  getMonthlyAttendance
} from '../api/studentApi';

const StudentDashboardScreen = ({ route, navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentId, setStudentId] = useState(null);

  // Data State
  const [profile, setProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [monthData, setMonthData] = useState(null);

  // Normalized User for DashboardLayout
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedStudent = await AsyncStorage.getItem("student");
      let id = null;

      if (route.params?.userData?.student_id) {
        id = route.params.userData.student_id;
      } else if (storedStudent) {
        const parsed = JSON.parse(storedStudent);
        id = parsed.student_id;
      }

      if (id) {
        setStudentId(id);
        fetchAllData(id);
      } else {
        navigation.replace("RoleSelect");
      }
    } catch (e) {
      console.error("Storage Error", e);
      navigation.replace("RoleSelect");
    }
  };

  const fetchAllData = async (id) => {
    if (!refreshing) setLoading(true);

    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const [profileRes, statsRes, todayRes, monthRes] = await Promise.all([
        getStudentProfile(id),
        getStudentDashboard(id),
        getTodayAttendance(id),
        getMonthlyAttendance(id, currentYear, currentMonth)
      ]);

      setProfile(profileRes);
      setDashboardStats(statsRes);
      setTodayData(todayRes);
      setMonthData(monthRes);

      let avatarUrl = profileRes?.profile_image;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = `${API_BASE_URL}${avatarUrl}`;
      }

      setUser({
        name: profileRes?.name || "Student",
        role: "Student",
        department: `${profileRes?.department_name || "Dept"} • Sem ${profileRes?.semester || 1}`,
        email: profileRes?.email || "student@pcas.edu",
        phone: profileRes?.phone_number || "",
        profile_image: avatarUrl
      });

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (studentId) fetchAllData(studentId);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
  };

  if (loading && !profile) {
    // DashboardLayout can handle loading state if we want, but for now simple fallback
    return (
      <View style={styles.centerContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  // Stats Logic
  const presentCount = monthData?.present !== undefined ? monthData.present : 0;
  const totalCount = monthData?.total !== undefined ? monthData.total : 0;
  const monthPercentage = monthData?.percentage !== undefined ? monthData.percentage : 0;

  const todayTotal = todayData?.total !== undefined ? todayData.total : 0;
  const todayPresent = todayData?.present !== undefined ? todayData.present : 0;
  const todayAbsent = todayData?.absent !== undefined ? todayData.absent : 0;

  return (
    <DashboardLayout
      user={user}
      onNavigate={(screen) => navigation.navigate(screen)}
      onLogout={handleLogout}
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

      <Animated.View style={{ opacity: fadeAnim }}>

        {/* Stats Grid - Moved below ID Card (handled by layout) */}
        <View style={styles.statsGrid}>

          {/* Today's Summary Card */}
          <View style={[styles.statCard, styles.shadow]}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Today's Status</Text>
              <Clock size={18} color={colors.secondary} />
            </View>
            <View style={styles.todayStats}>
              <View style={styles.todayRow}>
                <Text style={styles.todayVal}>{todayTotal}</Text>
                <Text style={styles.todayLbl}>Classes</Text>
              </View>
              <View style={styles.todayRow}>
                <Text style={[styles.todayVal, { color: colors.success }]}>{todayPresent}</Text>
                <Text style={styles.todayLbl}>Present</Text>
              </View>
              <View style={styles.todayRow}>
                <Text style={[styles.todayVal, { color: colors.error }]}>{todayAbsent}</Text>
                <Text style={styles.todayLbl}>Absent</Text>
              </View>
            </View>
          </View>

          {/* Semester Attendance Card */}
          <View style={[styles.statCard, styles.shadow]}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Current Sem</Text>
              <Activity size={18} color={colors.primary} />
            </View>
            <View style={styles.statContent}>
              <AttendanceProgress percentage={monthPercentage} radius={38} strokeWidth={8} showText={false} />
              <View style={styles.statDetails}>
                <Text style={styles.bigStat}>{monthPercentage}%</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
            <View style={styles.statFooter}>
              <Text style={styles.footerText}>{presentCount}/{totalCount}</Text>
            </View>
          </View>

        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 }}>
           <TouchableOpacity 
             style={{ flex: 1, backgroundColor: colors.primary, padding: 12, borderRadius: 12, alignItems: 'center' }}
             onPress={() => navigation.navigate('StudentAnnouncements')}
           >
             <Text style={{ color: 'white', fontWeight: 'bold' }}>Announcements</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={{ flex: 1, backgroundColor: colors.secondary || '#3b82f6', padding: 12, borderRadius: 12, alignItems: 'center' }}
             onPress={() => navigation.navigate('StudentInternalMarks')}
           >
             <Text style={{ color: 'white', fontWeight: 'bold' }}>Internal Marks</Text>
           </TouchableOpacity>
        </View>

        {/* Today's Schedule */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Text style={styles.dateText}>{new Date().toDateString()}</Text>
        </View>

        <View style={styles.timelineContainer}>
          {todayData?.details?.length > 0 ? (
            todayData.details.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineTimeCol}>
                  <Text style={styles.periodLabel}>PERIOD</Text>
                  <Text style={styles.periodNumber}>{item.period}</Text>
                </View>

                <View style={styles.timelineIndicatorCol}>
                  <View style={[
                    styles.timelineDot,
                    { backgroundColor: item.status === 'P' ? colors.success : colors.error }
                  ]} />
                  {index !== todayData.details.length - 1 && <View style={styles.timelineLine} />}
                </View>

                <View style={[styles.timelineCard, styles.shadow]}>
                  <View style={styles.timelineContent}>
                    <Text style={styles.subjectName}>{item.subject}</Text>
                    <View style={styles.metaRow}>
                      <User size={12} color={colors.textSecondary} />
                      <Text style={styles.teacherName}> {item.teacher || "No Tutor"}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'P' ? '#DCFCE7' : '#FEE2E2' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: item.status === 'P' ? colors.success : colors.error }
                    ]}>
                      {item.status === 'P' ? 'Present' : 'Absent'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar color={colors.textLight} size={40} />
              <Text style={styles.emptyText}>No classes scheduled for today.</Text>
            </View>
          )}
        </View>

      </Animated.View>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Layout adjustments
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24, marginTop: 10 },
  statCard: { width: '48%', backgroundColor: 'white', borderRadius: 20, padding: 16, minHeight: 140, justifyContent: 'space-between' },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },

  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },

  statContent: { alignItems: 'center', marginVertical: 4 },
  statDetails: { alignItems: 'center', marginTop: 4 },
  bigStat: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  statFooter: { alignItems: 'center', marginTop: 2 },
  footerText: { fontSize: 10, color: colors.textSecondary },

  todayStats: { gap: 8 },
  todayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayVal: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  todayLbl: { fontSize: 12, color: colors.textSecondary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  dateText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  timelineContainer: { paddingHorizontal: 24 },
  timelineItem: { flexDirection: 'row', minHeight: 80 },

  timelineTimeCol: { width: 50, alignItems: 'flex-end', marginRight: 12, paddingTop: 18 },
  periodLabel: { fontSize: 9, color: colors.textLight, fontWeight: '700' },
  periodNumber: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },

  timelineIndicatorCol: { alignItems: 'center', width: 20, marginRight: 10 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, marginTop: 22, borderWidth: 2, borderColor: '#F1F5F9', zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: -4 },

  timelineCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineContent: { flex: 1 },
  subjectName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  teacherName: { fontSize: 12, color: colors.textSecondary, marginLeft: 4 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },

  emptyState: { padding: 40, alignItems: 'center', backgroundColor: 'white', borderRadius: 20 },
  emptyText: { color: colors.textSecondary, marginTop: 12, fontSize: 14, fontWeight: '500' }
});

export default StudentDashboardScreen;