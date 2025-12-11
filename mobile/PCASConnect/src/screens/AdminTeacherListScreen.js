import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getTeacherList } from '../services/adminApi';
import { colors } from '../constants/colors';
import { User, ChevronRight, Mail } from 'lucide-react-native';

const AdminTeacherListScreen = ({ route, navigation }) => {
    const { departmentId, search } = route.params;
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const data = await getTeacherList(departmentId, search);
            setTeachers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AdminTeacherView', { teacherId: item.id })}
        >
            <View style={styles.iconBg}>
                <User size={24} color={colors.primary} />
            </View>
            <View style={styles.info}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.is_hod && (
                        <View style={styles.hodBadge}>
                            <Text style={styles.hodText}>HOD</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.subtext}>{item.department_name}</Text>

                {item.email && (
                    <View style={styles.row}>
                        <Mail size={12} color="#666" />
                        <Text style={styles.emailText}>{item.email}</Text>
                    </View>
                )}
            </View>
            <ChevronRight size={24} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Teachers</Text>
                <Text style={styles.headerSubtitle}>
                    {teachers.length} found
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={teachers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No teachers found.</Text>
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
    subtext: { fontSize: 13, color: '#666', marginTop: 2, fontWeight: '500' },

    row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    emailText: { fontSize: 12, color: '#666', marginLeft: 4 },

    hodBadge: {
        backgroundColor: colors.accent || '#FFD700', paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 4, marginLeft: 8
    },
    hodText: { fontSize: 10, fontWeight: 'bold', color: 'black' },

    empty: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#888' }
});

export default AdminTeacherListScreen;
