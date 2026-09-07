import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useClinicProfile } from '../../context/ClinicProfileContext';


// ── Theme ──────────────────────────────────────────────────────────────────────
const C = {
  bg: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceHigh: '#F0F0F0',
  border: '#EDEDED',
  borderAccent: 'rgba(210,40,40,0.30)',
  red: '#D22828',
  redSoft: 'rgba(210,40,40,0.08)',
  redMid: 'rgba(210,40,40,0.15)',
  white: '#1A1A1A',
  muted: '#6B6B6B',
  dimmed: '#9B9B9B',
  textSub: '#5A5A5A',
};

// ── Date helpers ───────────────────────────────────────────────────────────────
const TODAY = new Date();
const fmtISO = (d: Date) => d.toISOString().split('T')[0];
const todayISO = fmtISO(TODAY);

// For display (e.g., "12 Aug 2026")
const formatDisplayDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
const todayDisplay = formatDisplayDate(TODAY);


const ClinicDashboardScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    rejectedAppointments: 0,
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clinicName, setClinicName] = useState('Clinic');
  const [clinicPhoto, setClinicPhoto] = useState<string | null>(null);   // add
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { updateClinic } = useClinicProfile();


  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, []);

  const getDashboardStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await API.get('/clinic/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.stats);
    } catch (error) {
      console.log('Dashboard Error', error);
    }
  };

  // ── Fetch Clinic Profile ──
  const fetchClinicProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await API.get('/clinic/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const clinicData = response.data.clinic;
        // Update context so the header updates
        updateClinic({
          name: clinicData?.name || 'Clinic',
          photo: clinicData?.photo || null,
        });
      }
    } catch (error) {
      console.log('Clinic Profile Error:', error);
    }
  };


  const getTodayAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await API.get('/clinic/appointments', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          dateFrom: todayISO,   // <-- changed from todayStr
          dateTo: todayISO,     // <-- changed from todayStr
          limit: 100,
        },
      });
      console.log('TODAY APPOINTMENTS =>', JSON.stringify(response.data, null, 2));
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.log('Appointments Error', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDashboardStats();
      getTodayAppointments();
      fetchClinicProfile();
    }, []),
  );

  // ── Stat Card ────────────────────────────────────────────────────────────────
  const StatCard = ({ value, label, accent }: { value: number; label: string; accent?: boolean }) => (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statNum, accent && styles.statNumAccent]}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );

  // ── Row ──────────────────────────────────────────────────────────────────────
  const AppointmentRow = ({ item, index }: { item: any; index: number }) => {
    const isPending = item.status === 'pending';
    const isCompleted = item.status === 'completed';
    const isRejected = item.status === 'rejected';

    const dotColor = isPending ? '#F59E0B' : isCompleted ? '#22C55E' : isRejected ? '#EF4444' : '#777777';
    const badgeBg = isPending ? 'rgba(245,158,11,0.12)' : isCompleted ? 'rgba(34,197,94,0.12)' : isRejected ? 'rgba(239,68,68,0.12)' : 'rgba(119,119,119,0.12)';
    const badgeBrd = isPending ? 'rgba(245,158,11,0.3)' : isCompleted ? 'rgba(34,197,94,0.3)' : isRejected ? 'rgba(239,68,68,0.3)' : 'rgba(119,119,119,0.3)';
    const badgeTxt = isPending ? '#F59E0B' : isCompleted ? '#22C55E' : isRejected ? '#EF4444' : '#777777';

    // Format time - show only time from slot
    const formatTime = (timeStr: string) => {
      if (!timeStr) return '—';
      return timeStr;
    };

    return (
      <View style={styles.apptRow}>
        <View style={[styles.apptDot, { backgroundColor: dotColor }]} />
        <View style={styles.apptInfo}>
          <Text style={styles.patientName} numberOfLines={1}>
            {item.patientName || item.patient?.name || 'Unknown Patient'}
          </Text>
          <Text style={styles.apptSub} numberOfLines={1}>
            {item.doctorName || item.doctor?.name || '—'} · {formatTime(item.slotTime || '—')}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBrd }]}>
          <Text style={[styles.badgeTxt, { color: badgeTxt }]}>{item.status}</Text>
        </View>
      </View>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
     

        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <StatCard value={stats.totalAppointments} label="Total" accent />
          <StatCard value={stats.pendingAppointments} label="Pending" />
          <StatCard value={stats.completedAppointments} label="Complet" />
          <StatCard value={stats.rejectedAppointments} label="Rejected" />
        </View>

        {/* ── TODAY'S APPOINTMENTS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <Text style={styles.sectionDate}>{todayDisplay}</Text>
          </View>

          {appointments.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTxt}>No appointments today</Text>
              <Text style={styles.emptySubTxt}>Enjoy your day! 🎉</Text>
            </View>
          ) : (
            <View style={styles.apptCard}>
              {appointments.map((item: any, index: number) => (
                <React.Fragment key={item._id || index}>
                  <AppointmentRow item={item} index={index} />
                  {index < appointments.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          )}

          {/* View All Button */}
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.viewAllTxt}>View All Appointments →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </Animated.ScrollView>
    </View>
  );
};

export default ClinicDashboardScreen;

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: {
    paddingHorizontal: 16,
    // paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',   // add
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  logoP: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 22,
  },
  logoPlus: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    fontSize: 11,
    marginTop: -6,
  },
  brandName: {
    color: C.white,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: -0.4,
  },
  brandSub: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  bookBtn: {
    backgroundColor: C.red,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bookBtnTxt: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statCardAccent: {
    backgroundColor: C.redSoft,
    borderColor: C.borderAccent,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: -0.5,
  },
  statNumAccent: {
    color: C.red,
  },
  statLbl: {
    fontSize: 10,
    color: C.dimmed,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Section
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.3,
  },
  sectionDate: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '500',
  },

  // Appointment card
  apptCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  apptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  apptInfo: {
    flex: 1,
    marginRight: 8,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
    marginBottom: 2,
  },
  apptSub: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 14,
  },

  // Badge
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeTxt: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTxt: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubTxt: {
    color: C.dimmed,
    fontSize: 12,
    marginTop: 4,
  },

  // View All Button
  viewAllBtn: {
    marginTop: 12,
    backgroundColor: C.redSoft,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.borderAccent,
  },
  viewAllTxt: {
    color: C.red,
    fontSize: 14,
    fontWeight: '700',
  },
});