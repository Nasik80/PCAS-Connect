import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getStudentDetails, updateStudent, getDepartments } from '../services/adminApi';
import { colors } from '../constants/colors';
import { Picker } from '@react-native-picker/picker'; // Using installed package

const AdminStudentEditScreen = ({ route, navigation }) => {
    const { studentId } = route.params;
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        register_number: '',
        phone_number: '',
        address: '',
        semester: '1',
        department: ''
    });

    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [student, depts] = await Promise.all([
                getStudentDetails(studentId),
                getDepartments()
            ]);

            setFormData({
                name: student.name,
                email: student.email,
                register_number: student.register_number,
                phone_number: student.phone_number,
                address: student.address,
                semester: student.semester.toString(),
                department: student.department
            });
            setDepartments(depts);
        } catch (e) {
            Alert.alert("Error", "Failed to load data");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setSubmitting(true);
        try {
            await updateStudent(studentId, formData);
            Alert.alert("Success", "Student updated successfully");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", "Failed to update");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} />

            <Text style={styles.label}>Register Number</Text>
            <TextInput style={styles.input} value={formData.register_number} onChangeText={t => setFormData({ ...formData, register_number: t })} />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} keyboardType="email-address" />

            <Text style={styles.label}>Contact Number</Text>
            <TextInput style={styles.input} value={formData.phone_number} onChangeText={t => setFormData({ ...formData, phone_number: t })} keyboardType="phone-pad" />

            <Text style={styles.label}>Department</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.department}
                    onValueChange={(itemValue) => setFormData({ ...formData, department: itemValue })}
                >
                    {departments.map(d => <Picker.Item key={d.id} label={d.name} value={d.id} />)}
                </Picker>
            </View>

            <Text style={styles.label}>Semester (Auto-updates Subjects!)</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.semester}
                    onValueChange={(itemValue) => setFormData({ ...formData, semester: itemValue })}
                >
                    {[1, 2, 3, 4, 5, 6].map(s => <Picker.Item key={s} label={`Semester ${s}`} value={s.toString()} />)}
                </Picker>
            </View>

            <Text style={styles.label}>Address</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={formData.address} onChangeText={t => setFormData({ ...formData, address: t })} />

            <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={submitting}>
                {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Save Changes</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 15, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
    pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9' },
    btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 30 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});

export default AdminStudentEditScreen;
