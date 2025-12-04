import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { colors } from '../constants/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { adminLogin } from '../services/adminApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminLoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(username, password);
      
      // Save session
      await AsyncStorage.setItem("adminUser", JSON.stringify(data));
      
      // Navigate to Admin Dashboard (We will create this next)
      navigation.replace("AdminDashboard");
      
    } catch (error) {
      Alert.alert("Login Failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>PCAS Connect Management</Text>

        <View style={styles.form}>
          <CustomInput 
            placeholder="Username" 
            value={username} 
            setValue={setUsername} 
            icon="user"
          />
          <CustomInput 
            placeholder="Password" 
            value={password} 
            setValue={setPassword} 
            secureTextEntry 
            icon="lock"
          />

          <CustomButton 
            text={loading ? "Verifying..." : "Login to Dashboard"} 
            onPress={handleLogin} 
            type="PRIMARY"
          />

          <CustomButton 
            text="Back to Role Selection" 
            onPress={() => navigation.goBack()} 
            type="TERTIARY"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 40 },
  form: { width: '100%' },
});

export default AdminLoginScreen;
