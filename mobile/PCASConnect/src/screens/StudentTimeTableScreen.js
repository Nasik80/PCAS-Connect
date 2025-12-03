import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';
import { BookOpen, Clock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSemesterSubjects, getStudentProfile } from '../services/api';

const StudentTimeTableScreen = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [semesterInfo, setSemesterInfo] = useState({ dept: '', sem: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const storedStudent = await AsyncStorage.getItem("student");
      if (storedStudent) {
        const student = JSON.parse(storedStudent);
        const studentId = student.student_id;

        // 1. Get Profile to know Dept & Sem
        // (If your login response already has dept_id, you can skip this)
        const profile = await getStudentProfile(studentId);
        
        setSemesterInfo({ dept: profile.department, sem: profile.semester });

        // 2. Fetch Subjects
        // Note: Using department_id = 1 as fallback if string is returned
        const deptId = profile.department_id || 1; 
        const data = await getSemesterSubjects(deptId, profile.semester);
        setSubjects(data);
      }
    } catch (error) {
      console.error("TimeTable Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSubjectItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <BookOpen color="white" size={24} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.subjectName}>{item.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.codeBadge}>{item.code}</Text>
          <Text style={styles.creditText}>{item.credit} Credits</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Semester Subjects</Text>
        <Text style={styles.headerSubtitle}>
          {semesterInfo.dept} • Semester {semesterInfo.sem}
        </Text>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.code || item.name}
        renderItem={renderSubjectItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No subjects found for this semester.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0F2FE',
    marginTop: 4,
    opacity: 0.9,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 10,
    fontWeight: '600',
  },
  creditText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: colors.textSecondary,
    fontStyle: 'italic',
  }
});

export default StudentTimeTableScreen;