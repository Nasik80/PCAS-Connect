import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const HODTeacherListScreen = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const deptId = await AsyncStorage.getItem('department_id');
            const response = await axios.get(`${BASE_URL}/api/teacher/hod/teachers/${deptId}/`);
            setTeachers(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>{item.email}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Department Teachers</Text>
            {loading ? <ActivityIndicator size="large" color="#6200ea" /> : (
                <FlatList
                    data={teachers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: '#6200ea' },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    details: { color: '#666', fontSize: 12 }
});

export default HODTeacherListScreen;
