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
  Image,        // add
  Dimensions,   // add
} from 'react-native';

import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');   // add
const logo = require('../../assets/images/logo.png');       // add — path adjust karo agar folder alag hai

const SignupScreen = ({
  route,
  navigation,
}: any) => {
  const role =
    route?.params?.role || 'patient';

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [specialty, setSpecialty] =
    useState('');

  const [address, setAddress] = useState('');

  const [qualification, setQualification] =
    useState('');

  const [experience, setExperience] =
    useState('');

  const [consultationFee, setConsultationFee] =
    useState('');

  const [hospitalName, setHospitalName] =
    useState('');

  const [about, setAbout] =
    useState('');


  const BASE_URL =
    'https://pubsmate-backend.vercel.app//api/v1';

  const handleSignup = async () => {
    try {

      if (
        role === 'doctor' &&
        (
          !specialty ||
          !qualification ||
          !experience ||
          !consultationFee ||
          !hospitalName ||
          !about
        )
      ) {
        Alert.alert(
          'Error',
          'Please fill all fields',
        );
        return;
      }

      if (role === 'clinic' && !address) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      const response =
        await axios.post(
          `${BASE_URL}/auth/signup`,
          {
            name,
            email,
            password,
            role,
            address,
            specialty,
            qualification,
            experience,

            consultationFee:
              Number(
                consultationFee,
              ),

            hospitalName,
            about,
          }
        );

      Alert.alert(
        'Success',
        response.data.message,
      );

      navigation.replace(
        'Login',
        { role },
      );

    } catch (error: any) {
      console.log('Signup error:', error?.response?.data || error.message);
      Alert.alert(
        'Signup Failed',
        error?.response?.data?.message || error.message || 'Something went wrong',
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }>
  <Image source={logo} style={styles.logo} resizeMode="contain" />   

        <Text style={styles.heading}>
          Create Account
        </Text>

        <Text style={styles.subHeading}>
          Join as{' '}
          {role
            .charAt(0)
            .toUpperCase() +
            role.slice(1)}
        </Text>


        <View style={styles.card}>

          <View style={styles.roleBadge}>
            <Text
              style={
                styles.roleBadgeText
              }>
              {role
                .charAt(0)
                .toUpperCase() +
                role.slice(1)}
            </Text>
          </View>

          <TextInput
            placeholder="Clinic Name"
            placeholderTextColor="#8F9B95"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#8F9B95"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          {role === 'clinic' && (
            <TextInput
              placeholder="Clinic Address"
              placeholderTextColor="#8F9B95"
              style={styles.input}
              value={address}
              onChangeText={setAddress}
            />
          )}
          <TextInput
            placeholder="Password"
            placeholderTextColor="#8F9B95"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={
              setPassword
            }
          />


          {role === 'doctor' && (
            <>
              <TextInput
                placeholder="Specialty"
                placeholderTextColor="#8F9B95"
                style={styles.input}
                value={specialty}
                onChangeText={setSpecialty}
              />

              <TextInput
                placeholder="Qualification"
                placeholderTextColor="#8F9B95"
                style={styles.input}
                value={qualification}
                onChangeText={setQualification}
              />

              <TextInput
                placeholder="Experience (Years)"
                placeholderTextColor="#8F9B95"
                style={styles.input}
                value={experience}
                onChangeText={setExperience}
              />

              <TextInput
                placeholder="Consultation Fee"
                placeholderTextColor="#8F9B95"
                keyboardType="numeric"
                style={styles.input}
                value={consultationFee}
                onChangeText={setConsultationFee}
              />

              <TextInput
                placeholder="Hospital Name"
                placeholderTextColor="#8F9B95"
                style={styles.input}
                value={hospitalName}
                onChangeText={setHospitalName}
              />

              <TextInput
                placeholder="About Doctor"
                placeholderTextColor="#8F9B95"
                multiline
                style={[
                  styles.input,
                  {
                    height: 100,
                    textAlignVertical: 'top',
                  },
                ]}
                value={about}
                onChangeText={setAbout}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={
              handleSignup
            }>

            <Text
              style={
                styles.buttonText
              }>
              Create Account
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'Login',
                { role },
              )
            }>

            <Text
              style={
                styles.loginText
              }>
              Already have an
              account? Login
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    marginBottom: 32,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 24,
    padding: 20,
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

  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#1A1A1A',
    marginBottom: 14,
  },

  button: {
    backgroundColor: '#E63946',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  loginText: {
    textAlign: 'center',
    color: '#E63946',
    marginTop: 18,
    fontWeight: '600',
    fontSize: 13,
  },
});