import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { Search, ChevronRight } from 'lucide-react-native';
import { searchStudents } from '../services/adminApi';

const AdminSearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.length < 2) return;
    setLoading(true);
    try {
        const data = await searchStudents(query);
        setResults(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Student</Text>
        <View style={styles.searchBox}>
            <Search color={colors.textSecondary} size={20} />
            <TextInput 
                style={styles.input}
                placeholder="Name or Register Number"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
            />
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
        ) : (
            <FlatList
                data={results}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item} onPress={() => Alert.alert("Found", item.name)}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.sub}>{item.register_number} | {item.department}</Text>
                        </View>
                        <ChevronRight color={colors.textSecondary} size={20} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No students found</Text>
                }
            />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 20, paddingBottom: 30 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchBox: { 
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, 
    padding: 10, alignItems: 'center' 
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  content: { flex: 1, padding: 15 },
  item: { 
    backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2 
  },
  name: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: colors.textSecondary }
});

export default AdminSearchScreen;