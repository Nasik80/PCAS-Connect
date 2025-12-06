import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Using installed package
import { getDepartments } from '../services/adminApi';
import { colors } from '../constants/colors';
import { Search, Filter, ArrowRight } from 'lucide-react-native'; // Assuming lucide is available or use Ionicons if not? Previous files used lucide-react-native.

const AdminStudentFilterScreen = ({ navigation }) => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [semester, setSemester] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            Alert.alert("Error", "Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        navigation.navigate('AdminStudentList', {
            departmentId: selectedDept,
            semester: semester,
            search: searchQuery
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Student Management</Text>
                <Text style={styles.subtitle}>Filter & Search Students</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Department</Text>
                <View style={styles.pickerContainer}>
                    {loading ? <ActivityIndicator color={colors.primary} /> : (
                        <Picker
                            selectedValue={selectedDept}
                            onValueChange={(itemValue) => setSelectedDept(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Departments" value="" />
                            {departments.map((dept) => (
                                <Picker.Item key={dept.id} label={`${dept.name} (${dept.code})`} value={dept.id} />
                            ))}
                        </Picker>
                    )}
                </View>

                <Text style={styles.label}>Semester</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={semester}
                        onValueChange={(itemValue) => setSemester(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="All Semesters" value="" />
                        {[1, 2, 3, 4, 5, 6].map((sem) => (
                            <Picker.Item key={sem} label={`Semester ${sem}`} value={sem.toString()} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Search (Name/Roll No)</Text>
                <View style={styles.inputContainer}>
                    <Search size={20} color="#666" style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search by Name, Roll No..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <TouchableOpacity style={styles.btn} onPress={handleSearch}>
                    <Text style={styles.btnText}>View Students</Text>
                    <ArrowRight color="white" size={20} style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background || '#f8f9fa' },
    content: { padding: 20 },
    header: { marginBottom: 30, marginTop: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary || '#333' },
    subtitle: { fontSize: 16, color: colors.textSecondary || '#666', marginTop: 5 },

    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8
    },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 10 },
    pickerContainer: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fdfdfd', marginBottom: 5 },
    picker: { height: 50 }, // Picker style quirk on Android

    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#eee', borderRadius: 12,
        paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fdfdfd',
        marginTop: 5, marginBottom: 20
    },
    input: { flex: 1, fontSize: 16 },

    btn: {
        backgroundColor: colors.primary || '#6200ea',
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 16, borderRadius: 16, marginTop: 20,
        elevation: 4, shadowColor: colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }
    },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default AdminStudentFilterScreen;
