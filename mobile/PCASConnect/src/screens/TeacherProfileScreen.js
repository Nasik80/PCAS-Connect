import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Edit2, Mail, Phone, Calendar, Award, User, X, Camera, MapPin, Briefcase } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config';

const TeacherProfileScreen = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        dob: '',
        gender: '',
        qualification: '',
        profile_image: null,
    });
    const [saving, setSaving] = useState(false);
    const [teacherId, setTeacherId] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const teacherData = await AsyncStorage.getItem('teacher');
            if (teacherData) {
                const parsed = JSON.parse(teacherData);
                setTeacherId(parsed.teacher_id);
                loadProfileFromApi(parsed.teacher_id);
            } else {
                setLoading(false);
                Alert.alert("Error", "User data not found. Please log in again.");
            }
        } catch (error) {
            console.error("Error reading user data", error);
            setLoading(false);
            Alert.alert("Error", "Failed to load user data.");
        }
    };

    const loadProfileFromApi = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/teacher/profile/${id}/`);
            const data = await response.json();
            if (response.ok) {
                setProfile(data);
                setEditForm({
                    name: data.name || '',
                    phone: data.phone || '',
                    dob: data.dob || '',
                    gender: data.gender || '',
                    qualification: data.qualification || '',
                    profile_image: null, // Keep null unless user picks a new one
                });
            } else {
                Alert.alert("Error", data.error || "Failed to load profile");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Network error while loading profile");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('teacher');
            await AsyncStorage.removeItem('teacherId');
            await AsyncStorage.removeItem('teacher_id');
            await AsyncStorage.removeItem('department_id');
            await AsyncStorage.removeItem('role');
            navigation.replace('RoleSelect');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setEditForm(prev => ({ ...prev, profile_image: result.assets[0] }));
        }
    };

    const saveProfile = async () => {
        if (!teacherId) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('phone', editForm.phone);
            formData.append('dob', editForm.dob);
            formData.append('gender', editForm.gender);
            formData.append('qualification', editForm.qualification);

            if (editForm.profile_image) {
                const uriParts = editForm.profile_image.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('profile_image', {
                    uri: editForm.profile_image.uri,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            const response = await fetch(`${API_BASE_URL}/api/teacher/profile/${teacherId}/`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Profile updated successfully");
                setEditModalVisible(false);
                loadProfileFromApi(teacherId); // Reload to get fresh data
            } else {
                Alert.alert("Error", data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Network error while saving profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Failed to load profile.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header / Avatar */}
            <View style={styles.headerContainer}>
                <View style={styles.avatarContainer}>
                    {profile.profile_image ? (
                        <Image source={{ uri: profile.profile_image }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.nameText}>{profile.name}</Text>
                <Text style={styles.roleText}>{profile.role === 'HOD' ? 'Head of Department' : 'Faculty Member'}</Text>
                <Text style={styles.deptBadge}>{profile.department}</Text>

                <TouchableOpacity style={styles.editButtonBig} onPress={() => setEditModalVisible(true)}>
                    <Edit2 size={16} color="#fff" />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Details Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Personal Information</Text>

                <View style={styles.infoRow}>
                    <View style={styles.iconBox}><Mail size={20} color={colors.primary} /></View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{profile.email}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.iconBox}><Phone size={20} color={colors.primary} /></View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{profile.phone || 'Not provided'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.iconBox}><User size={20} color={colors.primary} /></View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Gender</Text>
                        <Text style={styles.infoValue}>{profile.gender || 'Not specified'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.iconBox}><Calendar size={20} color={colors.primary} /></View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                        <Text style={styles.infoValue}>{profile.dob || 'Not specified'}</Text>
                    </View>
                </View>
            </View>

            {/* Academic Info */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Academic Information</Text>

                <View style={styles.infoRow}>
                    <View style={styles.iconBox}><Award size={20} color={colors.primary} /></View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Qualification</Text>
                        <Text style={styles.infoValue}>{profile.qualification || 'Not provided'}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.iconBox}><Briefcase size={20} color={colors.primary} /></View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Date of Joining</Text>
                        <Text style={styles.infoValue}>{profile.date_of_joining || 'Not specified'}</Text>
                    </View>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                                <X size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            {/* Image Picker */}
                            <View style={styles.editAvatarContainer}>
                                <TouchableOpacity onPress={pickImage} style={styles.imagePickerWrapper}>
                                    {editForm.profile_image ? (
                                        <Image source={{ uri: editForm.profile_image.uri }} style={styles.editAvatarImage} />
                                    ) : profile.profile_image ? (
                                        <Image source={{ uri: profile.profile_image }} style={styles.editAvatarImage} />
                                    ) : (
                                        <View style={[styles.editAvatarImage, styles.avatarPlaceholder]}>
                                            <Text style={styles.avatarText}>{editForm.name.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <View style={styles.cameraBadge}>
                                        <Camera size={16} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.name}
                                onChangeText={(t) => setEditForm(prev => ({ ...prev, name: t }))}
                            />

                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.phone}
                                keyboardType="phone-pad"
                                onChangeText={(t) => setEditForm(prev => ({ ...prev, phone: t }))}
                            />

                            <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.dob}
                                placeholder="e.g. 1990-05-15"
                                onChangeText={(t) => setEditForm(prev => ({ ...prev, dob: t }))}
                            />

                            <Text style={styles.inputLabel}>Gender</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.gender}
                                placeholder="Male / Female / Other"
                                onChangeText={(t) => setEditForm(prev => ({ ...prev, gender: t }))}
                            />

                            <Text style={styles.inputLabel}>Qualification</Text>
                            <TextInput
                                style={styles.input}
                                value={editForm.qualification}
                                placeholder="e.g. MSc, PhD"
                                onChangeText={(t) => setEditForm(prev => ({ ...prev, qualification: t }))}
                            />

                            <TouchableOpacity
                                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                                onPress={saveProfile}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    avatarContainer: {
        marginBottom: 15,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 60,
        padding: 2,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    avatarPlaceholder: {
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 10,
    },
    deptBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        overflow: 'hidden',
        marginBottom: 15,
    },
    editButtonBig: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 25,
        gap: 8,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.background,
        paddingBottom: 10,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        marginHorizontal: 20,
        marginTop: 30,
        paddingVertical: 15,
        borderRadius: 15,
        gap: 10,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        height: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.background,
        paddingBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    closeButton: {
        padding: 5,
    },
    editAvatarContainer: {
        alignItems: 'center',
        marginVertical: 15,
    },
    imagePickerWrapper: {
        position: 'relative',
    },
    editAvatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 30,
        elevation: 2,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default TeacherProfileScreen;
