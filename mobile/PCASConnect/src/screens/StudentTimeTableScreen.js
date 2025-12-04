import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView 
} from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStudentTimetable } from '../api/studentApi';
import { Clock, User } from 'lucide-react-native';

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const StudentTimetableScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState(null);
  const [selectedDay, setSelectedDay] = useState("MON"); // Default to Monday

  useEffect(() => {
    // Auto-select today's day
    const today = new Date().getDay(); // 0=Sun, 1=Mon...
    const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    if (today !== 0) setSelectedDay(dayMap[today]);

    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const storedStudent = await AsyncStorage.getItem("student");
      const student = JSON.parse(storedStudent);
      
      if (student?.student_id) {
        const data = await getStudentTimetable(student.student_id);
        setTimetable(data);
      }
    } catch (error) {
      console.error("Timetable fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderPeriodItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.periodBadge}>
        <Text style={styles.periodNumber}>{item.period.number}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.subjectName}>{item.subject.name}</Text>
        
        <View style={styles.row}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {item.period.start_time.slice(0,5)} - {item.period.end_time.slice(0,5)}
          </Text>
        </View>

        <View style={styles.row}>
          <User size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.teacher_name}</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Timetable</Text>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelectorContainer}>
        <FlatList
          data={DAYS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.dayButton, 
                selectedDay === item && styles.dayButtonActive
              ]}
              onPress={() => setSelectedDay(item)}
            >
              <Text style={[
                styles.dayText, 
                selectedDay === item && styles.dayTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Timetable List */}
      <View style={styles.listContainer}>
        {timetable && timetable[selectedDay] && timetable[selectedDay].length > 0 ? (
          <FlatList
            data={timetable[selectedDay]}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPeriodItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No classes scheduled for {selectedDay}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center'
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },

  daySelectorContainer: {
    marginTop: 15,
    height: 50,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center'
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.primary,
    fontWeight: 'bold'
  },
  dayTextActive: {
    color: 'white',
  },

  listContainer: { flex: 1, padding: 15 },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  periodBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  periodNumber: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  
  cardContent: { flex: 1 },
  subjectName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  detailText: { marginLeft: 6, color: colors.textSecondary, fontSize: 13 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: colors.textSecondary, fontStyle: 'italic' }
});

export default StudentTimetableScreen;