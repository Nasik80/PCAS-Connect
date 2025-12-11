import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

const StatusTile = ({ title, value, label, color, onPress }) => (
    <TouchableOpacity style={[styles.tile, { borderLeftColor: color }]} onPress={onPress}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
);

const StatusTiles = ({ tiles }) => {
    return (
        <View style={styles.container}>
            {tiles.map((t, index) => (
                <StatusTile
                    key={index}
                    title={t.title}
                    value={t.value}
                    label={t.label}
                    color={t.color || colors.primary}
                    onPress={t.onPress}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16
    },
    tile: {
        width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 16,
        borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1
    },
    value: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    title: { fontSize: 14, fontWeight: '600', color: '#555' },
    label: { fontSize: 11, color: '#888', marginTop: 5 }
});

export default StatusTiles;
