import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

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
  const [refreshing, setRefreshing] = useState(false);

  // ── Clinic Filter ──
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // ── Data fetching functions ──
  const getDoctorClinics = async () => {
    try {
      const response = await API.get('/auth/doctor-profile');
      if (response.data.success) {
        const doctorData = response.data.data;
        setDoctorName(doctorData.name);
        setClinicName(doctorData.hospitalName || '');
        if (doctorData.clinics && doctorData.clinics.length > 0) {
          setClinics(doctorData.clinics);
          // Set default selection if not already set
          if (!selectedClinicId) {
            setSelectedClinicId(doctorData.clinics[0]._id);
          }
        }
      }
    } catch (error) {
      console.log('CLINIC FETCH ERROR', error);
    }
  };

  const getDashboardData = async () => {
    try {
      const response = await API.get('/doctors/dashboard/stats');
      setStats(response.data.stats);
    } catch (error: any) {
      console.log('DOCTOR DASHBOARD ERROR', error?.response?.data || error);
    }
  };

  const getAppointments = async () => {
    try {
      const params: any = {};
      if (selectedClinicId) params.clinicId = selectedClinicId;
      const response = await API.get('/doctors/appointments/my', { params });
      setAppointments(response.data.appointments);
    } catch (error: any) {
      console.log('DOCTOR APPOINTMENTS ERROR', error?.response?.data || error);
    }
  };

  // ── Combined refresh ──
  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      getDoctorClinics(),
      getDashboardData(),
      getAppointments(),
    ]);
    setRefreshing(false);
  };

  // ── Initial load ──
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshAll();
      setLoading(false);
    };
    init();
  }, []);

  // ── Refetch when clinic filter changes ──
  useEffect(() => {
    if (!loading) {
      getAppointments();
    }
  }, [selectedClinicId]);

  // ── Auto-refresh on focus ──
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        refreshAll();
      }
    }, [loading])
  );

  // ── Optional: periodic refresh every 30 seconds (comment out if not needed)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!loading) {
  //       refreshAll();
  //     }
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, [loading]);

  // ── Filter Today's Appointments ──
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(item => {
    const dateStr = item.slotDate || item.appointmentDate || item.createdAt;
    if (!dateStr) return false;
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr === todayStr;
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      return d.toISOString().split('T')[0] === todayStr;
    } catch {
      return false;
    }
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

  const getSelectedClinicName = () => {
    if (!selectedClinicId) return 'All Clinics';
    const found = clinics.find(c => c._id === selectedClinicId);
    return found ? found.name : 'All Clinics';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor="#E63946"
            colors={['#E63946']}
          />
        }
      >
        {/* ── GREETING CARD ── */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingEmoji}>👋</Text>
            <View>
              <Text style={styles.greetingText}>{getTimeOfDay()}</Text>
              <Text style={styles.greetingName}>{doctorName}</Text>
            </View>
          </View>
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>
              {todayAppointments.length} Today
            </Text>
          </View>
        </View>

        {/* ── Clinic Filter Dropdown ── */}
        {clinics.length > 1 ? (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="business-outline" size={16} color="#E63946" />
            <Text style={styles.filterButtonText}>{getSelectedClinicName()}</Text>
            <Ionicons name="chevron-down" size={16} color="#8A8A8A" />
          </TouchableOpacity>
        ) : null}

        {/* ── STATS ── */}
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

        {/* ── TODAY'S APPOINTMENTS ── */}
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

      {/* ── Clinic Selection Modal ── */}
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
                    <Ionicons name="checkmark" size={20} color="#E63946" />
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
    </SafeAreaView>
  );
};

export default DoctorDashboardScreen;

// ── Styles ──
const RED = '#E63946';
const BG = '#FFFFFF';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#6B6B6B', fontSize: 13 },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  greetingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  greetingLeft: { flexDirection: 'row', alignItems: 'center' },
  greetingEmoji: { fontSize: 28, marginRight: 12 },
  greetingText: { fontSize: 14, fontWeight: '600', color: '#6B6B6B' },
  greetingName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  todayBadge: {
    backgroundColor: '#E63946',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  filterButtonText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginHorizontal: 6 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, gap: 8 },
  statCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EDEDED',
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNumber: { fontSize: 16, fontWeight: '800', color: RED, marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#8A8A8A', fontWeight: '600' },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', letterSpacing: -0.2 },
  sectionCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EDEDED',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(230,57,70,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  avatarSmallText: { color: RED, fontSize: 12, fontWeight: '700' },
  cardBody: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  patientName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metaText: { fontSize: 11, color: '#8A8A8A', marginLeft: 4 },
  metaTimeText: { fontSize: 11, color: RED, fontWeight: '700', marginLeft: 3 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#C4C4C4', marginHorizontal: 6 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 9.5, fontWeight: '700', textTransform: 'capitalize' },

  emptyCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  emptyText: { fontSize: 12, color: '#9B9B9B', marginTop: 6, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDEDED' },
  modalItemSelected: { backgroundColor: 'rgba(230,57,70,0.05)', borderRadius: 8 },
  modalItemText: { fontSize: 16, color: '#1A1A1A' },
  modalCloseBtn: { marginTop: 12, paddingVertical: 14, backgroundColor: '#F0F0F0', borderRadius: 12, alignItems: 'center' },
  modalCloseText: { color: '#1A1A1A', fontSize: 16, fontWeight: '600' },
});