import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getStudentDetails, deleteStudent, resetStudentPassword } from '../services/adminApi';
import { colors } from '../constants/colors';
import { User, Mail, Phone, MapPin, Calendar, Trash2, Key, Edit } from 'lucide-react-native';

const AdminStudentViewScreen = ({ route, navigation }) => {
    const { studentId } = route.params;
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, [studentId]); // Reload if ID changes

    // Re-fetch when returning from Edit screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!loading && student) fetchDetails(); // Refresh
        });
        return unsubscribe;
    }, [navigation, loading, student]);


    const fetchDetails = async () => {
        try {
            const data = await getStudentDetails(studentId);
            setStudent(data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch student details");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Student",
            "Are you sure? This action is irreversible.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteStudent(studentId);
                            Alert.alert("Success", "Student deleted");
                            navigation.pop(2); // Go back to Filter or List
                        } catch (e) {
                            Alert.alert("Error", "Failed to delete");
                        }
                    }
                }
            ]
        );
    };

    const handleResetPassword = () => {
        Alert.alert(
            "Reset Password",
            "Password will be reset to Name(5)+Year. Confirm?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    onPress: async () => {
                        try {
                            const res = await resetStudentPassword(studentId);
                            Alert.alert("Success", `New Password: ${res.new_password}`);
                        } catch (e) {
                            Alert.alert("Error", "Failed to reset password");
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
    if (!student) return null;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{student.name[0]}</Text>
                </View>
                <Text style={styles.name}>{student.name}</Text>
                <Text style={styles.subtitle}>{student.register_number}</Text>
                <Text style={styles.subtitle}>{student.department_name} • Sem {student.semester}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.row}>
                    <Mail size={20} color="#666" />
                    <Text style={styles.rowText}>{student.email}</Text>
                </View>
                {student.phone_number ? (
                    <View style={styles.row}>
                        <Phone size={20} color="#666" />
                        <Text style={styles.rowText}>{student.phone_number}</Text>
                    </View>) : null}
                <View style={styles.row}>
                    <Calendar size={20} color="#666" />
                    <Text style={styles.rowText}>DOB: {student.dob}</Text>
                </View>
                {student.address ? (
                    <View style={styles.row}>
                        <MapPin size={20} color="#666" />
                        <Text style={styles.rowText}>{student.address}</Text>
                    </View>) : null}
            </View>

            <Text style={styles.actionsTitle}>Actions</Text>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('AdminStudentEdit', { studentId: student.id })}
                >
                    <Edit size={20} color="white" />
                    <Text style={styles.btnText}>Edit Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFA000' }]}
                    onPress={handleResetPassword}
                >
                    <Key size={20} color="white" />
                    <Text style={styles.btnText}>Reset Password</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#D32F2F' }]}
                    onPress={handleDelete}
                >
                    <Trash2 size={20} color="white" />
                    <Text style={styles.btnText}>Delete Student</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background || '#f8f9fa' },
    header: { alignItems: 'center', padding: 30, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 5 },

    section: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 15, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    rowText: { marginLeft: 15, fontSize: 16, color: '#444' },

    actionsTitle: { marginLeft: 20, fontSize: 18, fontWeight: 'bold', color: '#333' },
    actions: { padding: 20, gap: 15 },
    actionBtn: { flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});

export default AdminStudentViewScreen;
