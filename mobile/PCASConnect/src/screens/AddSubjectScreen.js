import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { colors } from '../constants/colors';
import { addSubject, getDepartments } from '../services/adminApi';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react-native';

const AddSubjectScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [semester, setSemester] = useState('');
    const [credit, setCredit] = useState('');
    const [subjectType, setSubjectType] = useState('CORE');
    const [department, setDepartment] = useState(null);

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deptModalVisible, setDeptModalVisible] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);

    const subjectTypes = ['CORE', 'SEC', 'VAC', 'DSE', 'MDC', 'AEC'];

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

    const handleSubmit = async () => {
        if (!name || !code || !semester || !credit || !department) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        setLoading(true);
        try {
            await addSubject({
                name,
                code,
                semester: parseInt(semester),
                credit: parseInt(credit),
                subject_type: subjectType,
                department: department.id
            });
            Alert.alert("Success", "Subject added successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            let msg = "Something went wrong";
            if (error && typeof error === 'object') {
                // Try to extract first error message
                const keys = Object.keys(error);
                if (keys.length > 0) msg = `${keys[0]}: ${error[keys[0]]}`;
                else msg = JSON.stringify(error);
            } else {
                msg = String(error);
            }
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const renderModal = (visible, items, onSelect, onClose, displayProperty = null) => (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Option</Text>
                    <FlatList
                        data={items}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.modalItemText}>
                                    {displayProperty ? item[displayProperty] : item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color={colors.textPrimary} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Subject</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput style={styles.input} placeholder="Subject Name" value={name} onChangeText={setName} />
                    </View>
                    <View style={[styles.inputGroup, { width: 100 }]}>
                        <Text style={styles.label}>Code</Text>
                        <TextInput style={styles.input} placeholder="Code" value={code} onChangeText={setCode} />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Semester</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1-8"
                            value={semester}
                            onChangeText={setSemester}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Credit</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Credits"
                            value={credit}
                            onChangeText={setCredit}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Subject Type</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={() => setTypeModalVisible(true)}>
                        <Text style={styles.selectText}>{subjectType}</Text>
                        <ChevronDown size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Department</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={() => setDeptModalVisible(true)}>
                        <Text style={[styles.selectText, !department && { color: '#999' }]}>
                            {department ? department.name : "Select Department"}
                        </Text>
                        <ChevronDown size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.disabledBtn]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : (
                        <>
                            <Text style={styles.submitText}>Save Subject</Text>
                            <Check color="white" size={20} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {renderModal(deptModalVisible, departments, setDepartment, () => setDeptModalVisible(false), 'name')}
            {renderModal(typeModalVisible, subjectTypes, setSubjectType, () => setTypeModalVisible(false))}

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    backBtn: { padding: 8, marginRight: 16 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
    form: { gap: 16 },
    row: { flexDirection: 'row', gap: 12 },
    inputGroup: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    input: {
        backgroundColor: 'white', padding: 14, borderRadius: 12, fontSize: 15,
        borderWidth: 1, borderColor: colors.surfaceHighlight, color: colors.textPrimary
    },
    selectInput: {
        backgroundColor: 'white', padding: 14, borderRadius: 12,
        borderWidth: 1, borderColor: colors.surfaceHighlight,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    selectText: { fontSize: 15, color: colors.textPrimary },
    submitBtn: {
        backgroundColor: colors.primary, padding: 16, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
        marginTop: 16
    },
    disabledBtn: { opacity: 0.7 },
    submitText: { fontSize: 16, fontWeight: '700', color: 'white' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16, color: colors.textPrimary, textAlign: 'center' },
    closeBtn: { marginTop: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 12, alignItems: 'center' },
    closeBtnText: { color: colors.textSecondary, fontWeight: '600' }
});

export default AddSubjectScreen;
