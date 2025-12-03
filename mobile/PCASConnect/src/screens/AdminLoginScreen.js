import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../constants/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { loginUser } from '../api/auth';
import { ArrowLeft } from 'lucide-react-native';

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if(!email || !password) return;
    setLoading(true);
    try {
      await loginUser('admin', email, password);
      alert("Admin Login API Called");
    } catch (error) {
      alert("Login Failed");
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
          <Text style={styles.screenTitle}>Login as Admin</Text>
          <Text style={styles.subtitle}>Secure administrative access.</Text>

          <View style={styles.inputs}>
            <CustomInput 
              placeholder="Admin Email" 
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
            text="Secure Login" 
            onPress={handleLogin} 
            isLoading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 30,
    marginTop: 30,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    marginBottom: 50,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  inputs: {
    marginBottom: 20,
  }
});

export default AdminLoginScreen;