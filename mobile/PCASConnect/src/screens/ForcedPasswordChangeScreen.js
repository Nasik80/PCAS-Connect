import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { colors } from '../constants/colors';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react-native';

const ForcedPasswordChangeScreen = ({ route, navigation }) => {
    // We receive oldPassword, role, userId, and nextScreen from the login screen
    const { role, userId, oldPassword, nextScreen, userData } = route.params;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
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
            let endpoint = '';

            if (role === 'TEACHER' || role === 'HOD') {
                endpoint = `${API_BASE_URL}/api/teacher/change-password/`;
            } else if (role === 'STUDENT' || role === 'student') {
                endpoint = `${API_BASE_URL}/api/student/change-password/`;
            } else {
                Alert.alert("Error", "Invalid user role.");
                setLoading(false);
                return;
            }

            const payload = {
                user_id: userId,
                role: role.toUpperCase(),
                old_password: oldPassword, // Passed securely from login params
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
                // Successfully changed password, now we complete the login process
                // Save context exactly as login screen would have
                if (role.toUpperCase() === 'STUDENT') {
                    await AsyncStorage.setItem("student", JSON.stringify(userData));
                } else {
                    await AsyncStorage.setItem('teacher', JSON.stringify(userData));
                    await AsyncStorage.setItem('teacherId', userData.teacher_id.toString());
                    await AsyncStorage.setItem('teacher_id', userData.teacher_id.toString());
                    await AsyncStorage.setItem('department_id', userData.department_id.toString());
                    await AsyncStorage.setItem('role', userData.role);
                }

                Alert.alert("Success", "Password updated successfully!", [
                    {
                        text: "Continue to Dashboard",
                        onPress: () => navigation.replace(nextScreen, { userData })
                    }
                ]);
            } else {
                Alert.alert("Error", data.error || "Failed to change password.");
            }

        } catch (error) {
            console.error("Forced Password Change Error:", error);
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Action Required</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <ShieldAlert size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Update Default Password</Text>
                    <Text style={styles.subtitle}>For security reasons, you must change your auto-generated password before accessing your account.</Text>
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
                        <Text style={styles.buttonText}>Update and Continue</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.cancelBtnText}>Cancel and Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: {
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 16, paddingVertical: 20, backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    content: { padding: 20 },
    iconContainer: { alignItems: 'center', marginVertical: 30 },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 20, marginBottom: 10, lineHeight: 20 },
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
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { marginTop: 20, alignItems: 'center' },
    cancelBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' }
});

export default ForcedPasswordChangeScreen;
