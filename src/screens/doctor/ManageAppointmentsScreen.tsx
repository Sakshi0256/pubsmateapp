import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api'; // ✅ Use API instance

const RED = '#E63946';
const BG = '#FFFFFF';

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'rgba(245,158,11,0.14)', text: '#F5A623' },
  accepted: { bg: 'rgba(59,130,246,0.14)', text: '#4C9AFF' },
  completed: { bg: 'rgba(34,197,94,0.14)', text: '#2ECC71' },
  rejected: { bg: 'rgba(230,57,70,0.14)', text: RED },
};

const AppointmentHistoryScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Update Status ──
  const updateStatus = async (id: string, action: 'accept' | 'reject' | 'complete') => {
    try {
      const response = await API.put(`/doctors/appointments/${id}/${action}`);
      console.log('STATUS RESPONSE', response.data);
      Alert.alert('Success', `Appointment ${action}ed successfully`);
      await getAppointments(); // Refresh list
    } catch (error: any) {
      console.log('STATUS ERROR', error?.response?.data || error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update status');
    }
  };

  // ── Get Appointments ──
  const getAppointments = async () => {
    try {
      const response = await API.get('/doctors/appointments/my');
      setAppointments(response.data.appointments);
    } catch (error: any) {
      console.log('APPOINTMENTS ERROR', error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Appointment History</Text>
        <Text style={styles.headerCount}>{appointments.length}</Text>
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-clear-outline" size={22} color="#5C5C5C" />
          <Text style={styles.emptyText}>No appointments found</Text>
        </View>
      ) : (
        appointments.map((item: any) => {
          const status = statusColors[item.status] || statusColors.pending;
          const patientName = item.patientName || item.patient?.name || 'Unknown Patient';

          return (
            <Animated.View
              key={item._id}
              style={[
                styles.card,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                  ],
                },
              ]}>
              <View style={styles.topRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {patientName.substring(0, 1).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.identityBlock}>
                  <Text style={styles.patientName} numberOfLines={1}>{patientName}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="medical-outline" size={11} color="#7A7A7A" />
                    <Text style={styles.issue} numberOfLines={1}>
                      Dr. {item.doctor?.name || item.doctorName}
                    </Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusText, { color: status.text }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.bottomRow}>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={12} color="#7A7A7A" />
                  <Text style={styles.date}>
                    {new Date(item.slotDate || item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {item.slotTime ? (
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={12} color={RED} />
                    <Text style={styles.time}>{item.slotTime}</Text>
                  </View>
                ) : null}
              </View>

              {item.status === 'pending' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => updateStatus(item._id, 'accept')}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.rejectButton} onPress={() => updateStatus(item._id, 'reject')}>
                    <Ionicons name="close" size={14} color={RED} />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'accepted' && (
                <TouchableOpacity style={styles.completeButton} onPress={() => updateStatus(item._id, 'complete')}>
                  <Ionicons name="checkmark-done" size={14} color="#FFFFFF" />
                  <Text style={styles.acceptButtonText}>Mark Completed</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          );
        })
      )}
    </ScrollView>
  );
};

export default AppointmentHistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#6B6B6B', fontSize: 13 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 },
  headerCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(230,57,70,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: { color: RED, fontSize: 13, fontWeight: '700' },
  identityBlock: { flex: 1, marginRight: 8 },
  patientName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 3 },

  metaRow: { flexDirection: 'row', alignItems: 'center' },
  issue: { fontSize: 11, color: '#8A8A8A', marginLeft: 4, flexShrink: 1 },

  divider: {
    height: 1,
    backgroundColor: '#EDEDED',
    marginVertical: 10,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: { fontSize: 12, fontWeight: '700', color: RED, marginLeft: 4 },
  date: { fontSize: 12, color: '#8A8A8A', marginLeft: 4 },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: RED,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(230,57,70,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.3)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  completeButton: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: RED,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  acceptButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12.5 },
  rejectButtonText: { color: RED, fontWeight: '700', fontSize: 12.5 },

  emptyCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  emptyText: { fontSize: 12, color: '#9B9B9B', marginTop: 6, fontWeight: '600' },
});