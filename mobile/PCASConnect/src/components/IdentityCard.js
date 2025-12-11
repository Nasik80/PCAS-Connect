import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, Briefcase } from 'lucide-react-native';

const IdentityCard = ({ name, role, department, email, phone, photoUrl }) => {
    return (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.topDecoration}
            />
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <View style={styles.photoContainer}>
                        {photoUrl ? (
                            <Image source={{ uri: photoUrl }} style={styles.photo} />
                        ) : (
                            <View style={styles.placeholderPhoto}>
                                <User size={40} color={colors.primary} />
                            </View>
                        )}
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.name}>{name}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{role}</Text>
                        </View>
                        <Text style={styles.department}>{department}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.contactContainer}>
                    <View style={styles.contactRow}>
                        <Mail size={16} color={colors.textSecondary} />
                        <Text style={styles.contactText}>{email || "No Email"}</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Phone size={16} color={colors.textSecondary} />
                        <Text style={styles.contactText}>{phone || "No Phone"}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden'
    },
    topDecoration: {
        height: 8,
        width: '100%'
    },
    contentContainer: {
        padding: 20
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    photoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: colors.background,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20
    },
    photo: {
        width: 74,
        height: 74,
        borderRadius: 37
    },
    placeholderPhoto: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoCol: {
        flex: 1,
        justifyContent: 'center'
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4
    },
    badge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 6
    },
    badgeText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 12
    },
    department: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500'
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16
    },
    contactContainer: {
        gap: 8
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    contactText: {
        fontSize: 14,
        color: colors.textSecondary
    }
});

export default IdentityCard;
