import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api'; // ✅ API import

const DoctorDashboardScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    acceptedAppointments: 0,
    completedAppointments: 0,
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Helper: proper "First Last" initials (no random substring) ──
  const getInitials = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  };

  // ── Dashboard Stats ──
  const getDashboardData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setDoctorName(user.name);
        // ✅ matches DoctorProfileScreen field: doctor?.hospitalName
        if (user.hospitalName) {
          setClinicName(user.hospitalName);
        } else {
          // fallback: not cached in AsyncStorage, fetch from profile API
          try {
            const profileRes = await API.get('/auth/doctor-profile');
            if (profileRes.data.success) {
              setClinicName(profileRes.data.data?.hospitalName || '');
            }
          } catch (e) {
            console.log('CLINIC NAME FETCH ERROR', e);
          }
        }
      }
      const response = await API.get('/doctors/dashboard/stats');
      setStats(response.data.stats);
    } catch (error: any) {
      console.log('DOCTOR DASHBOARD ERROR', error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  // ── Appointments ──
  const getAppointments = async () => {
    try {
      const response = await API.get('/doctors/appointments/my');
      setAppointments(response.data.appointments);
    } catch (error: any) {
      console.log('DOCTOR APPOINTMENTS ERROR', error?.response?.data || error);
    }
  };

  useEffect(() => {
    getDashboardData();
    getAppointments();
  }, []);

  // ── Filter Today's Appointments ──
  const todayAppointments = appointments.filter(item => {
    const dateToCheck = item.appointmentDate || item.createdAt || item.slotDate;
    if (!dateToCheck) return false;
    const today = new Date();
    const itemDate = new Date(dateToCheck);
    return (
      itemDate.getDate() === today.getDate() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  });

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'rgba(245,158,11,0.14)', text: '#F5A623' },
    accepted: { bg: 'rgba(59,130,246,0.14)', text: '#4C9AFF' },
    completed: { bg: 'rgba(34,197,94,0.14)', text: '#2ECC71' },
    cancelled: { bg: 'rgba(230,57,70,0.14)', text: '#E63946' },
    rejected: { bg: 'rgba(230,57,70,0.14)', text: '#E63946' },
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            {clinicName ? (
              <View style={styles.clinicRow}>
                <Ionicons name="business-outline" size={11} color="#E63946" />
                <Text style={styles.clinicName} numberOfLines={1}>{clinicName}</Text>
              </View>
            ) : null}
            <Text style={styles.doctorName}>Dr. {doctorName}</Text>
          </View>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>{getInitials(doctorName)}</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalAppointments}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingAppointments}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.acceptedAppointments}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedAppointments}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        {/* TODAY APPOINTMENTS */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          <Text style={styles.sectionCount}>{todayAppointments.length}</Text>
        </View>

        {todayAppointments.length > 0 ? (
          todayAppointments.map((item: any) => {
            const status = statusColors[item.status] || statusColors.pending;
            return (
              <View key={item._id} style={styles.appointmentCard}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallText}>
                    {(item.patientName || item.patient?.name || '?')
                      .substring(0, 1)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.patientName} numberOfLines={1}>
                      {item.patientName || item.patient?.name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="medical-outline" size={11} color="#7A7A7A" />
                    <Text style={styles.metaText}>
                      Dr. {item.doctor?.name || item.doctorName || doctorName}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="call-outline" size={11} color="#7A7A7A" />
                    <Text style={styles.metaText}>{item.mobile || 'No Mobile'}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={11} color="#7A7A7A" />
                    <Text style={styles.metaText}>
                      {item.slotDate || new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    {item.slotTime ? (
                      <>
                        <View style={styles.metaDot} />
                        <Ionicons name="time-outline" size={11} color="#E63946" />
                        <Text style={styles.metaTimeText}>{item.slotTime}</Text>
                      </>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-clear-outline" size={20} color="#5C5C5C" />
            <Text style={styles.emptyText}>No appointments today</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorDashboardScreen;

const RED = '#E63946';
const BG = '#0A0000';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#8F8F8F', fontSize: 13 },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + 16,
    paddingBottom: 24,
  },

  // Header
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  greeting: { fontSize: 11, color: '#8F8F8F', marginBottom: 2, fontWeight: '500' },
  clinicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  clinicName: {
    fontSize: 11,
    color: RED,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  doctorName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(230,57,70,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: { color: RED, fontSize: 13, fontWeight: '700' },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 8,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNumber: { fontSize: 16, fontWeight: '800', color: RED, marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#8F8F8F', fontWeight: '600' },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.2 },
  sectionCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8F8F8F',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // Appointment card (compact)
  appointmentCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(230,57,70,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  avatarSmallText: { color: RED, fontSize: 12, fontWeight: '700' },

  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', flex: 1, marginRight: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metaText: { fontSize: 11, color: '#8F8F8F', marginLeft: 4 },
  metaTimeText: { fontSize: 11, color: RED, fontWeight: '700', marginLeft: 3 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4A4A4A',
    marginHorizontal: 6,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 9.5, fontWeight: '700', textTransform: 'capitalize' },

  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: { fontSize: 12, color: '#5C5C5C', marginTop: 6, fontWeight: '600' },
});