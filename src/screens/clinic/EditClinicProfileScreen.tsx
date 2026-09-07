import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditClinicProfileScreen = ({ route, navigation }: any) => {
  const clinicFromParams = route?.params?.clinic;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');

  useEffect(() => {
    if (clinicFromParams) {
      setName(clinicFromParams.name || '');
      setPhone(clinicFromParams.phone || '');
      setAddress(clinicFromParams.address || '');
      setAbout(clinicFromParams.about || '');
    } else {
      fetchClinicProfile();
    }
  }, []);

  const fetchClinicProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await API.get('/clinic/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const clinic = response.data.clinic;
        setName(clinic.name || '');
        setPhone(clinic.phone || '');
        setAddress(clinic.address || '');
        setAbout(clinic.about || '');
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
      showAlert('Error', 'Failed to load profile data');
    }
  };

  const handleSave = async () => {
    // ── 1. Trim all inputs ──
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const trimmedAbout = about.trim();

    // ── 2. Name validation ──
    if (!trimmedName) {
      showAlert('Error', 'Clinic name is required');
      return;
    }
    if (trimmedName.length < 2) {
      showAlert('Error', 'Clinic name must be at least 2 characters');
      return;
    }

    // ── 3. Phone validation (10 digits) ──
    if (!trimmedPhone) {
      showAlert('Error', 'Phone number is required');
      return;
    }
    const phoneDigits = trimmedPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      showAlert('Error', 'Phone number must be exactly 10 digits');
      return;
    }

    // ── 4. Address validation ──
    if (!trimmedAddress) {
      showAlert('Error', 'Address is required');
      return;
    }
    if (trimmedAddress.length < 5) {
      showAlert('Error', 'Address must be at least 5 characters');
      return;
    }

    // ── 5. About validation (optional, but limit length) ──
    if (trimmedAbout.length > 500) {
      showAlert('Error', 'About section cannot exceed 500 characters');
      return;
    }

    // ── 6. Proceed with API call ──
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await API.put(
        '/clinic/profile',
        {
          name: trimmedName,
          phone: trimmedPhone,
          address: trimmedAddress,
          about: trimmedAbout,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showAlert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        showAlert('Error', response.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.log('❌ Update error:', error?.response?.data || error);
      showAlert('Error', error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !name) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#D62828" />
        <Text style={{ color: '#8A8A8A', marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Fixed Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── KeyboardAvoidingView with ScrollView ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Clinic Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Clinic Name"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
            placeholder="Phone Number"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>About</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={about}
            onChangeText={setAbout}
            placeholder="About the clinic"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{about.length}/500</Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditClinicProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 30,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#6B6B6B',
    marginTop: -12,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#D62828',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});