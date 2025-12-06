import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const HODPromotionScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [departmentId, setDepartmentId] = useState(null);
    const [currentSemester, setCurrentSemester] = useState('1');

    useEffect(() => {
        const loadData = async () => {
            const deptId = await AsyncStorage.getItem('department_id');
            setDepartmentId(deptId);
        };
        loadData();
    }, []);

    const handlePromote = async () => {
        if (!departmentId) return;

        Alert.alert(
            "Confirm Promotion",
            `Are you sure you want to promote all students from Semester ${currentSemester} to Semester ${parseInt(currentSemester) + 1}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Promote",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await axios.post(`${BASE_URL}/api/teacher/hod/promote/`, {
                                department_id: departmentId,
                                current_semester: currentSemester
                            });
                            Alert.alert("Success", response.data.message);
                        } catch (error) {
                            Alert.alert("Error", error.response?.data?.message || "Promotion failed");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Promote Students</Text>
            <Text style={styles.subtitle}>Select Current Semester</Text>

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={currentSemester}
                    onValueChange={(itemValue) => setCurrentSemester(itemValue)}
                >
                    {[1, 2, 3, 4, 5, 6].map((sem) => (
                        <Picker.Item key={sem} label={`Semester ${sem}`} value={sem.toString()} />
                    ))}
                </Picker>
            </View>

            <TouchableOpacity style={styles.promoteBtn} onPress={handlePromote} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Promote Students</Text>}
            </TouchableOpacity>

            <Text style={styles.warning}>
                Warning: This action will move all students of the selected semester to the next one and reassign subjects automatically. This cannot be undone easily.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#6200ea' },
    subtitle: { fontSize: 16, marginBottom: 10, color: '#666' },
    pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 30 },
    promoteBtn: { backgroundColor: '#d32f2f', padding: 15, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    warning: { marginTop: 20, color: '#f57c00', textAlign: 'center', fontSize: 12 }
});

export default HODPromotionScreen;
