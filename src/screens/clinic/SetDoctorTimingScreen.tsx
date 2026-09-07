import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import API from '../../services/api';

// ── Helper: convert working days array to readable string ──
const getWorkingDaysString = (workingDays: number[]): string => {
  if (!workingDays || workingDays.length === 0) return 'No days set';
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sorted = [...workingDays].sort();
  if (sorted.length === 7) return 'All days';
  if (sorted.length === 5 && sorted.every(d => d >= 1 && d <= 5)) return 'Mon–Fri';
  if (sorted.length === 6 && sorted.every(d => d >= 1 && d <= 6)) return 'Mon–Sat';
  return sorted.map(d => dayNames[d]).join(', ');
};

const SetDoctorTimingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    doctorId,
    doctorName,
    timing: initialTiming,
    workingDays: initialWorkingDays,
  } = route.params as any;

  const [saving, setSaving] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const [startTime, setStartTime] = useState(initialTiming?.start || '09:00');
  const [endTime, setEndTime] = useState(initialTiming?.end || '18:00');
  const [workingDays, setWorkingDays] = useState(initialWorkingDays || [1, 2, 3, 4, 5, 6]);

  const toggleWorkingDay = (day: number) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleTimeConfirm = (date: Date) => {
    const formatted = formatTime(date);
    if (pickerMode === 'start') {
      setStartTime(formatted);
    } else {
      setEndTime(formatted);
    }
    setShowPicker(false);
    setPickerMode(null);
  };

  const handleSave = async () => {
    if (!doctorId) return;
    setSaving(true);
    try {
      const payload = {
        timing: { start: startTime, end: endTime },
        workingDays: workingDays,
      };
      await API.put(`/clinic/doctors/${doctorId}/timing`, payload);
      global.showSuccess('Timing updated successfully');
      navigation.goBack();
    } catch (error: any) {
      global.showError(error?.response?.data?.message || 'Failed to update timing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Timing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Current Working Hours */}
        <View style={styles.currentHoursCard}>
          <Text style={styles.currentHoursTitle}>Current Working Hours</Text>
          <Text style={styles.currentHoursText}>
            {startTime} – {endTime}
          </Text>
        </View>

        {/* Current Working Days */}
        <View style={styles.currentDaysCard}>
          <Text style={styles.currentDaysTitle}>Current Working Days</Text>
          <Text style={styles.currentDaysText}>{getWorkingDaysString(workingDays)}</Text>
        </View>

        {/* Start Time */}
        <View style={styles.shiftContainer}>
          <Text style={styles.shiftTitle}>Start Time</Text>
          <TouchableOpacity
            style={styles.timeInputBox}
            onPress={() => {
              setPickerMode('start');
              setShowPicker(true);
            }}
          >
            <Text style={styles.timeText}>{startTime}</Text>
            <Ionicons name="time-outline" size={20} color="#6B6B6B" />
          </TouchableOpacity>
        </View>

        {/* End Time */}
        <View style={styles.shiftContainer}>
          <Text style={styles.shiftTitle}>End Time</Text>
          <TouchableOpacity
            style={styles.timeInputBox}
            onPress={() => {
              setPickerMode('end');
              setShowPicker(true);
            }}
          >
            <Text style={styles.timeText}>{endTime}</Text>
            <Ionicons name="time-outline" size={20} color="#6B6B6B" />
          </TouchableOpacity>
        </View>

        {/* Working Days (editable) */}
        <View style={styles.shiftContainer}>
          <Text style={styles.shiftTitle}>Edit Working Days</Text>
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

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Timing</Text>}
        </TouchableOpacity>
      </ScrollView>

      <DateTimePickerModal
        isVisible={showPicker}
        mode="time"
        date={parseTime(pickerMode === 'start' ? startTime : endTime)}
        onConfirm={handleTimeConfirm}
        onCancel={() => {
          setShowPicker(false);
          setPickerMode(null);
        }}
        is24Hour={true}
      />
    </SafeAreaView>
  );
};

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
    padding: 20,
  },
  currentHoursCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  currentHoursTitle: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  currentHoursText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  currentDaysCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  currentDaysTitle: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  currentDaysText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  shiftContainer: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },
  shiftTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  timeInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#1A1A1A',
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

export default SetDoctorTimingScreen;