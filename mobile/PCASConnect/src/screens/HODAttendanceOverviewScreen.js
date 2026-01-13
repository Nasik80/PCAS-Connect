import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/api';
import { colors } from '../constants/colors';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const HODAttendanceOverviewScreen = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const deptId = await AsyncStorage.getItem('department_id');
            const response = await axios.get(`${BASE_URL}/api/teacher/hod/attendance/stats/${deptId}/`);
            setStats(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load attendance stats");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6200ea" />
            </View>
        );
    }

    if (!stats) return null;

    // Chart Data
    const overall = stats.overall_percentage;
    const chartData = [
        {
            name: "Present",
            population: overall,
            color: "#10B981",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        },
        {
            name: "Absent",
            population: 100 - overall,
            color: "#EF4444",
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
        }
    ];

    const screenWidth = Dimensions.get("window").width;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Department Attendance</Text>

            {/* Overall Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Overall Attendance (30 Days)</Text>
                <PieChart
                    data={chartData}
                    width={screenWidth - 60}
                    height={200}
                    chartConfig={{
                        backgroundColor: "#1cc910",
                        backgroundGradientFrom: "#eff3ff",
                        backgroundGradientTo: "#efefef",
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 0]}
                    absolute
                />
                <Text style={styles.bigStat}>{overall}%</Text>
            </View>

            {/* Subject Breakdown */}
            <Text style={styles.sectionTitle}>Subject Wise Breakdown</Text>
            {stats.subject_breakdown.map((s, idx) => (
                <View key={idx} style={styles.rowItem}>
                    <Text style={styles.subName}>{s.subject}</Text>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${s.percentage}%`, backgroundColor: s.percentage < 75 ? '#EF4444' : '#10B981' }]} />
                    </View>
                    <Text style={styles.subPct}>{s.percentage}%</Text>
                </View>
            ))}

            {/* Low Attendance Alert */}
            <Text style={[styles.sectionTitle, { color: '#B91C1C', marginTop: 25 }]}>
                ⚠️ Low Attendance Students (&lt; 75%)
            </Text>
            {stats.low_attendance_students.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#666', marginTop: 10 }}>All students have good attendance!</Text>
            ) : (
                stats.low_attendance_students.map((stud) => (
                    <View key={stud.id} style={styles.dangerCard}>
                        <View>
                            <Text style={styles.dangerName}>{stud.name}</Text>
                            <Text style={styles.dangerDetail}>{stud.reg_no} • Sem {stud.semester}</Text>
                        </View>
                        <Text style={styles.dangerPct}>{stud.percentage}%</Text>
                    </View>
                ))
            )}

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8faFc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 20, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 10 },
    bigStat: { fontSize: 32, fontWeight: 'bold', color: '#333', marginTop: 10 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 15, color: '#333' },

    rowItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    subName: { flex: 1, fontSize: 14, color: '#444' },
    progressContainer: { width: 100, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginHorizontal: 10 },
    progressBar: { height: '100%', borderRadius: 4 },
    subPct: { width: 40, textAlign: 'right', fontWeight: 'bold', fontSize: 12 },

    dangerCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FEF2F2', padding: 15, borderRadius: 12, marginBottom: 10,
        borderLeftWidth: 4, borderLeftColor: '#EF4444'
    },
    dangerName: { fontSize: 16, fontWeight: '600', color: '#B91C1C' },
    dangerDetail: { fontSize: 12, color: '#7F1D1D' },
    dangerPct: { fontSize: 18, fontWeight: 'bold', color: '#B91C1C' }
});

export default HODAttendanceOverviewScreen;
