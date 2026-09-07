import React, { useState , useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import API from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardAvoidingWrapper from '../../components/KeyboardAvoidingWrapper';

// ── Specialty List ──
const SPECIALTIES = [
  'Allergist',
  'Anesthesiologist',
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Family Medicine',
  'Gastroenterologist',
  'General Physician',
  'Geriatrician',
  'Gynecologist',
  'Hematologist',
  'Immunologist',
  'Infectious Disease',
  'Internal Medicine',
  'Nephrologist',
  'Neurologist',
  'Obstetrician',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedic',
  'Otolaryngologist (ENT)',
  'Pathologist',
  'Pediatrician',
  'Physiatrist',
  'Plastic Surgeon',
  'Podiatrist',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Rheumatologist',
  'Surgeon',
  'Urologist',
];

const AddDoctorScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  // Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [about, setAbout] = useState('');

  // Modal visibility
  const [specialtyModalVisible, setSpecialtyModalVisible] = useState(false);

  // ── Fetch Clinic Profile to auto-fill hospital name ──
  useEffect(() => {
    const fetchClinicProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await API.get('/clinic/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && response.data.clinic?.name) {
          setHospitalName(response.data.clinic.name);
        }
      } catch (error) {
        console.log('Error fetching clinic profile:', error);
      }
    };
    fetchClinicProfile();
  }, []);

  // ── Create Doctor ──
  const handleCreateDoctor = async () => {
    if (!name || !email || !password) {
      showAlert('Error', 'Please fill required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await API.post(
        '/clinic/doctors',
        {
          name,
          email,
          password,
          specialty,
          qualification,
          experience,
          consultationFee: Number(consultationFee),
          hospitalName,
          about,
          // timing and workingDays are omitted – they will use defaults on the backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showAlert('Success', 'Doctor created successfully');
        navigation.goBack();
        navigation.getParent()?.setParams({ refresh: Date.now() });
      }
    } catch (error: any) {
      console.log(error);
      showAlert('Error', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingWrapper>
    <ScrollView style={styles.container}  contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}  keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Add Doctor</Text>

      {/* ── Basic Info ── */}
      <Text style={styles.sectionTitle}>Basic Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Doctor Name *"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email *"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password *"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* ── Specialty (Dropdown) ── */}
      <Text style={styles.label}>Specialty</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setSpecialtyModalVisible(true)}
      >
        <Text style={specialty ? styles.dropdownText : styles.dropdownPlaceholder}>
          {specialty || 'Select Specialty'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {/* Specialty Modal */}
      <Modal
        visible={specialtyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSpecialtyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Specialty</Text>
            <FlatList
              data={SPECIALTIES}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.specialtyItem,
                    specialty === item && styles.specialtyItemSelected,
                  ]}
                  onPress={() => {
                    setSpecialty(item);
                    setSpecialtyModalVisible(false);
                  }}
                >
                  <Text style={styles.specialtyItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setSpecialtyModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.input}
        placeholder="Qualification"
        placeholderTextColor="#888"
        value={qualification}
        onChangeText={setQualification}
      />

      <TextInput
        style={styles.input}
        placeholder="Experience (Years)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={experience}
        onChangeText={setExperience}
      />

      <TextInput
        style={styles.input}
        placeholder="Consultation Fee"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={consultationFee}
        onChangeText={setConsultationFee}
      />

      <TextInput
        style={styles.input}
        placeholder="Hospital / Clinic Name"
        placeholderTextColor="#888"
        value={hospitalName}
        onChangeText={setHospitalName}
        editable={false} 
      />

      <TextInput
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
        multiline
        placeholder="About Doctor"
        placeholderTextColor="#888"
        value={about}
        onChangeText={setAbout}
      />

      {/* ── Create Button ── */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateDoctor}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Doctor</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingWrapper>
  );
};

export default AddDoctorScreen;

// ── Styles ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 25,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D62828',
    marginBottom: 15,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6B6B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    color: '#1A1A1A',
    marginBottom: 15,
  },
  dropdownButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#1A1A1A',
    fontSize: 15,
  },
  dropdownPlaceholder: {
    color: '#9B9B9B',
    fontSize: 15,
  },
  dropdownArrow: {
    color: '#9B9B9B',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  specialtyItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  specialtyItemSelected: {
    backgroundColor: 'rgba(214, 40, 40, 0.08)',
    borderRadius: 8,
  },
  specialtyItemText: {
    color: '#1A1A1A',
    fontSize: 15,
  },
  closeModalBtn: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeModalText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#D62828',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});