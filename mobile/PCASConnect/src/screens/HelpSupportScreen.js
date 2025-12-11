import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const HelpSupportScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Help & Support</Text>
            <Text style={styles.subText}>Contact admin for support</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    text: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
    subText: { fontSize: 16, color: colors.textSecondary, marginTop: 10 }
});

export default HelpSupportScreen;
