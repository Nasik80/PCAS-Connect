import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Animated, RefreshControl, StatusBar, Dimensions
} from 'react-native';
import { colors } from '../constants/colors';
import {
  LogOut, Calendar, CheckCircle, XCircle, BookOpen, Clock, Activity, User
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import Card from '../components/Card';
import AttendanceProgress from '../components/AttendanceProgress';
import {
  getStudentProfile,
  getTodayAttendance,
  getMonthlyAttendance
} from '../api/studentApi';

const { width } = Dimensions.get('window');

const StudentDashboardScreen = ({ route, navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentId, setStudentId] = useState(null);

  // Data State
  const [profile, setProfile] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [monthData, setMonthData] = useState(null);

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

      console.log(`Fetching data for Student ID: ${id}`);

      const [profileRes, todayRes, monthRes] = await Promise.all([
        getStudentProfile(id),
        getTodayAttendance(id),
        getMonthlyAttendance(id, currentYear, currentMonth)
      ]);

      console.log("Profile Data:", profileRes);
      console.log("Today Data:", todayRes);

      setProfile(profileRes);
      setTodayData(todayRes);
      setMonthData(monthRes);

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  // Safe checks for data rendering
  const studentName = profile?.student_name || "Student";
  const deptName = profile?.department ? `${profile.department} • Sem ${profile.semester}` : "Department Info";

  const presentCount = monthData?.present !== undefined ? monthData.present : 0;
  const totalCount = monthData?.total !== undefined ? monthData.total : 0;
  const monthPercentage = monthData?.percentage !== undefined ? monthData.percentage : 0;

  const todayTotal = todayData?.total !== undefined ? todayData.total : 0;
  const todayPresent = todayData?.present !== undefined ? todayData.present : 0;
  const todayAbsent = todayData?.absent !== undefined ? todayData.absent : 0;

  // Redesigned Dashboard
  // Removed full Subjects list (handled in new Tab)
  // Enhanced Stat Cards and Today's View

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.gradientFill}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.nameText} numberOfLines={1}>{studentName}</Text>
            <View style={styles.deptBadge}>
              <Text style={styles.deptText}>{deptName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut color="white" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
          }
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Overview Stats */}
            <View style={styles.statsGrid}>

              {/* Attendance Card */}
              <View style={[styles.statCard, styles.shadow]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statTitle}>Attendance Health</Text>
                  <Activity size={18} color={colors.primary} />
                </View>
                <View style={styles.statContent}>
                  <AttendanceProgress percentage={monthPercentage} radius={36} />
                  <View style={styles.statDetails}>
                    <Text style={styles.bigStat}>{monthPercentage}%</Text>
                    <Text style={styles.statLabel}>Overall</Text>
                  </View>
                </View>
                <View style={styles.statFooter}>
                  <Text style={styles.footerText}>{presentCount} Present / {totalCount} Total</Text>
                </View>
              </View>

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
                    <Text style={styles.todayLbl}>Attended</Text>
                  </View>
                  <View style={styles.todayRow}>
                    <Text style={[styles.todayVal, { color: colors.error }]}>{todayAbsent}</Text>
                    <Text style={styles.todayLbl}>Missed</Text>
                  </View>
                </View>
              </View>
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

            <View style={{ height: 80 }} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textSecondary },

  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  gradientFill: { flex: 1, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },

  headerContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: '#E0E7FF', fontSize: 14, fontWeight: '600' },
  nameText: { color: 'white', fontSize: 24, fontWeight: '700', marginTop: 4 },
  deptBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
  deptText: { color: 'white', fontSize: 13, fontWeight: '600' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },

  scrollContent: { paddingHorizontal: 20 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -40, marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: 'white', borderRadius: 24, padding: 16, minHeight: 160, justifyContent: 'space-between' },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },

  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },

  statContent: { alignItems: 'center', marginVertical: 8 },
  statDetails: { alignItems: 'center', marginTop: 8 },
  bigStat: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textSecondary },

  statFooter: { alignItems: 'center', marginTop: 4 },
  footerText: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },

  todayStats: { gap: 12 },
  todayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayVal: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  todayLbl: { fontSize: 12, color: colors.textSecondary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  dateText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  timelineContainer: { marginTop: 4 },
  timelineItem: { flexDirection: 'row', minHeight: 80 },

  timelineTimeCol: { width: 60, alignItems: 'flex-end', marginRight: 12, paddingTop: 18 },
  periodLabel: { fontSize: 10, color: colors.textLight, fontWeight: '700' },
  periodNumber: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },

  timelineIndicatorCol: { alignItems: 'center', width: 24, marginRight: 12 },
  timelineDot: { width: 16, height: 16, borderRadius: 8, marginTop: 22, borderWidth: 3, borderColor: '#F1F5F9', zIndex: 2 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: -4 },

  timelineCard: { flex: 1, backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineContent: { flex: 1 },
  subjectName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  teacherName: { fontSize: 13, color: colors.textSecondary, marginLeft: 4 },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '700' },

  emptyState: { padding: 40, alignItems: 'center', backgroundColor: 'white', borderRadius: 20 },
  emptyText: { color: colors.textSecondary, marginTop: 12, fontSize: 15, fontWeight: '500' }
});

export default StudentDashboardScreen;