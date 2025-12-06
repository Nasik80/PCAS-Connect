import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { colors } from '../constants/colors';
import { getStudentProfile } from '../api/studentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StudentSubjectsScreen = ({ navigation }) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const storedStudent = await AsyncStorage.getItem("student");
            if (storedStudent) {
                const parsed = JSON.parse(storedStudent);
                const data = await getStudentProfile(parsed.student_id);
                setSubjects(data.subjects || []);
            }
        } catch (err) {
            setError("Failed to load subjects");
            console.log(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSubjects();
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, styles.shadow]}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <BookOpen color={colors.primary} size={24} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.subjectName}>{item.subject_name}</Text>
                    <Text style={styles.subjectCode}>{item.code}</Text>
                </View>
                <View style={styles.creditContainer}>
                    <Text style={styles.creditText}>{item.credit} Credits</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Attendance</Text>
                    <Text style={[styles.statValue, { color: item.attendance_percentage >= 75 ? colors.success : colors.error }]}>
                        {item.attendance_percentage}%
                    </Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Subjects</Text>
                <Text style={styles.headerSubtitle}>Enrolled Courses & Status</Text>
            </View>

            {error ? (
                <View style={styles.center}>
                    <AlertCircle color={colors.error} size={40} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={subjects}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.subject_id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No subjects enrolled.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceHighlight
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
    headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

    listContent: { padding: 20 },

    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight
    },
    shadow: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4
    },

    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16
    },
    headerText: { flex: 1 },
    subjectName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
    subjectCode: { fontSize: 13, color: colors.textLight, fontWeight: '600' },

    creditContainer: {
        backgroundColor: colors.background,
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 8
    },
    creditText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

    divider: { height: 1, backgroundColor: colors.surfaceHighlight, marginVertical: 16 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statLabel: { fontSize: 14, color: colors.textSecondary },
    statValue: { fontSize: 16, fontWeight: '800' },

    errorText: { marginTop: 12, color: colors.textSecondary, fontSize: 16 },
    emptyText: { color: colors.textSecondary, fontSize: 16 }
});

export default StudentSubjectsScreen;
