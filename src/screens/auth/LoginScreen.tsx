import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const logo = require('../../assets/images/logo.png');

const LoginScreen = ({ navigation, route }: any) => {
  const selectedRole = route?.params?.role || 'patient';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }

      const response = await API.post('/auth/login', {
        email,
        password,
        role: selectedRole,
      });
      console.log('🔐 Login Response:', response.data);
      const data = response.data;

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      global.authToken = data.token;
      const savedToken = await AsyncStorage.getItem('token');
      console.log('💾 Token saved in AsyncStorage:', savedToken);

      if (data.user.role === 'patient') {
        navigation.replace('PatientTabs');
      } else if (data.user.role === 'doctor') {
        navigation.replace('DoctorTabs');
      } else if (data.user.role === 'clinic') {
        navigation.replace('ClinicTabs');
      }
    } catch (error: any) {
      console.log('FULL ERROR =>', error);
      console.log('RESPONSE =>', error?.response?.data);
      console.log('MESSAGE =>', error?.message);

      Alert.alert(
        'Login Failed',
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      );
    }
  };

  const roleIcons: Record<string, string> = {
    doctor: 'medical-outline',
    clinic: 'business-outline',
    patient: 'person-outline',
  };

  const roleLabel: Record<string, string> = {
    doctor: 'Doctor Login',
    clinic: 'Clinic Login',
    patient: 'Patient Login',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>

          <Image source={logo} style={styles.logo} resizeMode="contain" />

          {/* HEADER */}
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subHeading}>
            Sign in to your healthcare workspace
          </Text>

          {/* ROLE BADGE */}
          <View style={styles.roleBadgeCard}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={roleIcons[selectedRole] || 'person-outline'}
                size={24}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleLabel}>Signing in as</Text>
              <Text style={styles.roleValue}>
                {roleLabel[selectedRole] || 'Patient'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('RoleSelection')}
              style={styles.changeRoleBtn}>
              <Text style={styles.changeRoleText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* EMAIL FIELD */}
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#3D5249"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* PASSWORD FIELD */}
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#3D5249"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                style={styles.eyeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9B7474"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* FORGOT PASSWORD */}
          {/* <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity> */}

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* SIGN UP LINK - hidden for Doctor role */}
          {selectedRole !== 'doctor' && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Signup', { role: selectedRole })
              }>
              <Text style={styles.signupText}>
                Don't have an account?{' '}
                <Text style={styles.signupHighlight}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContainer: {
    flexGrow: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  heading: {
    color: '#1A1A1A',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },

  subHeading: {
    color: '#6B6B6B',
    fontSize: 15,
    marginBottom: 32,
  },

  roleBadgeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
  },

  roleTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  roleLabel: {
    color: '#6B6B6B',
    fontSize: 12,
    marginBottom: 2,
  },

  roleValue: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
  },

  logo: {
    width: SCREEN_WIDTH * 0.6,
    height: (SCREEN_WIDTH * 0.5) / 1.62,
    alignSelf: 'center',
    marginBottom: 20,
  },

  changeRoleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E63946',
  },

  changeRoleText: {
    color: '#E63946',
    fontSize: 13,
    fontWeight: '600',
  },

  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  fieldLabel: {
    color: '#6B6B6B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  input: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
  },

  eyeButton: {
    paddingLeft: 10,
  },

  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 28,
    marginTop: 4,
  },

  forgotText: {
    color: '#E63946',
    fontSize: 13,
    fontWeight: '600',
  },

  loginButton: {
    backgroundColor: '#E63946',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 20,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  signupText: {
    textAlign: 'center',
    color: '#6B6B6B',
    fontSize: 14,
    fontWeight: '500',
  },

  signupHighlight: {
    color: '#E63946',
    fontWeight: '700',
  },
});