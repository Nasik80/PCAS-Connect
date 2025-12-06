import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Image, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, Briefcase, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/colors';

const collegeLogoImg = require('../../assets/college_logo.png');

const RoleCard = ({ title, subtitle, icon, onPress, color, delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      delay: delay,
      useNativeDriver: true,
    }).start();

    Animated.spring(scale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          {React.cloneElement(icon, { color: color, size: 28 })}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.arrowBox, { backgroundColor: `${color}10` }]}>
          <ChevronRight color={color} size={20} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RoleSelectScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={collegeLogoImg}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.appName}>PCAS Connect</Text>
            </View>
          </View>

          <View style={styles.instructionContainer}>
            <Text style={styles.sectionTitle}>Choose your role</Text>
            <Text style={styles.sectionSubtitle}>Select how you want to sign in</Text>
          </View>

          <View style={styles.cardsContainer}>
            <RoleCard
              title="Student"
              subtitle="Access timetable & attendance"
              icon={<GraduationCap />}
              color={colors.primary}
              delay={300}
              onPress={() => navigation.navigate('StudentLogin')}
            />

            <RoleCard
              title="Teacher"
              subtitle="Manage classes & students"
              icon={<Briefcase />}
              color={colors.secondary}
              delay={450}
              onPress={() => navigation.navigate('TeacherLogin')}
            />

            <RoleCard
              title="Administrator"
              subtitle="System management & reports"
              icon={<ShieldCheck />}
              color={colors.accent}
              delay={600}
              onPress={() => navigation.navigate('AdminLogin')}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Secure Access • v1.0.0</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  appName: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  instructionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  arrowBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  }
});

export default RoleSelectScreen;