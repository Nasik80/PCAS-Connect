import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Dimensions, Animated, TouchableOpacity
} from 'react-native';
import { colors } from '../constants/colors';
import CustomInput from '../components/CustomInput';
import { adminLogin } from '../services/adminApi';
import { ArrowLeft, User, Lock, LogIn, ShieldCheck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const AdminLoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true })
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Required", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(username, password);
      await AsyncStorage.setItem("adminUser", JSON.stringify(data));
      navigation.replace("AdminDashboard");

    } catch (error) {
      Alert.alert("Access Denied", "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.textPrimary, '#334155']} // Darker theme for Admin
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>System Admin</Text>
              <Text style={styles.headerSubtitle}>Management Console</Text>
            </View>
          </View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.formContent}>
              <View style={styles.iconHeader}>
                <View style={styles.iconCircle}>
                  <ShieldCheck size={32} color={colors.textPrimary} />
                </View>
              </View>

              <Text style={styles.formTitle}>Admin Access</Text>
              <Text style={styles.formSubtitle}>Secure login required</Text>

              <View style={styles.inputs}>
                <View style={styles.inputWrapper}>
                  <CustomInput
                    placeholder="Admin Username"
                    value={username}
                    setValue={setUsername}
                    icon={<User size={20} color={colors.textLight} />}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <CustomInput
                    placeholder="Password"
                    value={password}
                    setValue={setPassword}
                    secureTextEntry={true} // Using consistent prop name handling if wrapper supports it or passing down
                    isPassword={true} // Fallback if CustomInput uses specific prop
                    icon={<Lock size={20} color={colors.textLight} />}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: colors.textPrimary }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <Text style={styles.loginBtnText}>Authenticating...</Text>
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Access Dashboard</Text>
                    <LogIn color="white" size={18} style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Authorized Personnel Only</Text>
              </View>
            </View>
          </Animated.View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBackground: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30
  },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },

  header: { padding: 24, paddingTop: 10, height: '30%', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerContent: { marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#94A3B8', fontWeight: '500' },

  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  formContent: { flex: 1 },

  iconHeader: { alignItems: 'center', marginBottom: 20, marginTop: -60 },
  iconCircle: {
    width: 80, height: 80, backgroundColor: 'white', borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.textPrimary, shadowOffset: { height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },

  formTitle: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  formSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 32, textAlign: 'center' },

  inputs: { gap: 16, marginBottom: 32 },
  inputWrapper: {},

  loginBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  footer: { marginTop: 'auto', marginBottom: 30, alignItems: 'center' },
  footerText: { color: colors.textLight, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }
});

export default AdminLoginScreen;
