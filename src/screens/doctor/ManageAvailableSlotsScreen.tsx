import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';

const RED = '#E63946';
const BG = '#FFFFFF';

// ── Helper ──
const getWorkingDaysString = (workingDays: number[]): string => {
  if (!workingDays || workingDays.length === 0) return 'No days set';
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sorted = [...workingDays].sort();
  if (sorted.length === 7) return 'All days';
  if (sorted.length === 5 && sorted.every(d => d >= 1 && d <= 5)) return 'Mon–Fri';
  if (sorted.length === 6 && sorted.every(d => d >= 1 && d <= 6)) return 'Mon–Sat';
  return sorted.map(d => dayNames[d]).join(', ');
};

const statusStyles: Record<string, { border: string; bg: string; text: string }> = {
  available: { border: 'rgba(34,197,94,0.35)', bg: 'rgba(34,197,94,0.08)', text: '#16A34A' },
  unavailable: { border: 'rgba(230,57,70,0.35)', bg: 'rgba(230,57,70,0.08)', text: RED },
  booked: { border: 'rgba(59,130,246,0.35)', bg: 'rgba(59,130,246,0.08)', text: '#2563EB' },
  past: { border: 'rgba(136,136,136,0.25)', bg: 'rgba(136,136,136,0.06)', text: '#8A8A8A' },
};

const getWeekRange = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { today, monday, sunday };
};

const isSlotTimePast = (slotDate: string, slotTime: string) => {
  const now = new Date();
  const d = new Date(slotDate);
  const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dOnly.getTime() !== todayOnly.getTime()) return false;
  const timeParts = slotTime.match(/(\d+):(\d+)\s*([AP]M)/i);
  if (!timeParts) return false;
  let hour = parseInt(timeParts[1]);
  const minute = parseInt(timeParts[2]);
  const ampm = timeParts[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  const slotMinutes = hour * 60 + minute;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes <= currentMinutes;
};

const ManageAvailableSlotsScreen = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getDoctorProfile = async () => {
    try {
      const response = await API.get('/auth/doctor-profile');
      if (response.data.success) {
        const doctor = response.data.data;
        if (doctor.clinics && doctor.clinics.length > 0) {
          setClinics(doctor.clinics);
          setSelectedClinicId(doctor.clinics[0]._id);
        }
      }
    } catch (error) {
      console.log('Error fetching clinics:', error);
    }
  };

  const getSlots = async () => {
    try {
      setLoading(true);
      const response = await API.get('/slots');
      setSlots(response.data.slots || []);
    } catch (error: any) {
      console.log('SLOTS ERROR', error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([getDoctorProfile(), getSlots()]);
  }, []);

  const toggleSlot = async (id: string) => {
    try {
      await API.put(`/slots/${id}/toggle`);
      await getSlots();
    } catch (error: any) {
      global.showError(error?.response?.data?.message || 'Unable to update slot');
    }
  };

  const markTodayUnavailable = async () => {
    const { today } = getWeekRange();
    const filteredSlots = getFilteredSlots();
    const todaySlots = filteredSlots.filter((item) => {
      const d = new Date(item.slotDate);
      const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return (
        dOnly.getTime() === today.getTime() &&
        item.status === 'available' &&
        !isSlotTimePast(item.slotDate, item.slotTime)
      );
    });

    if (todaySlots.length === 0) {
      global.showInfo('No Slots', 'There are no available slots today to update.');
      return;
    }

    global.showConfirm(
      'Confirm',
      `Mark all ${todaySlots.length} slots as unavailable for today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Mark All',
          style: 'destructive',
          onPress: async () => {
            try {
              setBulkLoading(true);
              await Promise.all(todaySlots.map((item) => API.put(`/slots/${item._id}/toggle`)));
              await getSlots();
            } catch (error: any) {
              global.showError('Some slots could not be updated. Please try again.');
            } finally {
              setBulkLoading(false);
            }
          },
        },
      ]
    );
  };

  const getFilteredSlots = () => {
    if (!selectedClinicId) return slots;
    return slots.filter((item) => item.clinic === selectedClinicId);
  };

  const filteredSlots = getFilteredSlots();
  const { today, sunday } = getWeekRange();
  const weekSlots = filteredSlots.filter((item) => {
    const d = new Date(item.slotDate);
    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dOnly.getTime() >= today.getTime() && dOnly.getTime() <= sunday.getTime();
  });

  const grouped: Record<string, any[]> = {};
  weekSlots.forEach((item) => {
    const key = new Date(item.slotDate).toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const getSelectedClinicName = () => {
    if (!selectedClinicId) return 'All Clinics';
    const found = clinics.find(c => c._id === selectedClinicId);
    return found ? found.name : 'Select Clinic';
  };

  const selectedClinic = clinics.find(c => c._id === selectedClinicId);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.loaderText}>Loading Slots...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.header}>Available Slots</Text>
        
        </View>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{weekSlots.length}</Text>
        </View>
      </View>

      {/* Clinic Timing Card */}
    {selectedClinic && (
  <View style={styles.clinicTimingCard}>
    <View style={styles.clinicTimingHeader}>
      <View style={styles.selectedBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
        <Text style={styles.selectedBadgeText}>Selected</Text>
      </View>
      <Text style={styles.clinicTimingTitle}>{selectedClinic.name}</Text>
    </View>
    <View style={styles.timingRow}>
      <Ionicons name="time-outline" size={14} color="#6B6B6B" />
      <Text style={styles.clinicTimingText}>
        {selectedClinic.timing?.start || 'Not set'} – {selectedClinic.timing?.end || 'Not set'}
      </Text>
    </View>
    <View style={styles.timingRow}>
      <Ionicons name="calendar-outline" size={14} color="#6B6B6B" />
      <Text style={styles.clinicTimingText}>
        {getWorkingDaysString(selectedClinic.workingDays)}
      </Text>
    </View>
    <TouchableOpacity
      style={styles.changeClinicBtn}
      onPress={() => setModalVisible(true)}
    >
      <Text style={styles.changeClinicBtnText}>Change Clinic</Text>
      <Ionicons name="chevron-forward" size={16} color={RED} />
    </TouchableOpacity>
  </View>
)}

      <Text style={styles.subHeader}>Tap a slot to enable or disable it</Text>

      <TouchableOpacity
        style={styles.bulkButton}
        onPress={markTodayUnavailable}
        disabled={bulkLoading}
        activeOpacity={0.85}>
        {bulkLoading ? (
          <ActivityIndicator color={RED} size="small" />
        ) : (
          <>
            <Ionicons name="close-circle-outline" size={16} color={RED} />
            <Text style={styles.bulkButtonText}>Mark All Today Unavailable</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusStyles.available.text }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusStyles.unavailable.text }]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusStyles.booked.text }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      {sortedDates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={40} color="#B0B0B0" />
          <Text style={styles.emptyTitle}>No slots this week</Text>
          <Text style={styles.emptySub}>Select another clinic or date range</Text>
        </View>
      ) : (
        sortedDates.map((date) => {
          const dateSlots = grouped[date];
          return (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>
                {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
              <View style={styles.chipsWrap}>
                {dateSlots.map((item: any) => {
                  const timeExpired = isSlotTimePast(item.slotDate, item.slotTime);
                  const isPast = item.isPast || timeExpired;
                  const key = isPast ? 'past' : item.status;
                  const style = statusStyles[key] || statusStyles.available;
                  const disabled = item.status === 'booked' || isPast;

                  return (
                    <TouchableOpacity
                      key={item._id}
                      disabled={disabled}
                      activeOpacity={0.75}
                      onPress={() => toggleSlot(item._id)}
                      style={[
                        styles.chip,
                        { backgroundColor: style.bg, borderColor: style.border },
                      ]}>
                      <Text style={[styles.chipTime, { color: style.text }]}>
                        {item.slotTime}
                      </Text>
                      <Text style={[styles.chipStatus, { color: style.text }]}>
                        {isPast ? 'Expired' : item.status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })
      )}

      {/* Clinic Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Clinic</Text>
            <FlatList
              data={clinics}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedClinicId === item._id && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedClinicId(item._id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {selectedClinicId === item._id && (
                    <Ionicons name="checkmark" size={20} color={RED} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ManageAvailableSlotsScreen;

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#6B6B6B', fontSize: 13 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  headerCount: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B6B6B',
  },
  subHeader: {
    fontSize: 13,
    color: '#8A8A8A',
    marginBottom: 14,
  },

  clinicSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clinicSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(230,57,70,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  bulkButtonText: { color: RED, fontSize: 13, fontWeight: '700' },

  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  legendText: { fontSize: 11, color: '#8A8A8A', fontWeight: '600' },

  dateGroup: { marginBottom: 18 },
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipTime: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  chipStatus: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#8A8A8A', marginTop: 4 },

  clinicTimingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  clinicTimingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  clinicTimingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  clinicTimingText: {
    fontSize: 14,
    color: '#4B5563',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  modalItemSelected: { backgroundColor: 'rgba(230,57,70,0.05)', borderRadius: 8 },
  modalItemText: { fontSize: 16, color: '#1A1A1A' },
  modalCloseBtn: {
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: { color: '#1A1A1A', fontSize: 16, fontWeight: '600' },
  clinicTimingCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  padding: 16,
  marginBottom: 16,
  borderWidth: 2,
  borderColor: RED,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
},
clinicTimingHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
},
selectedBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#16A34A',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 12,
  gap: 4,
},
selectedBadgeText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: '700',
},

changeClinicBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginTop: 10,
  gap: 4,
},
changeClinicBtnText: {
  fontSize: 13,
  color: RED,
  fontWeight: '600',
},
});