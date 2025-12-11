import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getDepartments } from '../services/adminApi';
import { colors } from '../constants/colors';
import { Search } from 'lucide-react-native';

const AdminTeacherFilterScreen = ({ navigation }) => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load departments");
        }
    };

    const handleSearch = () => {
        navigation.navigate('AdminTeacherList', {
            departmentId: selectedDept,
            search: searchQuery
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage Teachers</Text>
                <Text style={styles.subtitle}>Filter & Search Teachers</Text>
            </View>

            <View style={styles.form}>

                {/* Department */}
                <Text style={styles.label}>Select Department (Optional)</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedDept}
                        onValueChange={(itemValue) => setSelectedDept(itemValue)}
                    >
                        <Picker.Item label="All Departments" value="" />
                        {departments.map((dept) => (
                            <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                        ))}
                    </Picker>
                </View>

                {/* Search */}
                <Text style={styles.label}>Search (Name or Email)</Text>
                <View style={styles.searchBox}>
                    <Search size={20} color="#666" style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="Type name..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Action Button */}
                <TouchableOpacity style={styles.button} onPress={handleSearch}>
                    <Text style={styles.buttonText}>View Teachers</Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: 'white', padding: 20 },
    header: { marginBottom: 30, marginTop: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
    subtitle: { fontSize: 16, color: '#666', marginTop: 5 },

    form: { gap: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },

    pickerContainer: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden', backgroundColor: '#f9f9f9'
    },

    searchBox: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 15,
        height: 50, backgroundColor: '#f9f9f9'
    },
    input: { flex: 1, fontSize: 16 },

    button: {
        backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: 'center',
        marginTop: 20, elevation: 3
    },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default AdminTeacherFilterScreen;
