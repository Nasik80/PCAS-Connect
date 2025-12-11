import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/api';
import { Picker } from '@react-native-picker/picker';

const HODAnnouncementScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('DEPT');
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!title || !content) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const teacherId = await AsyncStorage.getItem('teacher_id');
            const deptId = await AsyncStorage.getItem('department_id');

            await axios.post(`${BASE_URL}/api/teacher/hod/announcement/`, {
                teacher_id: teacherId,
                department_id: deptId,
                title,
                content,
                audience
            });
            Alert.alert("Success", "Announcement posted successfully");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Failed to post announcement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>New Announcement</Text>

            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />

            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Content"
                value={content}
                onChangeText={setContent}
                multiline
            />

            <Text style={styles.label}>Audience:</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={audience} onValueChange={setAudience}>
                    <Picker.Item label="Entire Department" value="DEPT" />
                    <Picker.Item label="Students Only" value="STUDENTS" />
                    <Picker.Item label="Teachers Only" value="TEACHERS" />
                </Picker>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handlePost} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Post Announcement</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#6200ea' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 15, fontSize: 16 },
    textArea: { height: 100, textAlignVertical: 'top' },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 20 },
    btn: { backgroundColor: '#6200ea', padding: 15, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default HODAnnouncementScreen;
