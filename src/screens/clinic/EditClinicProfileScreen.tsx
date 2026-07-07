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
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Clinic name is required');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await API.put(
        '/clinic/profile',
        { name, phone, address, about },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.log('❌ Update error:', error?.response?.data || error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !name) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator size="large" color="#D62828" />
        <Text style={{ color: '#888', marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Clinic Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Clinic Name"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
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
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditClinicProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    // ✅ Increased top padding for all phones
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 0) + 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    // ✅ Extra top margin for header
    marginTop: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#B3B3B3',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#151515',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    fontSize: 15,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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