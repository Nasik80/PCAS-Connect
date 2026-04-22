import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Megaphone, ArrowLeft, Calendar, User as UserIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStudentAnnouncements } from '../api/studentApi';

const StudentAnnouncementsScreen = ({ navigation }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const storedStudent = await AsyncStorage.getItem("student");
            if (!storedStudent) return;
            const parsed = JSON.parse(storedStudent);
            const studentId = parsed.student_id;

            const data = await getStudentAnnouncements(studentId);
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnnouncements();
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <Megaphone size={20} color={colors.primary} />
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.audience}</Text>
                </View>
            </View>

            <Text style={styles.content}>{item.content}</Text>

            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <Calendar size={14} color="#888" />
                    <Text style={styles.footerText}>{item.date}</Text>
                </View>
                <View style={styles.footerItem}>
                    <UserIcon size={14} color="#888" />
                    <Text style={styles.footerText}>{item.sender}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Announcements</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={announcements}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Megaphone size={50} color="#ccc" />
                            <Text style={styles.emptyText}>No announcements found for you</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background || '#f4f4f5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 15, backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    titleContainer: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 10 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8, flex: 1 },
    badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: colors.primary },
    content: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 15 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
    footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { fontSize: 12, color: '#888' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#888' }
});

export default StudentAnnouncementsScreen;
