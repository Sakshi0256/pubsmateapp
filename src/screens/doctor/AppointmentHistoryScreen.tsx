import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import API from '../../services/api'; // ✅ Use API instance

const AppointmentHistoryScreen = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getAppointments = async () => {
    try {
      // ✅ Correct route – interceptor adds token automatically
      const response = await API.get('/doctors/appointments/my');
      setAppointments(response.data.appointments);
      console.log('DOCTOR APPOINTMENTS', response.data.appointments);
    } catch (error: any) {
      console.log('APPOINTMENTS ERROR', error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <Text style={{ color: '#8F9B95' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Appointment History</Text>

      {appointments.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.issue}>No appointments found</Text>
        </View>
      ) : (
        appointments.map((item: any) => (
          <View key={item._id} style={styles.card}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.patientName}>
                  {item.patientName || item.patient?.name}
                </Text>
                <Text style={styles.issue}>
                  {item.doctorName || item.doctor?.name}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'completed' && styles.completedBadge,
                  item.status === 'pending' && styles.pendingBadge,
                  item.status === 'rejected' && styles.rejectedBadge,
                  item.status === 'accepted' && styles.acceptedBadge,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'completed' && styles.completedText,
                    item.status === 'pending' && styles.pendingText,
                    item.status === 'rejected' && styles.rejectedText,
                    item.status === 'accepted' && styles.acceptedText,
                  ]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.time}>{item.slotTime}</Text>
              <Text style={styles.date}>
                {new Date(item.slotDate || item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default AppointmentHistoryScreen;

// ── Styles (same as before, no change) ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  issue: {
    fontSize: 13,
    color: '#8F9B95',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  completedBadge: { backgroundColor: 'rgba(34,197,94,0.15)' },
  completedText: { color: '#22C55E' },
  pendingBadge: { backgroundColor: 'rgba(245,158,11,0.15)' },
  pendingText: { color: '#F59E0B' },
  rejectedBadge: { backgroundColor: 'rgba(239,68,68,0.15)' },
  rejectedText: { color: '#EF4444' },
  acceptedBadge: { backgroundColor: 'rgba(59,130,246,0.15)' },
  acceptedText: { color: '#60A5FA' },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D62828',
  },
  date: {
    fontSize: 13,
    color: '#8F9B95',
  },
});