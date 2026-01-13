import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import DashboardLayout from '../components/DashboardLayout';
import { Picker } from '@react-native-picker/picker';

const HODStudentListScreen = ({ navigation }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('ALL');
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchStudents();
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const teacherData = await AsyncStorage.getItem('teacher');
            if (teacherData) {
                const p = JSON.parse(teacherData);
                setUser({
                    name: p.name,
                    role: "HOD",
                    department: p.department,
                    email: p.email,
                });
            }
        } catch (e) {
            console.log("Error loading profile", e);
        }
    };

    const fetchStudents = async () => {
        try {
            const deptId = await AsyncStorage.getItem('department_id');
            const response = await axios.get(`${BASE_URL}/api/teacher/hod/students/${deptId}/`);
            setStudents(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = (studentId, studentName) => {
        Alert.alert(
            "Reset Password",
            `Are you sure you want to reset password for ${studentName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    onPress: async () => {
                        Alert.alert("Info", "Password reset to default (Name+Year)");
                    }
                }
            ]
        );
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchText.toLowerCase()) || s.reg_no.includes(searchText);
        const matchesSemester = selectedSemester === 'ALL' || s.semester.toString() === selectedSemester;
        return matchesSearch && matchesSemester;
    });

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>{item.reg_no} • Sem {item.semester}</Text>
            </View>
            <TouchableOpacity onPress={() => handleResetPassword(item.id, item.name)} style={styles.actionBtn}>
                <Ionicons name="key-outline" size={20} color="#d32f2f" />
            </TouchableOpacity>
        </View>
    );

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <DashboardLayout
            user={user}
            onNavigate={(screen) => navigation.navigate(screen)}
            onLogout={handleLogout}
            disableScroll={true} // Disable parent scroll for FlatList
        >
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Students List</Text>

                {/* Filters */}
                <View style={styles.filterRow}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={styles.input}
                            placeholder="Search..."
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedSemester}
                            onValueChange={(itemValue) => setSelectedSemester(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Semesters" value="ALL" />
                            <Picker.Item label="Sem 1" value="1" />
                            <Picker.Item label="Sem 2" value="2" />
                            <Picker.Item label="Sem 3" value="3" />
                            <Picker.Item label="Sem 4" value="4" />
                            <Picker.Item label="Sem 5" value="5" />
                            <Picker.Item label="Sem 6" value="6" />
                        </Picker>
                    </View>
                </View>

                {loading ? <ActivityIndicator size="large" color="#6200ea" style={{ marginTop: 20 }} /> : (
                    <FlatList
                        data={filteredStudents}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No students found.</Text>}
                    />
                )}
            </View>
        </DashboardLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    searchContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 10, alignItems: 'center', elevation: 1, flex: 1, marginRight: 10 },
    input: { marginLeft: 10, flex: 1 },
    pickerContainer: { backgroundColor: '#fff', borderRadius: 10, elevation: 1, justifyContent: 'center', width: 140 },
    picker: { height: 50, width: 140 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold' },
    details: { color: '#666', fontSize: 13, marginTop: 2 },
    actionBtn: { padding: 5 }
});

export default HODStudentListScreen;
