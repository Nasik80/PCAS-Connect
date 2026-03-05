import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
    ActivityIndicator, RefreshControl, Alert, TextInput, Platform, KeyboardAvoidingView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { ArrowLeft, Edit3, Camera, Save, X, User } from 'lucide-react-native';
import { getStudentProfile, updateStudentProfile } from '../api/studentApi';
import { API_BASE_URL } from '../config';

const StudentProfileScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [studentId, setStudentId] = useState(null);
    const [profile, setProfile] = useState(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        phone: '', address: '', bloodGroup: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const storedStudent = await AsyncStorage.getItem("student");
            if (storedStudent) {
                const parsed = JSON.parse(storedStudent);
                setStudentId(parsed.student_id);
                fetchData(parsed.student_id);
            } else {
                navigation.replace("RoleSelect");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchData = async (id) => {
        if (!refreshing) setLoading(true);
        try {
            const data = await getStudentProfile(id);
            setProfile(data);
            setFormData({
                phone: data.phone_number || '',
                address: data.address || '',
                bloodGroup: data.blood_group || ''
            });
        } catch (error) {
            console.error("Profile Fetch Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to update your profile picture.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = new FormData();
            data.append('phone_number', formData.phone);
            data.append('address', formData.address);
            data.append('blood_group', formData.bloodGroup);

            if (selectedImage) {
                data.append('profile_image', {
                    uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
                    name: 'profile.jpg',
                    type: 'image/jpeg'
                });
            }

            const updated = await updateStudentProfile(studentId, data);
            setProfile(updated);
            setIsEditing(false);
            setSelectedImage(null);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Save error:", error);
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        if (studentId) fetchData(studentId);
    };

    if (loading && !profile) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // Determine avatar URL
    let avatarUri = null;
    if (selectedImage) {
        avatarUri = { uri: selectedImage.uri };
    } else if (profile?.profile_image) {
        let url = profile.profile_image;
        if (!url.startsWith('http')) {
            url = `${API_BASE_URL}${url}`;
        }
        avatarUri = { uri: url };
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft color={colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(!isEditing)}>
                    {isEditing ? <X color={colors.textPrimary} size={24} /> : <Edit3 color={colors.primary} size={24} />}
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={isEditing ? pickImage : null} disabled={!isEditing}>
                        <View style={[styles.avatarContainer, styles.shadow]}>
                            {avatarUri ? (
                                <Image source={avatarUri} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <User size={50} color={colors.textLight} />
                                </View>
                            )}
                            {isEditing && (
                                <View style={styles.cameraIcon}>
                                    <Camera size={14} color="white" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.nameText}>{profile?.name}</Text>
                    <Text style={styles.regNoText}>{profile?.register_number} • Sem {profile?.semester}</Text>
                </View>

                {/* Profile Details Container */}
                <View style={styles.detailsContainer}>

                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Academic Info</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Department</Text>
                            <Text style={styles.infoValue}>{profile?.department_name}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{profile?.email}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date of Birth</Text>
                            <Text style={styles.infoValue}>{profile?.dob || "Not Provided"}</Text>
                        </View>
                    </View>

                    <View style={[styles.infoCard, { marginTop: 16 }]}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.editInput}
                                    value={formData.phone}
                                    onChangeText={(val) => setFormData({ ...formData, phone: val })}
                                    placeholder="e.g. 9876543210"
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={styles.infoValue}>{profile?.phone_number || "--"}</Text>
                            )}
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Blood Group</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.editInput}
                                    value={formData.bloodGroup}
                                    onChangeText={(val) => setFormData({ ...formData, bloodGroup: val })}
                                    placeholder="e.g. O+"
                                />
                            ) : (
                                <Text style={styles.infoValue}>{profile?.blood_group || "--"}</Text>
                            )}
                        </View>
                        <View style={styles.divider} />

                        <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                            <Text style={styles.infoLabel}>Address</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.editInput, { height: 60, textAlignVertical: 'top' }]}
                                    value={formData.address}
                                    onChangeText={(val) => setFormData({ ...formData, address: val })}
                                    multiline
                                    placeholder="Home address"
                                />
                            ) : (
                                <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>{profile?.address || "--"}</Text>
                            )}
                        </View>

                    </View>

                </View>
            </ScrollView>

            {/* Floating Save Button */}
            {isEditing && (
                <View style={styles.saveBtnContainer}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                        {saving ? <ActivityIndicator color="white" /> : (
                            <>
                                <Text style={styles.saveBtnText}>Save Profile</Text>
                                <Save color="white" size={20} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    container: { flex: 1, backgroundColor: colors.background },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: 'white',
        ...Platform.select({ ios: { zIndex: 10 }, android: { elevation: 2 } })
    },
    backBtn: { padding: 4 },
    editBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },

    scrollContent: { paddingBottom: 100 },

    avatarSection: { alignItems: 'center', marginVertical: 24 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#E2E8F0', borderWidth: 4, borderColor: 'white' },
    avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
    shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    cameraIcon: {
        position: 'absolute', bottom: 4, right: 4, backgroundColor: colors.primary,
        width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'white'
    },

    nameText: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
    regNoText: { fontSize: 14, color: colors.textSecondary, marginTop: 4, fontWeight: '500' },

    detailsContainer: { paddingHorizontal: 24 },
    infoCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }, android: { elevation: 2 } }) },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    infoLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
    infoValue: { fontSize: 15, color: colors.textPrimary, fontWeight: '600' },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

    editInput: {
        flex: 1, marginLeft: 20, backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: colors.textPrimary, textAlign: 'right'
    },

    saveBtnContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24,
        backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F1F5F9'
    },
    saveBtn: {
        backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10
    },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' }
});

export default StudentProfileScreen;
