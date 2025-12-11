import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDepartments, createTeacher } from '../services/adminApi';
import { colors } from '../constants/colors';
import { Calendar, UserPlus } from 'lucide-react-native';

const AdminTeacherAddScreen = ({ navigation }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('Male');
    const [departmentId, setDepartmentId] = useState('');
    const [role, setRole] = useState('TEACHER');
    const [qualification, setQualification] = useState('');

    // Date States
    const [dob, setDob] = useState(new Date(1990, 0, 1));
    const [showDobPicker, setShowDobPicker] = useState(false);

    const [doj, setDoj] = useState(new Date());
    const [showDojPicker, setShowDojPicker] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
            if (data.length > 0) setDepartmentId(data[0].id);
        } catch (e) {
            Alert.alert("Error", "Failed to load departments");
        }
    };

    const handleDateChange = (event, selectedDate, type) => {
        if (type === 'dob') {
            setShowDobPicker(Platform.OS === 'ios');
            if (selectedDate) setDob(selectedDate);
        } else {
            setShowDojPicker(Platform.OS === 'ios');
            if (selectedDate) setDoj(selectedDate);
        }
    };

    const handleSubmit = async () => {
        if (!name || !email || !departmentId || !phone) {
            Alert.alert("Missing Fields", "Please fill all required fields.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name,
                email,
                phone,
                gender,
                department: departmentId,
                role,
                qualification,
                dob: dob.toISOString().split('T')[0],
                date_of_joining: doj.toISOString().split('T')[0]
            };

            const res = await createTeacher(payload);
            Alert.alert(
                "Teacher Created!",
                `Auto-Generated Password: ${res.password}`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            const msg = error.error || error.detail || "Failed to create teacher";
            Alert.alert("Error", typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Basic Info</Text>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Dr. John Doe" />

            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="john@college.edu" autoCapitalize="none" />

            <Text style={styles.label}>Phone *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91 9876543210" />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={gender} onValueChange={setGender}>
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                    <Picker.Item label="Other" value="Other" />
                </Picker>
            </View>

            <Text style={styles.sectionTitle}>Academic Role</Text>

            <Text style={styles.label}>Department *</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={departmentId} onValueChange={setDepartmentId}>
                    {departments.map(d => <Picker.Item key={d.id} label={d.name} value={d.id} />)}
                </Picker>
            </View>

            <Text style={styles.label}>System Role</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={role} onValueChange={setRole}>
                    <Picker.Item label="Teacher" value="TEACHER" />
                    <Picker.Item label="Head of Department (HOD)" value="HOD" />
                </Picker>
            </View>

            <Text style={styles.label}>Qualification</Text>
            <TextInput style={styles.input} value={qualification} onChangeText={setQualification} placeholder="e.g. MSc, PhD" />

            <Text style={styles.sectionTitle}>Dates</Text>

            <Text style={styles.label}>Date of Birth *</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDobPicker(true)}>
                <Calendar color="#666" size={20} />
                <Text style={styles.dateText}>{dob.toDateString()}</Text>
            </TouchableOpacity>
            {showDobPicker && (
                <DateTimePicker
                    value={dob}
                    mode="date"
                    display="default"
                    onChange={(e, d) => handleDateChange(e, d, 'dob')}
                    maximumDate={new Date()}
                />
            )}

            <Text style={styles.label}>Date of Joining</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDojPicker(true)}>
                <Calendar color="#666" size={20} />
                <Text style={styles.dateText}>{doj.toDateString()}</Text>
            </TouchableOpacity>
            {showDojPicker && (
                <DateTimePicker
                    value={doj}
                    mode="date"
                    display="default"
                    onChange={(e, d) => handleDateChange(e, d, 'doj')}
                />
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                <UserPlus color="white" size={20} />
                <Text style={styles.submitText}>{loading ? "Creating..." : "Create Teacher Account"}</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background || '#f0f2f5' },
    content: { padding: 20, paddingBottom: 50 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginTop: 20, marginBottom: 10 },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 5, marginTop: 10 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
    pickerContainer: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden' },

    dateBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12
    },
    dateText: { marginLeft: 10, fontSize: 16, color: '#333' },

    submitBtn: {
        backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 16, borderRadius: 15, marginTop: 30, elevation: 4
    },
    submitText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 }
});

export default AdminTeacherAddScreen;
