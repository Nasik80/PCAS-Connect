import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Dimensions, Animated, TouchableOpacity
} from 'react-native';
import { colors } from '../constants/colors';
import CustomInput from '../components/CustomInput';
import { loginUser } from '../api/auth';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StudentLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
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
    if (!email || !password) {
      Alert.alert("Required", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser('student', email, password);

      if (data.message !== "Login successful") {
        Alert.alert("Login Failed", data.message || "Unknown error");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("student", JSON.stringify(data));
      navigation.replace("StudentDashboard", { userData: data });

    } catch (error) {
      if (error.response && error.response.data) {
        Alert.alert("Login Failed", JSON.stringify(error.response.data));
      } else {
        Alert.alert("Connection Error", "Could not connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
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
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>Student Portal</Text>
            </View>
          </View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.formContent}>
              <Text style={styles.formTitle}>Login</Text>
              <Text style={styles.formSubtitle}>Enter your credentials to continue</Text>

              <View style={styles.inputs}>
                <View style={styles.inputWrapper}>
                  <CustomInput
                    placeholder="Student Email"
                    value={email}
                    setValue={setEmail}
                    keyboardType="email-address"
                    icon={<Mail size={20} color={colors.textLight} />} // Assuming CustomInput supports icon prop or rendering
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <CustomInput
                    placeholder="Password"
                    value={password}
                    setValue={setPassword}
                    isPassword={true}
                    icon={<Lock size={20} color={colors.textLight} />}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <Text style={styles.loginBtnText}>Verifying...</Text>
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <LogIn color="white" size={18} style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Forgot Password?</Text>
                <Text style={[styles.footerText, { color: colors.primary, fontWeight: '600' }]}>Contact Admin</Text>
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
  headerSubtitle: { fontSize: 16, color: '#E0E7FF', fontWeight: '500' },

  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  formContent: { flex: 1 },
  formTitle: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  formSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 32 },

  inputs: { gap: 16, marginBottom: 32 },
  inputWrapper: {}, // Optional wrapper if margins needed

  loginBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  footer: { marginTop: 'auto', marginBottom: 30, alignItems: 'center' },
  footerText: { color: colors.textSecondary, fontSize: 14, marginBottom: 8 }
});

export default StudentLoginScreen;