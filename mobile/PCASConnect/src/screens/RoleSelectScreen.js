import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, Briefcase, ShieldCheck } from 'lucide-react-native';

const collegeLogoImg = require('../../assets/college_logo.png');

const CustomButton = ({ text, onPress, icon, gradient }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.button}
    >
      <View style={styles.buttonIcon}>{icon}</View>
      <Text style={styles.buttonText}>{text}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const RoleSelectScreen = ({ navigation }) => {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.backgroundGradient}
      />
      
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />
      
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoGlow} />
              <Image 
                source={collegeLogoImg} 
                style={styles.logo} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>PCAS Connect</Text>
            <Text style={styles.tagline}>Your Gateway to Excellence</Text>
          </View>
        
          {/* Instruction Text */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Select your role to continue</Text>
          </View>
          
          {/* Button Section */}
          <View style={styles.buttonContainer}>
            <CustomButton 
              text="Student Login" 
              onPress={() => navigation?.navigate('StudentLogin')}
              icon={<GraduationCap color="white" size={24} />}
              gradient={['#667eea', '#764ba2']}
            />
            
            <CustomButton 
              text="Teacher Login" 
              onPress={() => navigation?.navigate('TeacherLogin')}
              icon={<Briefcase color="white" size={24} />}
              gradient={['#f093fb', '#f5576c']}
            />

            <CustomButton 
              text="Admin Login" 
              onPress={() => navigation?.navigate('AdminLogin')}
              icon={<ShieldCheck color="white" size={24} />}
              gradient={['#4facfe', '#00f2fe']}
            />
          </View>

          {/* Footer */}
          <Text style={styles.footer}>Secure & Reliable Access</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
    backgroundColor: 'white',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height * 0.4,
    right: -30,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: -10,
    left: -10,
  },
  logo: {
    width: 180, 
    height: 180,
    borderRadius: 90,
    backgroundColor: 'white',
    padding: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  instructionContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.95,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 20,
  },
});

export default RoleSelectScreen;