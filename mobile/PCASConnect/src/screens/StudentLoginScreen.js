import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { colors } from '../constants/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { loginUser } from '../api/auth';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const StudentLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // 1. Call the API
      const data = await loginUser('student', email, password);
      
      console.log("Server Response:", data);

      // 2. Check if login failed based on message
      // Note: Your backend sends 200 OK even for "Login successful", so we check the message string
      if (data.message !== "Login successful") {
        Alert.alert("Login Failed", data.message || "Unknown error");
        setLoading(false);
        return;
      }

      // 3. Save User Data
      // YOUR BACKEND DOES NOT SEND A TOKEN. So we only save the user info.
      await AsyncStorage.setItem("student", JSON.stringify(data));

      // 4. Navigate to Dashboard
      navigation.replace("StudentDashboard", { userData: data });

    } catch (error) {
      console.log("Login Error Object:", error);
      
      // Safer error handling to prevent "Property data doesn't exist" crashes
      if (error.response && error.response.data) {
        Alert.alert("Login Failed", JSON.stringify(error.response.data));
      } else {
        Alert.alert("Login Failed", "Network error or server is down.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.textPrimary} size={24} />
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.brandTitle}>PCAS Connect</Text>
          <Text style={styles.screenTitle}>Login as Student</Text>
          <Text style={styles.subtitle}>Please sign in to access your app.</Text>

          <View style={styles.inputs}>
            <CustomInput 
              placeholder="Student Email" 
              value={email} 
              setValue={setEmail}
              keyboardType="email-address"
            />
            <CustomInput 
              placeholder="Password" 
              value={password} 
              setValue={setPassword}
              isPassword={true}
            />
          </View>

          <CustomButton 
            text="Login" 
            onPress={handleLogin} 
            isLoading={loading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Forget Password?.</Text>
            
             <Text style={styles.footerText}>Don't have an account? Contact Admin.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  header: { padding: 30, marginTop: 30 },
  formContainer: { flex: 1, padding: 24, justifyContent: 'center', marginBottom: 50 },
  brandTitle: { fontSize: 20, fontWeight: '600', color: colors.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  screenTitle: { fontSize: 32, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 30 },
  inputs: { marginBottom: 20 },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { color: colors.textSecondary, fontSize: 14 }
});

export default StudentLoginScreen;