import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const StatusCard = ({ title, value, icon, gradient, onPress }) => {
    const bgGradient = gradient || colors.gradientPrimary;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={bgGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.iconContainer}>
                    {icon}
                </View>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.title}>{title}</Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%', // Allows 2 per row with gap
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        height: 140
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 12,
        marginBottom: 12
    },
    value: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        marginBottom: 4
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E0E7FF',
    }
});

export default StatusCard;
