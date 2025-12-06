import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { getStudentList } from '../services/adminApi';
import { colors } from '../constants/colors';
import { User, ChevronRight, GraduationCap } from 'lucide-react-native';

const AdminStudentListScreen = ({ route, navigation }) => {
    const { departmentId, semester, search } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await getStudentList(departmentId, semester, search);
            setStudents(data);
        } catch (error) {
            console.error(error); // Silent fail or toast
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AdminStudentView', { studentId: item.id })}
        >
            <View style={styles.iconBg}>
                <User size={24} color={colors.primary} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subtext}>{item.register_number} • {item.department_name}</Text>
                <View style={styles.semBadge}>
                    <GraduationCap size={12} color="#666" />
                    <Text style={styles.semText}>Sem {item.semester}</Text>
                </View>
            </View>
            <ChevronRight size={24} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Students</Text>
                <Text style={styles.headerSubtitle}>
                    {students.length} found • {semester ? `Sem ${semester}` : 'All Sems'}
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={students}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No students found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background || '#f8f9fa' },
    header: { padding: 20, paddingBottom: 10, backgroundColor: 'white', elevation: 2 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    headerSubtitle: { color: '#666', marginTop: 5 },

    listContent: { padding: 15 },
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1
    },
    iconBg: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0',
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    subtext: { fontSize: 12, color: '#666', marginTop: 2 },
    semBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    semText: { fontSize: 12, color: '#666', marginLeft: 4 },

    empty: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#888' }
});

export default AdminStudentListScreen;
