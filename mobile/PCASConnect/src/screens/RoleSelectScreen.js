import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Image, Dimensions } from 'react-native';
import { colors } from '../constants/colors';
import CustomButton from '../components/CustomButton';
import { GraduationCap, Briefcase, ShieldCheck } from 'lucide-react-native';

// 1. Import the logo
const collegeLogoImg = require('../../assets/college_logo.png');

const RoleSelectScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.content}>
        
        {/* 2. Top Section with Big Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={collegeLogoImg} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.appName}>PCAS Connect</Text>
          
        </View>
      
        <Text style={styles.instructionText}>Select your role to login </Text>
        
        {/* 3. Button Section */}
        <View style={styles.buttonContainer}>
          <CustomButton 
            text="Student Login" 
            onPress={() => navigation.navigate('StudentLogin')}
            icon={<GraduationCap color="white" size={24} />}
          />
          
          <CustomButton 
            text="Teacher Login" 
            onPress={() => navigation.navigate('TeacherLogin')}
            icon={<Briefcase color="white" size={24} />}
          />

          <CustomButton 
            text="Admin Login" 
            onPress={() => navigation.navigate('AdminLogin')}
            icon={<ShieldCheck color="white" size={24} />}
          />
        </View>

      </View>
    </SafeAreaView>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    // Align content nicely
    justifyContent: 'space-evenly', 
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  logo: {
    // Large size as requested
    width: 180, 
    height: 180,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  textContainer: {
    color: colors.textSecondary,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    paddingBottom: 40, // Add some space at bottom
  }
});

export default RoleSelectScreen;