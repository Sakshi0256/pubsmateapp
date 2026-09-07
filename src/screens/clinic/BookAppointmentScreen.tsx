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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import API from '../../services/api';

const MAX_DAYS_AHEAD = 20;

const BookAppointmentScreen = ({ route, navigation }: any) => {
  const preselectedDoctorId = route?.params?.doctorId;
  const preselectedSlot = route?.params?.slotTime;
  const todayStr = new Date().toISOString().split('T')[0];
  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; date: string; time: string } | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const clearFields = () => {
    setPatientName('');
    setMobile('');
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSlots([]);
    setFilterDate(null);
    setShowDatePicker(false);
  };

  useEffect(() => {
    return () => {
      clearFields();
    };
  }, []);

  const getDoctors = async () => {
    try {
      const response = await API.get('/clinic/doctors');
      setDoctors(response.data.doctors || []);
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

  const getSlots = async () => {
    if (!selectedDoctor) return;
    try {
      const response = await API.get(`/slots/doctor/${selectedDoctor._id}`);
      if (response.data.success) {
        setSlots(response.data.slots || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      getSlots();
      setSelectedSlot(null);
      setFilterDate(null); // reset to today on doctor change
    }
  }, [selectedDoctor]);

  useEffect(() => {
    if (preselectedSlot) {
      setSelectedSlot((prev) => (prev ? prev : { id: '', date: '', time: preselectedSlot }));
    }
  }, [preselectedSlot]);

 const getFilteredSlots = () => {
  if (!selectedDoctor) return [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // ✅ If filterDate is set, show only that date. Otherwise, show all dates.
  return slots.filter((item) => {
    const doctorId = item.doctor?._id || item.doctor;
    if (item.status !== 'available') return false;
    if (String(doctorId) !== String(selectedDoctor._id)) return false;
    const slotDate = item.slotDate;
    if (slotDate < todayStr) return false;
    if (slotDate > maxDateStr) return false;

    // If a specific date is selected, filter to that date
    if (filterDate && slotDate !== filterDate) return false;

    // Today: filter out past time slots
    if (slotDate === todayStr) {
      const timeStr = item.slotTime;
      const timeParts = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
      if (!timeParts) return true;
      let hour = parseInt(timeParts[1]);
      const minute = parseInt(timeParts[2]);
      const ampm = timeParts[3].toUpperCase();
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      const slotMinutes = hour * 60 + minute;
      const currentMinutes = currentHour * 60 + currentMinute;
      return slotMinutes > currentMinutes;
    }
    return true;
  });
};

  const getGroupedSlots = () => {
    const filtered = getFilteredSlots();
    const grouped: Record<string, any[]> = {};
    filtered.forEach((item) => {
      if (!grouped[item.slotDate]) grouped[item.slotDate] = [];
      grouped[item.slotDate].push(item);
    });
    return Object.keys(grouped)
      .sort()
      .map((date) => ({ date, items: grouped[date] }));
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  const getMinMaxDate = () => {
    const min = new Date();
    const max = new Date();
    max.setDate(max.getDate() + MAX_DAYS_AHEAD);
    return { min, max };
  };

  const onDatePicked = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'dismissed' || !date) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setFilterDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSave = async () => {
    if (!patientName.trim() || !mobile.trim() || !selectedDoctor || !selectedSlot) {
      showAlert('Error', 'Please fill all fields and select a slot');
      return;
    }

    try {
      setLoading(true);
      const response = await API.post('/clinic/appointments', {
        patientName,
        mobile,
        doctorId: selectedDoctor._id,
        doctor: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        slotTime: selectedSlot.time,
        slotDate: selectedSlot.date || new Date().toISOString().split('T')[0],
      });

      if (response.data.success) {
        clearFields();
        showAlert('Success', 'Appointment booked successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.log('Book Appointment Error:', error?.response?.data || error);
      showAlert('Error', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const groupedSlots = getGroupedSlots();
  const { min: minDate, max: maxDate } = getMinMaxDate();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Book Appointment</Text>
        <Text style={styles.subtitle}>Create and manage clinic appointments</Text>
      </View>

      <Text style={styles.label}>Patient Name</Text>
      <TextInput
        placeholder="Enter patient name"
        placeholderTextColor="#666"
        style={styles.input}
        value={patientName}
        onChangeText={setPatientName}
      />

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        placeholder="Enter mobile number"
        placeholderTextColor="#666"
        keyboardType="phone-pad"
        style={styles.input}
        value={mobile}
        onChangeText={(text) => {
          const numericText = text.replace(/[^0-9]/g, '');
          if (numericText.length <= 10) setMobile(numericText);
        }}
        maxLength={10}
      />

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

      <View style={styles.slotHeaderRow}>
        <Text style={styles.label}>Select Date & Slot</Text>
        <Text style={styles.slotWindowNote}>Next {MAX_DAYS_AHEAD} days</Text>
      </View>

     <View style={styles.dateFilterRow}>
  <TouchableOpacity
    style={styles.datePickerBtn}
    onPress={() => setShowDatePicker(true)}
    disabled={!selectedDoctor}
  >
    <Text style={styles.datePickerBtnText}>
      {filterDate ? formatDateLabel(filterDate) : '📅 Select Date'}
    </Text>
  </TouchableOpacity>
  {filterDate && (
    <TouchableOpacity style={styles.clearDateBtn} onPress={() => setFilterDate(null)}>
      <Text style={styles.clearDateBtnText}>Show All</Text>
    </TouchableOpacity>
  )}
</View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate ? new Date(filterDate) : minDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={onDatePicked}
        />
      )}

      {selectedDoctor ? (
        groupedSlots.length > 0 ? (
          groupedSlots.map(({ date, items }) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{formatDateLabel(date)}</Text>
              <View style={styles.slotContainer}>
                {items.map((item, index) => {
                  const isSelected =
                    selectedSlot?.id === item._id ||
                    (!selectedSlot?.id && selectedSlot?.date === date && selectedSlot?.time === item.slotTime);
                  return (
                    <TouchableOpacity
                      key={item._id || index}
                      style={[styles.slotButton, isSelected && styles.selectedSlot]}
                      onPress={() =>
                        setSelectedSlot({ id: item._id, date: item.slotDate, time: item.slotTime })
                      }
                    >
                      <Text style={[styles.slotText, isSelected && styles.selectedSlotText]}>
                        {item.slotTime}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noSlotsCard}>
            <Text style={styles.noSlotsText}>
              {filterDate
                ? `No available slots for ${formatDateLabel(filterDate)}`
                : `No available slots for today`}
            </Text>
          </View>
        )
      ) : (
        <View style={styles.noSlotsCard}>
          <Text style={styles.noSlotsText}>Please select a doctor first</Text>
        </View>
      )}

      {selectedSlot && (
        <View style={styles.confirmCard}>
          <Text style={styles.confirmText}>
            Booking for{' '}
            <Text style={styles.confirmHighlight}>
              {selectedSlot.date ? formatDateLabel(selectedSlot.date) : 'Today'} · {selectedSlot.time}
            </Text>
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Book Appointment</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BookAppointmentScreen;

// ── Styles remain unchanged ──
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#6B6B6B',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D62828',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
    color: '#1A1A1A',
  },
  dropdownButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  doctorItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  doctorItemSelected: {
    backgroundColor: 'rgba(214, 40, 40, 0.08)',
    borderRadius: 12,
  },
  doctorName: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  doctorSpecialty: {
    color: '#8A8A8A',
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
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  slotWindowNote: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  datePickerBtn: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  datePickerBtnText: {
    color: '#1A1A1A',
    fontSize: 13,
    fontWeight: '600',
  },
  clearDateBtn: {
    backgroundColor: 'rgba(214, 40, 40, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(214, 40, 40, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearDateBtnText: {
    color: '#D62828',
    fontSize: 13,
    fontWeight: '700',
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 10,
    marginBottom: 8,
  },
  slotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedSlot: {
    backgroundColor: '#D62828',
    borderColor: '#D62828',
  },
  slotText: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 13,
  },
  selectedSlotText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noSlotsCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  noSlotsText: {
    color: '#8A8A8A',
    fontSize: 14,
    textAlign: 'center',
  },
  confirmCard: {
    backgroundColor: 'rgba(214, 40, 40, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(214, 40, 40, 0.2)',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  confirmText: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  confirmHighlight: {
    color: '#D62828',
    fontWeight: '700',
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
    color: '#8A8A8A',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});