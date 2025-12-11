import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getTeacherDetails, updateTeacher, getDepartments } from '../services/adminApi';
import { colors } from '../constants/colors';

const AdminTeacherEditScreen = ({ route, navigation }) => {
    const { teacherId } = route.params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        originalDepartment: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [teacher, depts] = await Promise.all([
                getTeacherDetails(teacherId),
                getDepartments()
            ]);

            setDepartments(depts);
            setFormData({
                name: teacher.name,
                email: teacher.email,
                phone: teacher.phone || '', // Handle null
                department: teacher.department,
                originalDepartment: teacher.department
            });
        } catch (error) {
            Alert.alert("Error", "Failed to load data");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email || !formData.department) {
            Alert.alert("Validation", "Name, Email, and Department are required");
            return;
        }

        // Warning if Department Changed
        if (formData.department !== formData.originalDepartment) {
            Alert.alert(
                "Change Department?",
                "Changing the department will UNASSIGN all current subjects from this teacher. Proceed?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Confirm", onPress: submitUpdate }
                ]
            );
        } else {
            submitUpdate();
        }
    };

    const submitUpdate = async () => {
        setSaving(true);
        try {
            await updateTeacher(teacherId, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                department: formData.department
            });
            Alert.alert("Success", "Teacher updated successfully");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", typeof error === 'string' ? error : "Failed to update");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Edit Teacher</Text>

            <View style={styles.form}>

                {/* Name */}
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                />

                {/* Email */}
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(t) => setFormData({ ...formData, email: t })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Phone */}
                <Text style={styles.label}>Phone (Optional)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(t) => setFormData({ ...formData, phone: t })}
                    keyboardType="phone-pad"
                />

                {/* Department */}
                <Text style={styles.label}>Department</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.department}
                        onValueChange={(itemValue) => setFormData({ ...formData, department: itemValue })}
                    >
                        {departments.map((dept) => (
                            <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                        ))}
                    </Picker>
                </View>
                <Text style={styles.hint}>
                    Changing department will remove subject assignments.
                </Text>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.button, saving && styles.disabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: 'white', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 20 },

    form: { gap: 15 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginTop: 5 },
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9'
    },

    pickerContainer: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden', backgroundColor: '#f9f9f9'
    },

    button: {
        backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20
    },
    disabled: { backgroundColor: '#a0aec0' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    hint: { fontSize: 12, color: '#eab308', fontStyle: 'italic' }
});

export default AdminTeacherEditScreen;
