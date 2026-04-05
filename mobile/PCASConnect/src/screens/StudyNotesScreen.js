import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStudentStudyNotes } from '../services/api';
import { BookOpen, Download } from 'lucide-react-native';
import { colors } from '../constants/colors';

const StudyNotesScreen = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            setLoading(true);
            const userStr = await AsyncStorage.getItem('student');
            if (userStr) {
                const user = JSON.parse(userStr);
                const data = await getStudentStudyNotes(user.student_id);
                setNotes(data || []);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load study notes.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (url) => {
        if (!url) return;
        Linking.openURL(url).catch(err => {
            console.error("Couldn't load page", err);
            Alert.alert("Error", "Could not open the file.");
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <BookOpen color={colors.primary} size={24} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subject}>{item.subject_name}</Text>
                    <Text style={styles.subtitle}>By {item.uploaded_by} • {new Date(item.uploaded_at).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDownload(item.file_url)} style={styles.downloadBtn}>
                    <Download color={colors.white} size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Study Materials</Text>
                <Text style={styles.headerSubtitle}>Notes for your current semester</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
            ) : notes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <BookOpen color={colors.textLight} size={48} />
                    <Text style={styles.emptyText}>No study notes available yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={notes}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textStart },
    headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    listContainer: { padding: 16 },
    card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 48, height: 48, backgroundColor: '#EEF2FF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardInfo: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: colors.textStart, marginBottom: 2 },
    subject: { fontSize: 14, color: colors.primary, fontWeight: '500', marginBottom: 2 },
    subtitle: { fontSize: 12, color: colors.textSecondary },
    downloadBtn: { width: 40, height: 40, backgroundColor: colors.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 16, fontSize: 16, color: colors.textSecondary }
});

export default StudyNotesScreen;
