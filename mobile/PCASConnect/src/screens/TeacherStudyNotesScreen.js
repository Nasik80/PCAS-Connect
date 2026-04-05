import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { getTeacherStudyNotes, uploadTeacherStudyNote, deleteTeacherStudyNote, getTeacherSubjects } from '../services/api';
import { BookOpen, Upload, Trash2, FileText, X } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { Picker } from '@react-native-picker/picker'; // You might need to check if this is installed, using alternative if not

const TeacherStudyNotesScreen = () => {
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [title, setTitle] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [file, setFile] = useState(null);
    const [teacherData, setTeacherData] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const userStr = await AsyncStorage.getItem('teacher');
            if (userStr) {
                const user = JSON.parse(userStr);
                setTeacherData(user);
                const [notesData, subjectsData] = await Promise.all([
                    getTeacherStudyNotes(user.teacher_id),
                    getTeacherSubjects(user.teacher_id)
                ]);
                setNotes(notesData || []);
                setSubjects(subjectsData?.subjects || []);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load study notes.');
        } finally {
            setLoading(false);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            console.error("Document Picker Error:", err);
        }
    };

    const handleUpload = async () => {
        if (!title || !selectedSubject || !file) {
            return Alert.alert('Error', 'Please provide a title, select a subject, and attach a file.');
        }

        try {
            setUploading(true);
            const sub = subjects.find(s => s.subject_id === parseInt(selectedSubject));
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('subject', selectedSubject);
            formData.append('semester', sub?.semester || 1);
            formData.append('teacher_id', teacherData.teacher_id);
            formData.append('department', teacherData.department_id || 1);
            
            // Append file for React Native
            formData.append('file', {
                uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                name: file.name,
                type: file.mimeType || 'application/pdf',
            });

            await uploadTeacherStudyNote(formData);
            Alert.alert('Success', 'Note uploaded successfully');
            
            setTitle('');
            setSelectedSubject('');
            setFile(null);
            loadData();
            
        } catch (error) {
            console.error('Upload error', error);
            Alert.alert('Error', 'Failed to upload note.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Note",
            "Are you sure you want to delete this note?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTeacherStudyNote(id);
                            loadData();
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete note.");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <FileText color={colors.primary} size={24} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subject}>{item.subject_name}</Text>
                    <Text style={styles.subtitle}>{new Date(item.uploaded_at).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Trash2 color={colors.error} size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <FlatList
            data={notes}
            style={styles.container}
            keyExtractor={item => item.id.toString()}
            ListHeaderComponent={
                <View>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Study Notes</Text>
                        <Text style={styles.headerSubtitle}>Manage and upload study materials</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>Upload New Note</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Note Title"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedSubject}
                                onValueChange={(itemValue) => setSelectedSubject(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Subject..." value="" />
                                {subjects.map(sub => (
                                    <Picker.Item key={sub.subject_id} label={`${sub.name} (Sem ${sub.semester})`} value={sub.subject_id} />
                                ))}
                            </Picker>
                        </View>

                        <TouchableOpacity style={styles.filePickerBtn} onPress={pickDocument}>
                            <BookOpen color={colors.primary} size={20} />
                            {file ? <Text style={styles.filePickerText}>{file.name}</Text> : <Text style={styles.filePickerText}>Select File (PDF, DOCX, JPG)</Text>}
                            {file ? (
                                <TouchableOpacity onPress={(e) => { e.stopPropagation(); setFile(null); }}>
                                    <X color={colors.textSecondary} size={20} />
                                </TouchableOpacity>
                            ) : null}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.uploadBtn, uploading && styles.uploadingBtn]} 
                            onPress={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Upload color={colors.white} size={20} style={{ marginRight: 8 }}/>
                                    <Text style={styles.uploadBtnText}>Upload Note</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginTop: 10 }]}>Uploaded Notes</Text>
                </View>
            }
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
                !loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No notes uploaded yet.</Text>
                    </View>
                ) : <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            }
        />
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textStart },
    headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    formContainer: { margin: 16, padding: 16, backgroundColor: colors.white, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.textStart, marginBottom: 16 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, color: colors.textStart },
    pickerContainer: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
    picker: { height: 50, width: '100%' },
    filePickerBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#EEF2FF', borderStyle: 'dashed' },
    filePickerText: { flex: 1, marginLeft: 12, color: colors.primary, fontSize: 14 },
    uploadBtn: { backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 8 },
    uploadingBtn: { opacity: 0.7 },
    uploadBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
    card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.white, borderRadius: 12, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 40, height: 40, backgroundColor: '#EEF2FF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardInfo: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: colors.textStart, marginBottom: 2 },
    subject: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
    subtitle: { fontSize: 12, color: colors.textLight },
    deleteBtn: { padding: 8 },
    emptyContainer: { alignItems: 'center', padding: 30 },
    emptyText: { color: colors.textSecondary, fontSize: 16 }
});

export default TeacherStudyNotesScreen;
