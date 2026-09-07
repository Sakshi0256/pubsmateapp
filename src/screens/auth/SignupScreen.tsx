import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const logo = require('../../assets/images/logo.png');

const SignupScreen = ({ route, navigation }: any) => {
  const role = route?.params?.role || 'patient';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [about, setAbout] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = 'https://pubsmate-backend.vercel.app//api/v1';

  const handleSignup = async () => {
    // Basic validation
    if (!name || !email || !password) {
      showAlert('Error', 'Name, Email and Password are required');
      return;
    }

    if (role === 'doctor' && (!specialty || !qualification || !experience || !consultationFee || !hospitalName || !about)) {
      showAlert('Error', 'Please fill all doctor fields');
      return;
    }

    // For clinic, address is required (already covered below)
    if (role === 'clinic' && !address) {
      showAlert('Error', 'Please fill clinic address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        name,
        email,
        password,
        role,
        address,
        city,
        pincode,
        specialty,
        qualification,
        experience,
        consultationFee: Number(consultationFee),
        hospitalName,
        about,
      });

      showAlert('Success', response.data.message);
      navigation.replace('Login', { role });
    } catch (error: any) {
      console.log('Signup error:', error?.response?.data || error.message);
      showAlert(
        'Signup Failed',
        error?.response?.data?.message || error.message || 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subHeading}>
          Join as {role.charAt(0).toUpperCase() + role.slice(1)}
        </Text>

        {/* Role badge */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Text>
        </View>

        {/* ---- Common fields ---- */}
        <Text style={styles.outsideLabel}>
          {role === 'clinic' ? 'Clinic Name' : 'Full Name'}
        </Text>
        <View style={styles.fieldCard}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder=""
          />
        </View>

        <Text style={styles.outsideLabel}>Email Address</Text>
        <View style={styles.fieldCard}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder=""
          />
        </View>

        <Text style={styles.outsideLabel}>Password</Text>
        <View style={styles.fieldCard}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder=""
          />
        </View>

        {/* ── Address, City, Pincode ── */}
        <Text style={styles.outsideLabel}>Address</Text>
        <View style={styles.fieldCard}>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder=""
          />
        </View>

        <Text style={styles.outsideLabel}>City</Text>
        <View style={styles.fieldCard}>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder=""
          />
        </View>

        <Text style={styles.outsideLabel}>Pincode</Text>
        <View style={styles.fieldCard}>
          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            placeholder=""
          />
        </View>

        {/* ---- Doctor-specific fields ---- */}
        {role === 'doctor' && (
          <>
            <Text style={styles.outsideLabel}>Specialty</Text>
            <View style={styles.fieldCard}>
              <TextInput
                style={styles.input}
                value={specialty}
                onChangeText={setSpecialty}
                placeholder=""
              />
            </View>

            <Text style={styles.outsideLabel}>Qualification</Text>
            <View style={styles.fieldCard}>
              <TextInput
                style={styles.input}
                value={qualification}
                onChangeText={setQualification}
                placeholder=""
              />
            </View>

            <Text style={styles.outsideLabel}>Experience (Years)</Text>
            <View style={styles.fieldCard}>
              <TextInput
                style={styles.input}
                value={experience}
                onChangeText={setExperience}
                keyboardType="numeric"
                placeholder=""
              />
            </View>

            <Text style={styles.outsideLabel}>Consultation Fee</Text>
            <View style={styles.fieldCard}>
              <TextInput
                style={styles.input}
                value={consultationFee}
                onChangeText={setConsultationFee}
                keyboardType="numeric"
                placeholder=""
              />
            </View>

            <Text style={styles.outsideLabel}>Hospital Name</Text>
            <View style={styles.fieldCard}>
              <TextInput
                style={styles.input}
                value={hospitalName}
                onChangeText={setHospitalName}
                placeholder=""
              />
            </View>

            <Text style={styles.outsideLabel}>About Doctor</Text>
            <View style={[styles.fieldCard, styles.multilineCard]}>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={about}
                onChangeText={setAbout}
                multiline
                placeholder=""
              />
            </View>
          </>
        )}

        {/* Signup Button with Loader */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;

// ── Styles (unchanged) ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logo: {
    width: SCREEN_WIDTH * 0.6,
    height: (SCREEN_WIDTH * 0.5) / 1.62,
    alignSelf: 'center',
    marginBottom: 20,
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
    marginBottom: 24,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E63946',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  outsideLabel: {
    color: '#6B6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  multilineCard: {
    paddingVertical: 10,
    minHeight: 120,
  },
  input: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#E63946',
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 6,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  loginText: {
    textAlign: 'center',
    color: '#E63946',
    marginTop: 18,
    fontWeight: '600',
    fontSize: 14,
  },
});