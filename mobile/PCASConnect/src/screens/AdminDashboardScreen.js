import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, StatusBar, Dimensions, Animated
} from 'react-native';
import { colors } from '../constants/colors';
import { getAdminStats } from '../services/adminApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, BookOpen, Layers, GraduationCap, LogOut, ArrowRight, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getAdminStats();
    setStats(data);
    setRefreshing(false);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 7, useNativeDriver: true })
    ]).start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
  };

  const StatCard = ({ title, count, icon, color, delay }) => {
    // Local animation for staggered effect if needed, but managing globally is simpler for now.
    return (
      <TouchableOpacity activeOpacity={0.9} style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          {React.cloneElement(icon, { color: color, size: 24 })}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardCount}>{count !== null ? count : '-'}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ActionCard = ({ title, subtitle, icon, color }) => (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        {React.cloneElement(icon, { color: color, size: 20 })}
      </View>
      <View style={styles.actionInfo}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <ArrowRight color={colors.textLight} size={20} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerSubtitle}>Administrator</Text>
              <Text style={styles.headerTitle}>Dashboard</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut color="white" size={20} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.headerCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={styles.sectionHeader}>Overview</Text>
          <View style={styles.grid}>
            <StatCard
              title="Students"
              count={stats?.students}
              icon={<Users />}
              color={colors.primary}
            />
            <StatCard
              title="Teachers"
              count={stats?.teachers}
              icon={<GraduationCap />}
              color={colors.success}
            />
            <StatCard
              title="Departments"
              count={stats?.departments}
              icon={<Layers />}
              color={colors.warning}
            />
            <StatCard
              title="Subjects"
              count={stats?.subjects}
              icon={<BookOpen />}
              color={colors.secondary}
            />
          </View>

          <Text style={styles.sectionHeader}>Quick Actions</Text>
          <View style={styles.actionsList}>
            <ActionCard
              title="Class Monitor"
              subtitle="View attendance reports"
              icon={<Activity />}
              color={colors.primary}
            />
            <ActionCard
              title="Reports Export"
              subtitle="Download Excel sheets"
              icon={<BookOpen />}
              color={colors.success}
            />
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AdminPromotion')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.warning}15` }]}>
                <GraduationCap color={colors.warning} size={20} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Promote Students</Text>
                <Text style={styles.actionSubtitle}>Move batch to next semester</Text>
              </View>
              <ArrowRight color={colors.textLight} size={20} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionHeader}>Management</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddStudent')}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                <Users color={colors.primary} size={24} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Add Student</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddTeacher')}>
              <View style={[styles.iconBox, { backgroundColor: colors.success + '15' }]}>
                <GraduationCap color={colors.success} size={24} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Add Teacher</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddDepartment')}>
              <View style={[styles.iconBox, { backgroundColor: colors.warning + '15' }]}>
                <Layers color={colors.warning} size={24} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Add Dept</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddSubject')}>
              <View style={[styles.iconBox, { backgroundColor: colors.secondary + '15' }]}>
                <BookOpen color={colors.secondary} size={24} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Add Subject</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  headerContainer: { height: 160, backgroundColor: colors.background },
  headerGradient: { height: '100%', padding: 24, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: 'white' },
  headerSubtitle: { fontSize: 14, color: '#E0E7FF', fontWeight: '600', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },

  content: { padding: 24, paddingTop: 10 },

  sectionHeader: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16, marginTop: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  card: {
    width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 16,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: colors.surfaceHighlight, alignItems: 'flex-start'
  },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardContent: { width: '100%' },
  cardCount: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  cardTitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  actionsList: { gap: 12 },
  actionCard: {
    backgroundColor: 'white', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: colors.surfaceHighlight
  },
  actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  actionSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

export default AdminDashboardScreen;
