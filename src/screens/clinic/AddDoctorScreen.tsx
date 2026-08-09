import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import API from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Timing Fields
  const [morningStart, setMorningStart] = useState('09:00');
  const [morningEnd, setMorningEnd] = useState('12:00');
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningStart, setEveningStart] = useState('16:00');
  const [eveningEnd, setEveningEnd] = useState('20:00');
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [slotDuration, setSlotDuration] = useState('15');
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [breakEnabled, setBreakEnabled] = useState(true);
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5, 6]);

  // ── Fetch Clinic Profile to auto-fill hospital name ──
  useEffect(() => {
    const fetchClinicProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await API.get('/clinic/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && response.data.clinic?.hospitalName) {
          setHospitalName(response.data.clinic.hospitalName);
        }
      } catch (error) {
        console.log('Error fetching clinic profile:', error);
      }
    };
    fetchClinicProfile();
  }, []);

  // ── Create Doctor ──
  // const handleCreateDoctor = async () => {
  //   if (!name || !email || !password) {
  //     Alert.alert('Error', 'Please fill required fields');
  //     return;
  //   }

  //    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(email)) {
  //     Alert.alert('Error', 'Please enter a valid email address');
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const response = await API.post('/auth/signup', {
  //       name,
  //       email,
  //       password,
  //       role: 'doctor',
  //       specialty,
  //       qualification,
  //       experience,
  //       consultationFee: Number(consultationFee),
  //       hospitalName,
  //       about,
  //       timing: {
  //         morning: {
  //           start: morningStart,
  //           end: morningEnd,
  //           enabled: morningEnabled,
  //         },
  //         evening: {
  //           start: eveningStart,
  //           end: eveningEnd,
  //           enabled: eveningEnabled,
  //         },
  //         slotDuration: Number(slotDuration),
  //         break: {
  //           start: breakStart,
  //           end: breakEnd,
  //           enabled: breakEnabled,
  //         },
  //       },
  //       workingDays: workingDays,
  //     });

  //     if (response.data.success) {
  //       Alert.alert('Success', 'Doctor created successfully');
  //       navigation.goBack();
  //       navigation.getParent()?.setParams({ refresh: Date.now() });
  //     }
  //   } catch (error: any) {
  //     console.log(error);
  //     Alert.alert('Error', error?.response?.data?.message || 'Something went wrong');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCreateDoctor = async () => {
  if (!name || !email || !password) {
    Alert.alert('Error', 'Please fill required fields');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');   // add

    const response = await API.post(
      '/clinic/doctors',                                  // changed from /auth/signup
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
        timing: {
          morning: { start: morningStart, end: morningEnd, enabled: morningEnabled },
          evening: { start: eveningStart, end: eveningEnd, enabled: eveningEnabled },
          slotDuration: Number(slotDuration),
          break: { start: breakStart, end: breakEnd, enabled: breakEnabled },
        },
        workingDays: workingDays,
      },
      { headers: { Authorization: `Bearer ${token}` } }    // add auth header
    );

    if (response.data.success) {
      Alert.alert('Success', 'Doctor created successfully');
      navigation.goBack();
      navigation.getParent()?.setParams({ refresh: Date.now() });
    }
  } catch (error: any) {
    console.log(error);
    Alert.alert('Error', error?.response?.data?.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

  const toggleWorkingDay = (day: number) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        maxLength={100} // ✅ Limit email length
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
        placeholder="Experience"
        placeholderTextColor="#888"
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

      {/* ── Hospital Name (Auto-filled) ── */}
      <Text style={styles.label}>Hospital Name</Text>
      <TextInput
        style={[styles.input, styles.autoFillInput]}
        placeholder="Hospital Name"
        placeholderTextColor="#888"
        value={hospitalName}
        onChangeText={setHospitalName}
        editable={true} // Allow edit if needed, but pre-filled
      />

      <TextInput
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
        multiline
        placeholder="About Doctor"
        placeholderTextColor="#888"
        value={about}
        onChangeText={setAbout}
      />

      {/* ── Timing Configuration ── */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Timing Configuration</Text>

      {/* Morning Shift */}
      <View style={styles.shiftContainer}>
        <View style={styles.shiftHeader}>
          <Text style={styles.shiftTitle}>Morning Shift</Text>
          <Switch
            value={morningEnabled}
            onValueChange={setMorningEnabled}
            trackColor={{ false: '#333', true: '#D62828' }}
            thumbColor={morningEnabled ? '#fff' : '#888'}
          />
        </View>
        <View style={styles.timeRow}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="Start (09:00)"
            placeholderTextColor="#888"
            value={morningStart}
            onChangeText={setMorningStart}
            editable={morningEnabled}
          />
          <Text style={styles.timeSeparator}>to</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="End (12:00)"
            placeholderTextColor="#888"
            value={morningEnd}
            onChangeText={setMorningEnd}
            editable={morningEnabled}
          />
        </View>
      </View>

      {/* Evening Shift */}
      <View style={styles.shiftContainer}>
        <View style={styles.shiftHeader}>
          <Text style={styles.shiftTitle}>Evening Shift</Text>
          <Switch
            value={eveningEnabled}
            onValueChange={setEveningEnabled}
            trackColor={{ false: '#333', true: '#D62828' }}
            thumbColor={eveningEnabled ? '#fff' : '#888'}
          />
        </View>
        <View style={styles.timeRow}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="Start (16:00)"
            placeholderTextColor="#888"
            value={eveningStart}
            onChangeText={setEveningStart}
            editable={eveningEnabled}
          />
          <Text style={styles.timeSeparator}>to</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="End (20:00)"
            placeholderTextColor="#888"
            value={eveningEnd}
            onChangeText={setEveningEnd}
            editable={eveningEnabled}
          />
        </View>
      </View>

      {/* Slot Duration */}
      <View style={styles.shiftContainer}>
        <Text style={styles.shiftTitle}>Slot Duration (minutes)</Text>
        <TextInput
          style={[styles.input, { width: '100%' }]}
          placeholder="15"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={slotDuration}
          onChangeText={setSlotDuration}
        />
      </View>

      {/* Break Time */}
      <View style={styles.shiftContainer}>
        <View style={styles.shiftHeader}>
          <Text style={styles.shiftTitle}>Break Time</Text>
          <Switch
            value={breakEnabled}
            onValueChange={setBreakEnabled}
            trackColor={{ false: '#333', true: '#D62828' }}
            thumbColor={breakEnabled ? '#fff' : '#888'}
          />
        </View>
        <View style={styles.timeRow}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="Start (13:00)"
            placeholderTextColor="#888"
            value={breakStart}
            onChangeText={setBreakStart}
            editable={breakEnabled}
          />
          <Text style={styles.timeSeparator}>to</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="End (14:00)"
            placeholderTextColor="#888"
            value={breakEnd}
            onChangeText={setBreakEnd}
            editable={breakEnabled}
          />
        </View>
      </View>

      {/* Working Days */}
      <View style={styles.shiftContainer}>
        <Text style={styles.shiftTitle}>Working Days</Text>
        <View style={styles.daysRow}>
          {dayNames.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                workingDays.includes(index) && styles.dayButtonActive,
              ]}
              onPress={() => toggleWorkingDay(index)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  workingDays.includes(index) && styles.dayButtonTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Create Button */}
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
  );
};

export default AddDoctorScreen;

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
  autoFillInput: {
    borderColor: '#D62828',
    borderWidth: 1,
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
  shiftContainer: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shiftTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  timeSeparator: {
    color: '#9B9B9B',
    fontSize: 14,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayButtonActive: {
    backgroundColor: '#D62828',
    borderColor: '#D62828',
  },
  dayButtonText: {
    color: '#9B9B9B',
    fontWeight: '600',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
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