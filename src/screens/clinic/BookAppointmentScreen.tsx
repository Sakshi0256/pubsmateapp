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
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../services/api'; // ✅ Use API instance

const BookAppointmentScreen = ({ route, navigation }: any) => {
  const preselectedDoctorId = route?.params?.doctorId;
  const preselectedSlot = route?.params?.slotTime;

  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [slot, setSlot] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // ── Fetch Doctors ──
  const getDoctors = async () => {
    try {
      const response = await API.get('/doctors');
      console.log('📋 Doctors response:', response.data);
      setDoctors(response.data.doctors || []);

      // If preselected doctor, select it
      if (preselectedDoctorId && response.data.doctors) {
        const found = response.data.doctors.find(
          (d: any) => d._id === preselectedDoctorId
        );
        if (found) setSelectedDoctor(found);
      }
    } catch (error) {
      console.log('Get Doctors Error:', error);
    }
  };

  // ── Fetch Slots for selected doctor ──
  const getSlots = async () => {
    if (!selectedDoctor) return;
    try {
      const response = await API.get(`/slots/doctor/${selectedDoctor._id}`);
      if (response.data.success) {
        setSlots(response.data.slots || []);
        console.log('📋 Slots for doctor:', response.data.slots.length);
      }
    } catch (error) {
      console.log('Get Slots Error:', error);
    }
  };

  // ── Load doctors on mount ──
  useEffect(() => {
    getDoctors();
  }, []);

  // ── Reload slots when selected doctor changes ──
  useEffect(() => {
    if (selectedDoctor) {
      getSlots();
    }
  }, [selectedDoctor]);

  // ── If preselectedSlot is provided, set it ──
  useEffect(() => {
    if (preselectedSlot) setSlot(preselectedSlot);
  }, [preselectedSlot]);

  // ── Filter slots (only future available slots) ──
  const getFilteredSlots = () => {
    if (!selectedDoctor) return [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return slots.filter((item) => {
      const doctorId = item.doctor?._id || item.doctor;
      if (item.status !== 'available') return false;
      if (String(doctorId) !== String(selectedDoctor._id)) return false;

      const slotDate = item.slotDate; // "YYYY-MM-DD"
      if (slotDate < todayStr) return false; // Past date → hide

      if (slotDate > todayStr) return true; // Future date → show

      // Today: check time (only future slots)
      const timeStr = item.slotTime; // "09:00 AM"
      const timeParts = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
      if (!timeParts) return true; // if can't parse, show (safe)

      let hour = parseInt(timeParts[1]);
      const minute = parseInt(timeParts[2]);
      const ampm = timeParts[3].toUpperCase();
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      const slotMinutes = hour * 60 + minute;
      const currentMinutes = currentHour * 60 + currentMinute;

      return slotMinutes > currentMinutes; // Only future slots
    });
  };

  // ── Get unique slot times ──
  const getUniqueSlotTimes = () => {
    const filtered = getFilteredSlots();
    const uniqueTimes = new Set();
    return filtered.filter((slot) => {
      if (!uniqueTimes.has(slot.slotTime)) {
        uniqueTimes.add(slot.slotTime);
        return true;
      }
      return false;
    });
  };

  // ── Book Appointment ──
  const handleSave = async () => {
    if (!patientName.trim() || !mobile.trim() || !selectedDoctor || !slot.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      // Find the selected slot to get date
      const selectedSlotData = slots.find(
        (s) => s.slotTime === slot && s.doctor?._id === selectedDoctor._id
      );

      const response = await API.post('/clinic/appointments', {
        patientName,
        mobile,
        doctorId: selectedDoctor._id,
        doctor: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        slotTime: slot,
        slotDate: selectedSlotData?.slotDate || new Date().toISOString().split('T')[0],
      });

      if (response.data.success) {
        Alert.alert('Success', 'Appointment booked successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.log('Book Appointment Error:', error?.response?.data || error);
      Alert.alert('Error', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const filteredSlots = getUniqueSlotTimes();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Book Appointment</Text>
        <Text style={styles.subtitle}>Create and manage clinic appointments</Text>
      </View>

      {/* Patient Name */}
      <Text style={styles.label}>Patient Name</Text>
      <TextInput
        placeholder="Enter patient name"
        placeholderTextColor="#666"
        style={styles.input}
        value={patientName}
        onChangeText={setPatientName}
      />

      {/* Mobile Number */}
      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        placeholder="Enter mobile number"
        placeholderTextColor="#666"
        keyboardType="phone-pad"
        style={styles.input}
        value={mobile}
        onChangeText={setMobile}
      />

      {/* Select Doctor (Dropdown) */}
      <Text style={styles.label}>Select Doctor</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedDoctor ? styles.dropdownText : styles.dropdownPlaceholder}>
          {selectedDoctor ? selectedDoctor.name : 'Choose a doctor...'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {/* Doctor Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            <FlatList
              data={doctors}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.doctorItem,
                    selectedDoctor?._id === item._id && styles.doctorItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedDoctor(item);
                    setSlot(''); // Reset slot when doctor changes
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.doctorName}>{item.name}</Text>
                  <Text style={styles.doctorSpecialty}>
                    {item.specialty || 'General Physician'}
                  </Text>
                  <Text style={styles.doctorFee}>₹{item.consultationFee || 0}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No doctors available</Text>}
            />
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Select Slot */}
      <Text style={styles.label}>Select Slot</Text>
      {selectedDoctor ? (
        filteredSlots.length > 0 ? (
          <View style={styles.slotContainer}>
            {filteredSlots.map((item, index) => (
              <TouchableOpacity
                key={item._id || index}
                style={[
                  styles.slotButton,
                  slot === item.slotTime && styles.selectedSlot,
                ]}
                onPress={() => setSlot(item.slotTime)}
              >
                <Text
                  style={[
                    styles.slotText,
                    slot === item.slotTime && styles.selectedSlotText,
                  ]}
                >
                  {item.slotTime}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noSlotsCard}>
            <Text style={styles.noSlotsText}>No available slots for this doctor</Text>
          </View>
        )
      ) : (
        <View style={styles.noSlotsCard}>
          <Text style={styles.noSlotsText}>Please select a doctor first</Text>
        </View>
      )}

      {/* Book Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Book Appointment</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BookAppointmentScreen;

// ── Styles (unchanged) ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D62828',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    fontSize: 15,
    color: '#FFFFFF',
  },
  dropdownButton: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  dropdownPlaceholder: {
    color: '#666',
    fontSize: 15,
  },
  dropdownArrow: {
    color: '#666',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  doctorItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  doctorItemSelected: {
    backgroundColor: 'rgba(214, 40, 40, 0.15)',
    borderRadius: 12,
  },
  doctorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  doctorSpecialty: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  doctorFee: {
    color: '#D62828',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  closeModalBtn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  slotButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  selectedSlot: {
    backgroundColor: '#D62828',
    borderColor: '#D62828',
  },
  slotText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  selectedSlotText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noSlotsCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  noSlotsText: {
    color: '#888',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#D62828',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});