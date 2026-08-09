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
     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
  <Text style={{ color: '#6B6B6B' }}>Loading...</Text>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    color: '#1A1A1A',
    marginBottom: 4,
  },
  issue: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  completedBadge: { backgroundColor: 'rgba(34,197,94,0.12)' },
  completedText: { color: '#16A34A' },
  pendingBadge: { backgroundColor: 'rgba(245,158,11,0.12)' },
  pendingText: { color: '#D97706' },
  rejectedBadge: { backgroundColor: 'rgba(239,68,68,0.12)' },
  rejectedText: { color: '#DC2626' },
  acceptedBadge: { backgroundColor: 'rgba(59,130,246,0.12)' },
  acceptedText: { color: '#2563EB' },
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
    color: '#6B6B6B',
  },
});