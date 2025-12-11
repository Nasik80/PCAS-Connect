import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image, Platform } from 'react-native';
import { colors } from '../constants/colors';
import { Menu } from 'lucide-react-native';
import SideNavMenu from './SideNavMenu';
import IDCardPanel from './IDCardPanel';

const DashboardLayout = ({
    user,
    children,
    onNavigate,
    onLogout
}) => {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                    <Menu size={24} color={colors.textPrimary || '#333'} />
                </TouchableOpacity>
                <Text style={styles.collegeName}>PCAS Connect</Text>
                <View style={{ width: 24 }} />
                {/* Spacer to center title */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ID Card */}
                {user && (
                    <IDCardPanel
                        name={user.name}
                        role={user.role}
                        department={user.department}
                        email={user.email}
                        phone={user.phone}
                    />
                )}

                {/* Main Content (Tiles, Lists, etc.) */}
                {children}

                <View style={{ height: 100 }} />
                {/* Bottom Padding for TabBar */}
            </ScrollView>

            {/* Side Menu */}
            <SideNavMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onNavigate={(screen) => {
                    setMenuVisible(false);
                    onNavigate(screen);
                }}
                onLogout={onLogout}
            />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background || '#f0f2f5',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    topBar: {
        height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05
    },
    menuBtn: { padding: 8 },
    collegeName: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    scrollContent: { paddingBottom: 20 }
});

export default DashboardLayout;
