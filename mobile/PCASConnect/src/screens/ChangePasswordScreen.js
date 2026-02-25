import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { colors } from '../constants/colors';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react-native';

const ChangePasswordScreen = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "All fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New password and confirm password do not match.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "New password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            const role = await AsyncStorage.getItem('role');
            let endpoint = '';
            let userId = '';

            if (role === 'TEACHER' || role === 'HOD') {
                userId = await AsyncStorage.getItem('teacherId');
                endpoint = `${API_BASE_URL}/api/teacher/change-password/`;
            } else if (role === 'STUDENT') {
                userId = await AsyncStorage.getItem('studentId');
                endpoint = `${API_BASE_URL}/api/student/change-password/`;
            } else {
                Alert.alert("Error", "Invalid user role.");
                setLoading(false);
                return;
            }

            if (!userId) {
                Alert.alert("Error", "User details not found. Please relogin.");
                setLoading(false);
                return;
            }

            const payload = {
                user_id: userId,
                role: role,
                old_password: oldPassword,
                new_password: newPassword
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Password changed successfully!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", data.error || "Failed to change password.");
            }

        } catch (error) {
            console.error("Change Password Error:", error);
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <KeyRound size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Update Your Password</Text>
                    <Text style={styles.subtitle}>Please enter your current password and your new password.</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Old Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter current password"
                            secureTextEntry={!showOld}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                        <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeIcon}>
                            {showOld ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            secureTextEntry={!showNew}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                            {showNew ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            secureTextEntry={!showConfirm}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                            {showConfirm ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Change Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 15, backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    content: { padding: 20 },
    iconContainer: { alignItems: 'center', marginVertical: 30 },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 20, marginBottom: 10 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        borderRadius: 12, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14
    },
    input: { flex: 1, height: 50, fontSize: 16, color: '#333' },
    eyeIcon: { padding: 10 },
    button: {
        backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 2
    },
    buttonDisabled: { backgroundColor: '#A5B4FC' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default ChangePasswordScreen;
