import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { colors } from '../constants/colors';
import { Book, ChevronRight } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

const TeacherInternalMarksScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('ALL');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const teacherId = await AsyncStorage.getItem('teacherId');
            if (!teacherId) return;

            // Reuse the existing subject fetch endpoint
            const res = await axios.get(`${BASE_URL}/api/teacher/${teacherId}/subjects/`);
            setSubjects(res.data.subjects);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const getFilteredSubjects = () => {
        if (selectedSemester === 'ALL') return subjects;
        return subjects.filter(s => s.semester.toString() === selectedSemester);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
                // Future: Navigate to Marks Entry Screen
                // navigation.navigate('EnterInternalMarks', { subject: item });
                alert("Marks Entry Module coming soon!");
            }}
        >
            <View style={styles.iconBox}>
                <Book color={colors.primary} size={24} />
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <Text style={styles.semText}>Semester {item.semester} • {item.code}</Text>
            </View>
            <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>
    );

    return (
        <DashboardLayout
            user={null}
            disableScroll={true}
            onNavigate={(screen) => {
                if (screen === 'Home') {
                    navigation.navigate('TeacherDashboard');
                } else {
                    navigation.navigate(screen);
                }
            }}
            onLogout={handleLogout}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>Internal Marks</Text>
                    <Text style={styles.subtitle}>Select Subject</Text>
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedSemester}
                        onValueChange={(itemValue) => setSelectedSemester(itemValue)}
                        style={styles.picker}
                        dropdownIconColor={colors.primary}
                    >
                        <Picker.Item label="Sem 1" value="1" />
                        <Picker.Item label="Sem 2" value="2" />
                        <Picker.Item label="Sem 3" value="3" />
                        <Picker.Item label="Sem 4" value="4" />
                        <Picker.Item label="Sem 5" value="5" />
                        <Picker.Item label="Sem 6" value="6" />
                    </Picker>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={getFilteredSubjects()}
                    keyExtractor={item => item.subject_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No subjects found.</Text>
                    }
                />
            )}
        </DashboardLayout>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    headerLeft: { flex: 1 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
    subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

    pickerContainer: {
        width: 170, height: 55, backgroundColor: '#EFF6FF', borderRadius: 8, justifyContent: 'center',
        borderWidth: 1, borderColor: '#DBEAFE', overflow: 'hidden'
    },
    picker: { height: 55, width: 180, color: colors.primary },

    listContent: { padding: 16 },
    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    iconBox: {
        width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF',
        justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    infoBox: { flex: 1 },
    subjectName: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
    semText: { fontSize: 13, color: '#64748B' },

    emptyText: { textAlign: 'center', marginTop: 20, color: '#94A3B8' }
});

export default TeacherInternalMarksScreen;
