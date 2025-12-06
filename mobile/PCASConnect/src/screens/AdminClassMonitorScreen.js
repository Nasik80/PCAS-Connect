import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert, Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { Filter, Download } from 'lucide-react-native';
import { getDepartments, getSemesterAttendance, getExportUrl } from '../services/adminApi';
import CustomButton from '../components/CustomButton';

const AdminClassMonitorScreen = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Filter States
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [semester, setSemester] = useState(1);
  const [showFilter, setShowFilter] = useState(true); 

  useEffect(() => {
    loadDepts();
  }, []);

  const loadDepts = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
      if(data.length > 0) setSelectedDept(data[0]);
    } catch (e) { console.error(e); }
  };

  const fetchReport = async () => {
    if (!selectedDept) return;
    setLoading(true);
    setShowFilter(false);
    try {
        const today = new Date();
        const data = await getSemesterAttendance(
            selectedDept.id, 
            semester, 
            today.getFullYear(), 
            today.getMonth() + 1
        );
        setReportData(data);
    } catch (error) {
        Alert.alert("Error", "Could not fetch class report.");
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedDept) return;
    const today = new Date();
    const url = getExportUrl(selectedDept.id, semester, today.getFullYear(), today.getMonth() + 1);
    Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot open download link"));
  };

  const renderStudentRow = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 0.5, color: colors.textSecondary }]}>{index + 1}</Text>
      <Text style={[styles.cell, { flex: 2, fontWeight: '500' }]}>{item.name}</Text>
      <View style={[styles.badge, item.percentage < 75 ? styles.badgeDanger : styles.badgeSuccess]}>
        <Text style={[styles.badgeText, item.percentage < 75 ? styles.textDanger : styles.textSuccess]}>
            {item.percentage}%
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Class Monitor</Text>
        <View style={{flexDirection:'row', gap: 10}}>
            <TouchableOpacity onPress={handleDownload} style={styles.iconBtn}>
                <Download color="white" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.iconBtn}>
                <Filter color="white" size={20} />
            </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : reportData ? (
        <View style={styles.content}>
            <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>
                    {selectedDept?.code} - Sem {semester}
                </Text>
                <Text style={styles.summarySub}>
                    Total Classes: {reportData.total_classes_conducted} | Low Attendance: {reportData.low_attendance.length}
                </Text>
            </View>

            <View style={[styles.row, styles.tableHeader]}>
                <Text style={[styles.cell, { flex: 0.5, color: 'white' }]}>#</Text>
                <Text style={[styles.cell, { flex: 2, color: 'white' }]}>Student Name</Text>
                <Text style={[styles.cell, { color: 'white', textAlign:'right' }]}>Status</Text>
            </View>

            <FlatList
                data={reportData.students}
                keyExtractor={(item) => item.student_id.toString()}
                renderItem={renderStudentRow}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
      ) : (
        <View style={styles.center}>
            <Text style={{color: colors.textSecondary}}>Select filters to view report</Text>
        </View>
      )}

      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Class</Text>
                
                <Text style={styles.label}>Department</Text>
                <View style={styles.chipContainer}>
                    {departments.map(dept => (
                        <TouchableOpacity 
                            key={dept.id} 
                            style={[styles.chip, selectedDept?.id === dept.id && styles.chipActive]}
                            onPress={() => setSelectedDept(dept)}
                        >
                            <Text style={[styles.chipText, selectedDept?.id === dept.id && styles.chipTextActive]}>
                                {dept.code}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Semester</Text>
                <View style={styles.chipContainer}>
                    {[1, 2, 3, 4, 5, 6].map(sem => (
                        <TouchableOpacity 
                            key={sem} 
                            style={[styles.chip, semester === sem && styles.chipActive]}
                            onPress={() => setSemester(sem)}
                        >
                            <Text style={[styles.chipText, semester === sem && styles.chipTextActive]}>
                                {sem}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <CustomButton text="View Report" onPress={fetchReport} />
                <TouchableOpacity onPress={() => setShowFilter(false)} style={{marginTop: 15, alignSelf:'center'}}>
                    <Text style={{color: colors.textSecondary}}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  content: { flex: 1, padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryBox: { padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 15, elevation: 2 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  summarySub: { color: colors.textSecondary, marginTop: 5 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tableHeader: { backgroundColor: colors.primary, paddingHorizontal: 10, borderRadius: 8, marginBottom: 5 },
  cell: { fontSize: 14, color: colors.textPrimary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 'auto' },
  badgeSuccess: { backgroundColor: '#DCFCE7' },
  badgeDanger: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  textSuccess: { color: '#166534' },
  textDanger: { color: '#991B1B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 10, marginTop: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.textPrimary },
  chipTextActive: { color: 'white', fontWeight: 'bold' }
});

export default AdminClassMonitorScreen;