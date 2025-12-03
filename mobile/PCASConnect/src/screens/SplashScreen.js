import React, { useEffect, useRef } from 'react';
// Ensure 'Image' is imported from react-native
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

// 1. Import the local image file
const collegeLogoImg = require('../../assets/college_logo.png');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('RoleSelect');
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* 2. Replaced Placeholder View with Image Component */}
        <Image 
           source={collegeLogoImg}
           style={styles.logoImage}
           // "contain" ensures the whole logo fits in the box without stretching
           resizeMode="contain" 
        />
        
        <Text style={styles.title}>PCAS Connect</Text>
        <Text style={styles.subtitle}>Presentation College of Applied Sciences</Text>
        
        <View style={styles.loadingContainer}>
           <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20, 
  },
  // 3. Added new style for the image
  logoImage: {
    width: 200,  // You might need to increase/decrease this
    height: 200, // You might need to increase/decrease this
    marginBottom: 20,
  },
  // REPLACED logoPlaceholder and logoText styles
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 50,
  },
  loadingText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  }
});

export default SplashScreen;