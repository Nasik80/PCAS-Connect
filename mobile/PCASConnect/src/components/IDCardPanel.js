import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { User } from 'lucide-react-native';

const IDCardPanel = ({ name, role, department, email, phone }) => {
    return (
        <View style={styles.card}>
            {/* Header Line */}
            <View style={styles.topPattern} />

            <View style={styles.content}>
                <View style={styles.avatar}>
                    <User size={40} color="white" />
                </View>

                <View style={styles.info}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.role}>{role}</Text>
                    </View>
                    <Text style={styles.dept}>{department}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.subtext}>{email}</Text>
                    {phone && <Text style={styles.subtext}>{phone}</Text>}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white', borderRadius: 16, margin: 16,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
        overflow: 'hidden'
    },
    topPattern: {
        height: 8, backgroundColor: colors.primary
    },
    content: {
        flexDirection: 'row', padding: 20, alignItems: 'center'
    },
    avatar: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: colors.accent || '#4F46E5',
        justifyContent: 'center', alignItems: 'center', marginRight: 20,
        elevation: 2
    },
    info: { flex: 1 },
    name: {
        fontSize: 18, fontWeight: 'bold', color: '#333'
    },
    badge: {
        alignSelf: 'flex-start', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 4, marginVertical: 4
    },
    role: { fontSize: 10, fontWeight: '700', color: colors.primary },
    dept: { fontSize: 14, color: '#666', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
    subtext: { fontSize: 12, color: '#888' }
});

export default IDCardPanel;
