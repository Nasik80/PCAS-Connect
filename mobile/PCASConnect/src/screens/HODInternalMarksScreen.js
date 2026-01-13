import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SectionList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const HODInternalMarksScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const deptId = await AsyncStorage.getItem('department_id');
            const res = await axios.get(`${BASE_URL}/api/teacher/hod/internal-marks/${deptId}/`);

            // Group by Semester
            const grouped = res.data.reduce((acc, item) => {
                const title = `Semester ${item.semester}`;
                if (!acc[title]) acc[title] = [];
                acc[title].push(item);
                return acc;
            }, {});

            const sections = Object.keys(grouped).map(key => ({
                title: key,
                data: grouped[key]
            }));

            setData(sections);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load marks data");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (item) => {
        if (item.status === 'Draft' || item.status === 'Pending') {
            Alert.alert("Info", "Teacher has not submitted marks yet.");
            return;
        }

        if (item.status === 'Approved') {
            Alert.alert("Info", "Marks already approved and locked.");
            return;
        }

        Alert.alert(
            "Action Required",
            `Approve marks for ${item.subject_name}?`,
            [
                { text: "Return to Teacher", onPress: () => performAction(item.subject_id, 'RETURN'), style: 'destructive' },
                { text: "Cancel", style: "cancel" },
                { text: "Approve & Lock", onPress: () => performAction(item.subject_id, 'APPROVE') }
            ]
        );
    };

    const performAction = async (subjectId, action) => {
        try {
            await axios.post(`${BASE_URL}/api/teacher/hod/internal-marks/action/`, {
                subject_id: subjectId,
                action: action
            });
            Alert.alert("Success", action === 'APPROVE' ? "Marks Approved" : "Marks Returned");
            fetchData();
        } catch (error) {
            Alert.alert("Error", "Action failed");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return '#10B981';
            case 'Submitted': return '#F59E0B';
            case 'Draft': return '#6B7280';
            default: return '#9CA3AF';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleAction(item)}>
            <View style={{ flex: 1 }}>
                <Text style={styles.subName}>{item.subject_name}</Text>
                <Text style={styles.details}>{item.code} • {item.teacher}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Internal Marks Oversight</Text>
            {loading ? <ActivityIndicator size="large" color="#6200ea" /> : (
                <SectionList
                    sections={data}
                    keyExtractor={(item, index) => item.subject_id + index}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8faFc' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#6200ea', marginTop: 15, marginBottom: 10, backgroundColor: '#f8faFc' },
    card: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1
    },
    subName: { fontSize: 16, fontWeight: '600', color: '#333' },
    details: { fontSize: 12, color: '#666', marginTop: 2 },
    badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});

export default HODInternalMarksScreen;
