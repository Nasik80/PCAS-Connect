import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, ScrollView, Platform
} from 'react-native';
import { colors } from '../constants/colors';
import { addTeacher, getDepartments } from '../services/adminApi';
import { ArrowLeft, Check, ChevronDown, Calendar, Phone, Mail, User, Shield } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTeacherScreen = ({ navigation }) => {
    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [qualification, setQualification] = useState('');
    const [dob, setDob] = useState(null);
    const [joiningDate, setJoiningDate] = useState(null);

    // Selectors
    const [department, setDepartment] = useState(null);
    const [role, setRole] = useState('TEACHER'); // TEACHER or HOD

    // Data & UI State
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [deptModalVisible, setDeptModalVisible] = useState(false);
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [showJoinPicker, setShowJoinPicker] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.log('Failed to fetch departments', error);
        }
    };

    const handleSubmit = async () => {
        if (!name || !email || !department || !dob || !phone) {
            Alert.alert("Validation Error", "Name, Email, Phone, DOB, and Department are required.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name,
                email,
                phone,
                department: department.id,
                dob: dob.toISOString().split('T')[0],
                role,
                qualification,
                date_of_joining: joiningDate ? joiningDate.toISOString().split('T')[0] : null
            };

            const response = await addTeacher(payload);
            const password = response._generated_password || "Check Email/Admin";

            Alert.alert(
                "Teacher Created!",
                `Teacher added successfully.\n\nGenerated Password: ${password}`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            let msg = "Something went wrong";
            if (error && typeof error === 'object') {
                const keys = Object.keys(error);
                if (keys.length > 0) msg = `${keys[0]}: ${error[keys[0]]}`;
                else msg = JSON.stringify(error);
            } else {
                msg = String(error);
            }
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    // Date Helpers
    const handleDobChange = (event, selectedDate) => {
        setShowDobPicker(Platform.OS === 'ios');
        if (selectedDate) setDob(selectedDate);
    };

    const handleJoinDateChange = (event, selectedDate) => {
        setShowJoinPicker(Platform.OS === 'ios');
        if (selectedDate) setJoiningDate(selectedDate);
    };

    const renderModal = (visible, items, onSelect, onClose) => (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Department</Text>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.modalItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color={colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Teacher</Text>
            </View>

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

                {/* Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name *</Text>
                    <View style={styles.inputContainer}>
                        <User size={20} color="#999" style={styles.icon} />
                        <TextInput style={styles.input} placeholder="e.g. John Doe" value={name} onChangeText={setName} />
                    </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address *</Text>
                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#999" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number *</Text>
                    <View style={styles.inputContainer}>
                        <Phone size={20} color="#999" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="+91 9876543210"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* DOB */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth *</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={() => setShowDobPicker(true)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Calendar size={20} color="#999" style={{ marginRight: 10 }} />
                            <Text style={[styles.selectText, !dob && { color: '#999' }]}>
                                {dob ? dob.toDateString() : "Select Date"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {showDobPicker && (
                        <DateTimePicker
                            value={dob || new Date(1990, 0, 1)}
                            mode="date"
                            display="default"
                            onChange={handleDobChange}
                            maximumDate={new Date()}
                        />
                    )}
                </View>

                {/* Role Selector */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Role *</Text>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleBtn, role === 'TEACHER' && styles.activeRole]}
                            onPress={() => setRole('TEACHER')}
                        >
                            <User size={18} color={role === 'TEACHER' ? 'white' : colors.primary} />
                            <Text style={[styles.roleText, role === 'TEACHER' && styles.activeRoleText]}>Teacher</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.roleBtn, role === 'HOD' && styles.activeRole]}
                            onPress={() => setRole('HOD')}
                        >
                            <Shield size={18} color={role === 'HOD' ? 'white' : colors.primary} />
                            <Text style={[styles.roleText, role === 'HOD' && styles.activeRoleText]}>HOD</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Department */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Department *</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={() => setDeptModalVisible(true)}>
                        <Text style={[styles.selectText, !department && { color: '#999' }]}>
                            {department ? department.name : "Select Department"}
                        </Text>
                        <ChevronDown size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Qualification */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Qualification</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputNotIcon}
                            placeholder="e.g. MSc, PhD"
                            value={qualification}
                            onChangeText={setQualification}
                        />
                    </View>
                </View>

                {/* Date of Joining */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Joining</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={() => setShowJoinPicker(true)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Calendar size={20} color="#999" style={{ marginRight: 10 }} />
                            <Text style={[styles.selectText, !joiningDate && { color: '#999' }]}>
                                {joiningDate ? joiningDate.toDateString() : "Select Date"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {showJoinPicker && (
                        <DateTimePicker
                            value={joiningDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleJoinDateChange}
                        />
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.disabledBtn]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : (
                        <>
                            <Text style={styles.submitText}>Save Teacher</Text>
                            <Check color="white" size={20} />
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {renderModal(deptModalVisible, departments, setDepartment, () => setDeptModalVisible(false))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 24 },
    backBtn: { padding: 8, marginRight: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },

    form: { paddingHorizontal: 24 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },

    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#eee'
    },
    icon: { marginLeft: 12 },
    input: { flex: 1, padding: 14, fontSize: 15, color: colors.textPrimary },
    inputNotIcon: { flex: 1, padding: 14, fontSize: 15, color: colors.textPrimary, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },

    selectInput: {
        backgroundColor: 'white', padding: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#eee',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    selectText: { fontSize: 15, color: colors.textPrimary },

    roleContainer: { flexDirection: 'row', gap: 10 },
    roleBtn: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.primary, gap: 8
    },
    activeRole: { backgroundColor: colors.primary },
    roleText: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
    activeRoleText: { color: 'white' },

    submitBtn: {
        backgroundColor: colors.primary, padding: 16, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
        marginTop: 20, elevation: 3
    },
    disabledBtn: { opacity: 0.7 },
    submitText: { fontSize: 16, fontWeight: '700', color: 'white' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16, color: colors.textPrimary, textAlign: 'center' },
    closeBtn: { marginTop: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 12, alignItems: 'center' },
    closeBtnText: { color: colors.textSecondary, fontWeight: '600' }
});

export default AddTeacherScreen;
