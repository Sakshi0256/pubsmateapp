import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';

const DoctorEditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctor } = route.params as any;

  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(doctor?.phone || '');
  const [email, setEmail] = useState(doctor?.email || '');
  const [qualification, setQualification] = useState(doctor?.qualification || '');

  const handleSave = async () => {
    if (!email.trim()) {
      global.showError('Email is required');
      return;
    }
    if (!phone.trim()) {
      global.showError('Phone number is required');
      return;
    }
    // Validate phone number (10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      global.showError('Phone number must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        phone: phone.trim(),
        email: email.trim(),
        qualification: qualification.trim(),
      };
      await API.patch(`/doctors/profile/${doctor._id}`, payload);
      global.showSuccess('Profile updated successfully');
      navigation.goBack();
    } catch (error: any) {
      global.showError(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Email */}
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email"
          placeholderTextColor="#888"
        />

        {/* Phone */}
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="10-digit phone number"
          placeholderTextColor="#888"
        />

        {/* Qualification */}
        <Text style={styles.label}>Qualification</Text>
        <TextInput
          style={styles.input}
          value={qualification}
          onChangeText={setQualification}
          placeholder="e.g., MBBS, MD"
          placeholderTextColor="#888"
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorEditProfileScreen;

// ── Styles ──
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6B6B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
    color: '#1A1A1A',
  },
  saveButton: {
    backgroundColor: '#D62828',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonDisabled: { opacity: 0.7 },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});