import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getTeacherDetails, deleteTeacher, resetTeacherPassword } from '../services/adminApi';
import { colors } from '../constants/colors';
import { User, Mail, Phone, Calendar, BookOpen, Edit2, Trash, Key, GraduationCap } from 'lucide-react-native';

const AdminTeacherViewScreen = ({ route, navigation }) => {
    const { teacherId } = route.params;
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();

        // Refresh when coming back from Edit
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDetails();
        });
        return unsubscribe;
    }, [navigation, teacherId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await getTeacherDetails(teacherId);
            setTeacher(data);
        } catch (error) {
            Alert.alert("Error", "Failed to load teacher details");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Teacher",
            `Are you sure you want to delete ${teacher.name}? This will remove their user account and unassign all subjects.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTeacher(teacher.id);
                            Alert.alert("Success", "Teacher deleted successfully");
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert("Error", typeof error === 'string' ? error : "Failed to delete");
                        }
                    }
                }
            ]
        );
    };

    const handleResetPassword = () => {
        Alert.alert(
            "Reset Password",
            "Generate a new password based on name and DOB?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    onPress: async () => {
                        try {
                            const res = await resetTeacherPassword(teacher.id);
                            Alert.alert("Success", `New Password: ${res.new_password}`);
                        } catch (error) {
                            Alert.alert("Error", typeof error === 'string' ? error : "Failed to reset");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!teacher) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>

            {/* Header Profile */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                    <User size={40} color="white" />
                </View>
                <Text style={styles.name}>{teacher.name}</Text>
                <Text style={styles.dept}>{teacher.department_name}</Text>
                {teacher.is_hod && <Text style={styles.hodTag}>HOD</Text>}
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AdminTeacherEdit', { teacherId: teacher.id })}>
                    <Edit2 size={20} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleResetPassword}>
                    <Key size={20} color="#f59e0b" />
                    <Text style={[styles.actionText, { color: '#f59e0b' }]}>Reset Pass</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
                    <Trash size={20} color="#ef4444" />
                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                </TouchableOpacity>
            </View>

            {/* Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact & Info</Text>

                <View style={styles.row}>
                    <Mail size={18} color="#666" />
                    <Text style={styles.infoText}>{teacher.email}</Text>
                </View>

                {teacher.phone && (
                    <View style={styles.row}>
                        <Phone size={18} color="#666" />
                        <Text style={styles.infoText}>{teacher.phone}</Text>
                    </View>
                )}

                {teacher.dob && (
                    <View style={styles.row}>
                        <Calendar size={18} color="#666" />
                        <Text style={styles.infoText}>DOB: {teacher.dob}</Text>
                    </View>
                )}

                {teacher.qualification && (
                    <View style={styles.row}>
                        <GraduationCap size={18} color="#666" />
                        <Text style={styles.infoText}>{teacher.qualification}</Text>
                    </View>
                )}
            </View>

            {/* Subjects */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Assigned Subjects ({teacher.subjects.length})</Text>

                {teacher.subjects.length === 0 ? (
                    <Text style={styles.emptyText}>No subjects assigned.</Text>
                ) : (
                    teacher.subjects.map((sub) => (
                        <View key={sub.id} style={styles.subjectCard}>
                            <BookOpen size={20} color={colors.primary} />
                            <View style={{ marginLeft: 15 }}>
                                <Text style={styles.subName}>{sub.name}</Text>
                                <Text style={styles.subCode}>{sub.code} • Sem {sub.semester}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: colors.background || '#f8f9fa', paddingBottom: 30 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    profileHeader: {
        alignItems: 'center', padding: 30, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        elevation: 4
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center', marginBottom: 15
    },
    name: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    dept: { fontSize: 16, color: '#666', marginTop: 5 },
    hodTag: {
        marginTop: 5, backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 2,
        borderRadius: 10, fontSize: 12, fontWeight: 'bold'
    },

    actionRow: {
        flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20, paddingHorizontal: 20
    },
    actionBtn: { alignItems: 'center' },
    actionText: { marginTop: 5, fontSize: 12, fontWeight: '600' },

    section: {
        backgroundColor: 'white', marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 15, elevation: 2
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },

    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    infoText: { marginLeft: 15, fontSize: 16, color: '#444' },

    subjectCard: {
        flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#f9f9f9',
        marginBottom: 10, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: colors.primary
    },
    subName: { fontSize: 16, fontWeight: '600', color: '#333' },
    subCode: { fontSize: 12, color: '#666', marginTop: 2 },

    emptyText: { fontStyle: 'italic', color: '#888' }
});

export default AdminTeacherViewScreen;
