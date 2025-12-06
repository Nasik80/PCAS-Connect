import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

const collegeLogoImg = require('../../assets/college_logo.png');
const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animation Values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const bgScale = useRef(new Animated.Value(1.2)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // 1. Background settles in
      Animated.timing(bgScale, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      // 2. Logo appears with pop effect
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 3. Text slides up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigate away
    const timer = setTimeout(() => {
      // Exit animation
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        navigation.replace('RoleSelect');
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Dynamic Background */}
      <Animated.View style={[styles.bgContainer, { transform: [{ scale: bgScale }] }]}>
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Decor Circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
      </Animated.View>

      <View style={styles.contentContainer}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] }
          ]}
        >
          <View style={styles.logoShadow}>
            <View style={styles.logoCircle}>
              <Image
                source={collegeLogoImg}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
        </Animated.View>

        {/* Text Section */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: titleOpacity, transform: [{ translateY: slideUp }] }
          ]}
        >
          <Text style={styles.appName}>PCAS CONNECT</Text>
          <Text style={styles.tagline}>Presentation College of Applied Sciences</Text>
          <View style={styles.loadingBar}>
            <View style={styles.loadingProgress} />
          </View>
        </Animated.View>
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 500,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    right: -width * 0.4,
  },
  circle2: {
    width: width,
    height: width,
    bottom: -width * 0.2,
    left: -width * 0.2,
  },
  contentContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 25,
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  logo: {
    width: 140,
    height: 140,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.surface,
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 30,
  },
  loadingBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '40%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  }
});

export default SplashScreen;