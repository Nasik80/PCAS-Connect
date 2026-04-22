import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Award, ArrowLeft, BookOpen } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStudentInternalMarks } from '../api/studentApi';

const StudentInternalMarksScreen = ({ navigation }) => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMarks = async () => {
        try {
            const storedStudent = await AsyncStorage.getItem("student");
            if (!storedStudent) return;
            const parsed = JSON.parse(storedStudent);
            const studentId = parsed.student_id;

            const data = await getStudentInternalMarks(studentId);
            // Only show approved marks maybe? The requirement didn't specify. 
            // In a real system, you'd only show is_approved. Let's show all for debugging but indicate if it is draft.
            setMarks(data);
        } catch (error) {
            console.error('Error fetching internal marks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMarks();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMarks();
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <BookOpen size={20} color={colors.primary} />
                    <Text style={styles.subjectName}>{item.subject_name}</Text>
                </View>
                {!item.is_approved && (
                    <View style={styles.draftBadge}>
                        <Text style={styles.draftText}>Pending Approval</Text>
                    </View>
                )}
            </View>

            <View style={styles.marksContainer}>
                <View style={styles.markRow}>
                    <Text style={styles.markLabel}>Test 1:</Text>
                    <Text style={styles.markValue}>{item.test_1_scored} / {item.test_1_total}</Text>
                </View>
                <View style={styles.markRow}>
                    <Text style={styles.markLabel}>Test 2:</Text>
                    <Text style={styles.markValue}>{item.test_2_scored} / {item.test_2_total}</Text>
                </View>
                <View style={[styles.markRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>{item.total} / {parseFloat(item.test_1_total) + parseFloat(item.test_2_total)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Internal Marks</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={marks}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Award size={50} color="#ccc" />
                            <Text style={styles.emptyText}>No internal marks uploaded yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background || '#f4f4f5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 15, backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
    titleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    subjectName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8, flex: 1 },
    draftBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    draftText: { fontSize: 10, fontWeight: 'bold', color: '#D97706' },
    marksContainer: { marginTop: 4 },
    markRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    markLabel: { fontSize: 14, color: '#555', fontWeight: '500' },
    markValue: { fontSize: 14, color: '#333', fontWeight: '600' },
    totalRow: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
    totalLabel: { fontSize: 15, color: colors.primary, fontWeight: 'bold' },
    totalValue: { fontSize: 15, color: colors.primary, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#888' }
});

export default StudentInternalMarksScreen;
