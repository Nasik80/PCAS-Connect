import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../services/api';
import { colors } from '../constants/colors';
import { Save } from 'lucide-react-native';

const InternalMarkEntryScreen = ({ route, navigation }) => {
    const { subject } = route.params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchMarks();
    }, []);

    const fetchMarks = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/teacher/internal-marks/${subject.subject_id}/`);
            const formatted = res.data.marks.map(s => ({
                ...s,
                test_1_scored: String(s.test_1_scored || 0),
                test_1_total: String(s.test_1_total || 50),
                test_2_scored: String(s.test_2_scored || 0),
                test_2_total: String(s.test_2_total || 50),
            }));
            setStudents(formatted);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load marks.");
        } finally {
            setLoading(false);
        }
    };

    const handletextChange = (id, field, value) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id === id) {
                const updated = { ...s, [field]: value };

                // Recalculate Total
                const t1 = parseFloat(updated.test_1_scored) || 0;
                const t2 = parseFloat(updated.test_2_scored) || 0;
                updated.total = t1 + t2;

                return updated;
            }
            return s;
        }));
    };

    const getPercentage = (scored, total) => {
        const s = parseFloat(scored) || 0;
        const t = parseFloat(total) || 1;
        if (t === 0) return "0%";
        return Math.round((s / t) * 100) + "%";
    };

    const getTotalPercentage = (item) => {
        const s1 = parseFloat(item.test_1_scored) || 0;
        const s2 = parseFloat(item.test_2_scored) || 0;
        const t1 = parseFloat(item.test_1_total) || 0;
        const t2 = parseFloat(item.test_2_total) || 0;

        const totalScored = s1 + s2;
        const totalMax = t1 + t2;

        if (totalMax === 0) return "0%";
        return Math.round((totalScored / totalMax) * 100) + "%";
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = students.map(s => ({
                student_id: s.student_id,
                test_1_scored: parseFloat(s.test_1_scored) || 0,
                test_1_total: parseFloat(s.test_1_total) || 50,
                test_2_scored: parseFloat(s.test_2_scored) || 0,
                test_2_total: parseFloat(s.test_2_total) || 50
            }));

            await axios.post(`${BASE_URL}/api/teacher/internal-marks/${subject.subject_id}/`, {
                marks: payload
            });

            Alert.alert("Success", "Marks saved successfully!");
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to save marks.");
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.studentInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.regNo}>{item.reg_no}</Text>
            </View>

            <View style={styles.testSection}>
                <View style={[styles.testRow, { marginBottom: 8 }]}>
                    <Text style={styles.sectionLabel}>Test 1</Text>
                    <TextInput
                        placeholder="Scored"
                        style={styles.input}
                        keyboardType="numeric"
                        value={item.test_1_scored}
                        onChangeText={(t) => handletextChange(item.student_id, 'test_1_scored', t)}
                    />
                    <Text>/</Text>
                    <TextInput
                        placeholder="Total"
                        style={styles.input}
                        keyboardType="numeric"
                        value={item.test_1_total}
                        onChangeText={(t) => handletextChange(item.student_id, 'test_1_total', t)}
                    />
                    <Text style={styles.pctBadge}>{getPercentage(item.test_1_scored, item.test_1_total)}</Text>
                </View>

                <View style={styles.testRow}>
                    <Text style={styles.sectionLabel}>Test 2</Text>
                    <TextInput
                        placeholder="Scored"
                        style={styles.input}
                        keyboardType="numeric"
                        value={item.test_2_scored}
                        onChangeText={(t) => handletextChange(item.student_id, 'test_2_scored', t)}
                    />
                    <Text>/</Text>
                    <TextInput
                        placeholder="Total"
                        style={styles.input}
                        keyboardType="numeric"
                        value={item.test_2_total}
                        onChangeText={(t) => handletextChange(item.student_id, 'test_2_total', t)}
                    />
                    <Text style={styles.pctBadge}>{getPercentage(item.test_2_scored, item.test_2_total)}</Text>
                </View>
            </View>

            <View style={styles.totalRow}>
                <Text style={styles.totalText}>Total: {item.total} ({getTotalPercentage(item)})</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{subject.name}</Text>
                <Text style={styles.headerSubtitle}>Enter Internal Marks</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={item => item.student_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Save color="white" size={20} />
                            <Text style={styles.saveText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E2E8F0' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },

    loader: { marginTop: 50 },
    list: { padding: 16, paddingBottom: 100 },

    card: {
        backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    studentInfo: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
    name: { fontSize: 16, fontWeight: '600', color: '#334155' },
    regNo: { fontSize: 13, color: '#94A3B8' },

    testSection: { marginBottom: 16 },
    testRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionLabel: { width: 45, fontSize: 13, fontWeight: '600', color: '#475569' },
    input: {
        width: 50, height: 40, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8,
        textAlign: 'center', backgroundColor: '#F8FAFC', color: '#1E293B'
    },
    pctBadge: {
        backgroundColor: '#EFF6FF', color: colors.primary, fontSize: 12, fontWeight: 'bold',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', minWidth: 45, textAlign: 'center'
    },

    otherSection: { flexDirection: 'row', gap: 20, marginBottom: 16 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    label: { fontSize: 13, color: '#475569' },

    totalRow: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, alignItems: 'flex-end' },
    totalText: { fontSize: 15, fontWeight: 'bold', color: colors.primary },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white', padding: 16, borderTopWidth: 1, borderColor: '#E2E8F0'
    },
    saveBtn: {
        backgroundColor: colors.primary, borderRadius: 12, height: 50,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    saveText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default InternalMarkEntryScreen;
