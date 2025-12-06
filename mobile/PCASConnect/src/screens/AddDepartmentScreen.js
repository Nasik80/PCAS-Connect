import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import { addDepartment } from '../services/adminApi';
import { ArrowLeft, Check } from 'lucide-react-native';

const AddDepartmentScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !code) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        setLoading(true);
        try {
            await addDepartment({ name, code });
            Alert.alert("Success", "Department added successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            // Error Handling
            let msg = "Something went wrong";
            if (typeof error === 'object') {
                msg = JSON.stringify(error);
            } else {
                msg = error;
            }
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color={colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Department</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Department Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Computer Science"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Department Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. CS"
                        value={code}
                        onChangeText={setCode}
                        autoCapitalize="characters"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.disabledBtn]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text style={styles.submitText}>Save Department</Text>
                            <Check color="white" size={20} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    backBtn: { padding: 8, marginRight: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    input: {
        backgroundColor: 'white', padding: 16, borderRadius: 12, fontSize: 16,
        borderWidth: 1, borderColor: colors.surfaceHighlight, color: colors.textPrimary
    },
    submitBtn: {
        backgroundColor: colors.primary, padding: 18, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
        marginTop: 24, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    disabledBtn: { opacity: 0.7 },
    submitText: { fontSize: 16, fontWeight: '700', color: 'white' }
});

export default AddDepartmentScreen;
