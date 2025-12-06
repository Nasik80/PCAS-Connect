import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import { ArrowLeft, Check, ChevronDown, GraduationCap } from 'lucide-react-native';
import { getDepartments, promoteStudents } from '../services/adminApi';

const AdminPromotionScreen = ({ navigation }) => {
    const [department, setDepartment] = useState(null);
    const [currentSemester, setCurrentSemester] = useState('');

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deptModalVisible, setDeptModalVisible] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.log('Failed to fetch departments', error);
        }
    };

    const handlePromote = async () => {
        if (!department || !currentSemester) {
            Alert.alert("Error", "Please select Department and Current Semester");
            return;
        }

        Alert.alert(
            "Confirm Promotion",
            `Are you sure you want to promote all students from ${department.name} Semester ${currentSemester} to Semester ${parseInt(currentSemester) + 1}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Promote",
                    style: "destructive",
                    onPress: executePromotion
                }
            ]
        );
    };

    const executePromotion = async () => {
        setLoading(true);
        try {
            const res = await promoteStudents({
                department: department.id,
                current_semester: parseInt(currentSemester)
            });

            Alert.alert("Success", res.message, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            let msg = "Something went wrong";
            if (error && error.message) msg = error.message;
            else if (error && error.error) msg = error.error;
            else msg = JSON.stringify(error);

            Alert.alert("Promotion Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    const renderDeptItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setDepartment(item);
                setDeptModalVisible(false);
            }}
        >
            <Text style={styles.modalItemText}>{item.name} ({item.code})</Text>
            {department?.id === item.id && <Check color={colors.primary} size={20} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Promote Students</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoBox}>
                    <GraduationCap color={colors.primary} size={32} />
                    <Text style={styles.infoText}>
                        Promote an entire batch to the next semester.
                        This will automatically update their semester and assign new subjects.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Department</Text>
                        <TouchableOpacity style={styles.selectInput} onPress={() => setDeptModalVisible(true)}>
                            <Text style={[styles.selectText, !department && { color: '#999' }]}>
                                {department ? department.name : "Select Department"}
                            </Text>
                            <ChevronDown color="#666" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Current Semester</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g 1"
                            value={currentSemester}
                            onChangeText={setCurrentSemester}
                            keyboardType="numeric"
                        />
                        <Text style={styles.hint}>Students in this semester will be moved to Sem {parseInt(currentSemester || 0) + 1}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={handlePromote}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitBtnText}>Promote Students</Text>
                        )}
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* Department Modal */}
            <Modal visible={deptModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Department</Text>
                            <TouchableOpacity onPress={() => setDeptModalVisible(false)}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={departments}
                            renderItem={renderDeptItem}
                            keyExtractor={item => item.id.toString()}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        height: 100,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 20,
        paddingHorizontal: 20,
        justifyContent: 'space-between'
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 2 },

    content: { padding: 20 },

    infoBox: {
        flexDirection: 'row',
        backgroundColor: colors.primaryLight,
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
        gap: 16
    },
    infoText: { flex: 1, fontSize: 13, color: colors.primaryDark, lineHeight: 20 },

    formContainer: { gap: 20 },

    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.textPrimary
    },
    selectInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    selectText: { fontSize: 16, color: colors.textPrimary },
    hint: { fontSize: 12, color: colors.textSecondary, marginLeft: 4 },

    submitBtn: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    modalItem: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalItemText: { fontSize: 16, color: colors.textPrimary }
});

export default AdminPromotionScreen;
