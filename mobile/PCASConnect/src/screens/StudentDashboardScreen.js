import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, ActivityIndicator, Animated, RefreshControl, StatusBar 
} from 'react-native';
import { colors } from '../constants/colors';
import { 
  LogOut, Calendar, CheckCircle, XCircle, BookOpen 
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Card from '../components/Card';
import AttendanceProgress from '../components/AttendanceProgress';
import { 
  getStudentProfile, 
  getTodayAttendance, 
  getMonthlyAttendance, 
  getSemesterSubjects 
} from '../services/api';

const StudentDashboardScreen = ({ route, navigation }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentId, setStudentId] = useState(null);
  
  // Data State
  const [profile, setProfile] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [subjects, setSubjects] = useState([]);

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
        alert("Session Error: Please login again.");
        navigation.replace("StudentLogin");
      }
    } catch (e) {
      console.error("Storage Error", e);
    }
  };

  const fetchAllData = async (id) => {
    if (!refreshing) setLoading(true);
    
    try {
      // 1. Fetch Profile
      const profileRes = await getStudentProfile(id);
      setProfile(profileRes);

      // 2. Fetch Attendance Data
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Run independent fetches in parallel
      const [todayRes, monthRes] = await Promise.all([
        getTodayAttendance(id),
        getMonthlyAttendance(id, currentYear, currentMonth),
      ]);

      setTodayData(todayRes);
      setMonthData(monthRes);

      // 3. Fetch Subjects (Handled separately to prevent crash on ID mismatch)
      try {
        // NOTE: If profileRes.department is a string (e.g., "BCA"), 
        // this might fail if backend expects an ID.
        // You might need to map "BCA" -> 1 manually or update backend.
        const deptId = profileRes.department_id || 1; // Fallback to 1 for testing
        const subRes = await getSemesterSubjects(deptId, profileRes.semester);
        setSubjects(subRes);
      } catch (subError) {
        console.log("Subjects Fetch Error (Likely Dept ID mismatch):", subError);
        setSubjects([]);
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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
    if(studentId) fetchAllData(studentId);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>Welcome back,</Text>
          <Text style={styles.studentName}>{profile?.name || "Student"}</Text>
          <Text style={styles.deptInfo}>
             {profile?.register_number} | {profile?.department} - Sem {profile?.semester}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut color="white" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary}/>
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Monthly Attendance */}
          <Card title="Monthly Attendance" icon={<Calendar color={colors.primary} size={20}/>}>
             <View style={styles.rowBetween}>
               <View>
                 <Text style={styles.statLabel}>Month: <Text style={styles.bold}>{monthData?.month || "Current"}</Text></Text>
                 <View style={{ marginTop: 10 }}>
                    <Text style={styles.statLabel}>Total Classes: <Text style={styles.bold}>{monthData?.total_classes || 0}</Text></Text>
                    <Text style={styles.statLabel}>Attended: <Text style={styles.bold}>{monthData?.present || 0}</Text></Text>
                 </View>
               </View>
               <AttendanceProgress percentage={monthData?.percentage || 0} />
             </View>
          </Card>

          {/* Today's Status */}
          <Card title="Today's Status" icon={<CheckCircle color={colors.primary} size={20}/>}>
            <View style={styles.statsRow}>
               <View style={styles.statBox}>
                 <Text style={styles.statNumber}>{todayData?.total_periods || 0}</Text>
                 <Text style={styles.statLabel}>Total</Text>
               </View>
               <View style={styles.statBox}>
                 <Text style={[styles.statNumber, {color: colors.success}]}>{todayData?.present || 0}</Text>
                 <Text style={styles.statLabel}>Present</Text>
               </View>
               <View style={styles.statBox}>
                 <Text style={[styles.statNumber, {color: colors.error}]}>{todayData?.absent || 0}</Text>
                 <Text style={styles.statLabel}>Absent</Text>
               </View>
            </View>

            <View style={styles.periodList}>
              {todayData?.details?.map((item, index) => (
                <View key={index} style={styles.periodItem}>
                  <View style={styles.periodLeft}>
                    <View style={styles.periodBadge}>
                      <Text style={styles.periodText}>{item.period}</Text>
                    </View>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                  </View>
                  {item.status === 'P' ? (
                    <CheckCircle size={20} color={colors.success} />
                  ) : (
                    <XCircle size={20} color={colors.error} />
                  )}
                </View>
              ))}
              {(!todayData?.details || todayData?.details.length === 0) && (
                <Text style={styles.emptyText}>No classes recorded today.</Text>
              )}
            </View>
          </Card>

          {/* Semester Subjects */}
          <Card title="Semester Subjects" icon={<BookOpen color={colors.primary} size={20}/>}>
            {subjects.length > 0 ? subjects.map((sub, index) => (
              <View key={index} style={styles.subjectRow}>
                 <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{sub.name}</Text>
                    <Text style={styles.subjectCode}>{sub.code}</Text>
                 </View>
                 <View style={styles.creditBadge}>
                    <Text style={styles.creditText}>{sub.credit} Cr</Text>
                 </View>
              </View>
            )) : (
              <Text style={styles.emptyText}>Subjects could not be loaded.</Text>
            )}
          </Card>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 10, color: colors.textSecondary },
  header: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  welcomeLabel: { color: '#BFDBFE', fontSize: 14, fontWeight: '600' },
  studentName: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  deptInfo: { color: '#E0F2FE', fontSize: 14, opacity: 0.9 },
  logoutButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  scrollContent: { padding: 20, paddingTop: 25 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { color: colors.textSecondary, fontSize: 14, marginBottom: 2 },
  bold: { fontWeight: 'bold', color: colors.textPrimary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
  periodList: { gap: 10 },
  periodItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, backgroundColor: '#F8FAFC', paddingHorizontal: 12, borderRadius: 8 },
  periodLeft: { flexDirection: 'row', alignItems: 'center' },
  periodBadge: { backgroundColor: '#E0E7FF', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  periodText: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
  subjectText: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: colors.textSecondary, fontStyle: 'italic', marginTop: 10 },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  subjectCode: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  creditBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  creditText: { color: colors.primary, fontSize: 12, fontWeight: 'bold' }
});

export default StudentDashboardScreen;