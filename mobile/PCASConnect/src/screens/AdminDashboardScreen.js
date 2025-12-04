import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl 
} from 'react-native';
import { colors } from '../constants/colors';
import { getAdminStats } from '../services/adminApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, BookOpen, Layers, GraduationCap, LogOut } from 'lucide-react-native';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getAdminStats();
    setStats(data);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
  };

  const StatCard = ({ title, count, icon, color }) => (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        {icon}
      </View>
      <View>
        <Text style={styles.cardCount}>{count !== null ? count : '-'}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut color="white" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>Overview</Text>
        
        <View style={styles.grid}>
          <StatCard 
            title="Students" 
            count={stats?.students} 
            icon={<Users color="white" size={24} />} 
            color="#3B82F6" 
          />
          <StatCard 
            title="Teachers" 
            count={stats?.teachers} 
            icon={<GraduationCap color="white" size={24} />} 
            color="#10B981" 
          />
          <StatCard 
            title="Departments" 
            count={stats?.departments} 
            icon={<Layers color="white" size={24} />} 
            color="#F59E0B" 
          />
          <StatCard 
            title="Subjects" 
            count={stats?.subjects} 
            icon={<BookOpen color="white" size={24} />} 
            color="#8B5CF6" 
          />
        </View>

        {/* Placeholder for future admin features */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Quick Actions</Text>
        <View style={styles.actionCard}>
           <Text style={styles.actionText}>Manage Timetables (Coming Soon)</Text>
        </View>
        <View style={styles.actionCard}>
           <Text style={styles.actionText}>Export Reports (Coming Soon)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    backgroundColor: colors.primary, padding: 20, paddingTop: 40, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15,
    flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
  },
  iconBox: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cardCount: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
  cardTitle: { fontSize: 12, color: colors.textSecondary },
  actionCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  actionText: { color: colors.textSecondary, fontWeight: '500' }
});

export default AdminDashboardScreen;
