import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Dimensions } from 'react-native';
import { colors } from '../constants/colors';
import { X, User, Bell, FileText, Settings, Key, LogOut } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MenuItem = ({ icon, label, onPress, danger }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        {icon}
        <Text style={[styles.menuText, danger && { color: '#ef4444' }]}>{label}</Text>
    </TouchableOpacity>
);

const SideNavMenu = ({ visible, onClose, onNavigate, onLogout }) => {
    return (
        <Modal visible={visible} transparent animationType="none">
            {/* Backdrop */}
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.backdrop} />
            </TouchableOpacity>

            {/* Drawer */}
            <View style={styles.drawer}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Menu</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <MenuItem
                            icon={<User size={22} color="#555" />}
                            label="Profile"
                            onPress={() => onNavigate('Profile')}
                        />
                        <MenuItem
                            icon={<Bell size={22} color="#555" />}
                            label="Announcements"
                            onPress={() => onNavigate('Announcements')}
                        />
                        <MenuItem
                            icon={<FileText size={22} color="#555" />}
                            label="Reports"
                            onPress={() => onNavigate('Reports')}
                        />
                        <MenuItem
                            icon={<Settings size={22} color="#555" />}
                            label="Settings"
                            onPress={() => onNavigate('Settings')}
                        />
                        <MenuItem
                            icon={<Key size={22} color="#555" />}
                            label="Change Password"
                            onPress={() => onNavigate('ChangePassword')}
                        />

                        <View style={styles.divider} />

                        <MenuItem
                            icon={<LogOut size={22} color="#ef4444" />}
                            label="Logout"
                            danger
                            onPress={onLogout}
                        />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { position: 'absolute', width: '100%', height: '100%' },
    backdrop: { width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' },
    drawer: {
        position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.75, backgroundColor: 'white', elevation: 10
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
    closeBtn: { padding: 5 },

    content: { padding: 20, gap: 10 },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15
    },
    menuText: { fontSize: 16, fontWeight: '500', color: '#333' },

    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 }
});

export default SideNavMenu;
