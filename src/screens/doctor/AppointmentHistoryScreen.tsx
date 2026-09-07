import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  FlatList,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';

const RED = '#E63946';
const BG = '#FFFFFF';

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'rgba(245,158,11,0.14)', text: '#F5A623', icon: 'time-outline' },
  accepted: { bg: 'rgba(59,130,246,0.14)', text: '#4C9AFF', icon: 'checkmark-circle-outline' },
  completed: { bg: 'rgba(34,197,94,0.14)', text: '#2ECC71', icon: 'checkmark-done-circle-outline' },
  rejected: { bg: 'rgba(230,57,70,0.14)', text: RED, icon: 'close-circle-outline' },
};

type FilterStatus = 'all' | 'pending' | 'accepted' | 'completed' | 'rejected';

const AppointmentHistoryScreen = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  // Clinic filter
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList>(null);

  // ── Fetch clinics ──
  const getDoctorClinics = async () => {
    try {
      const response = await API.get('/auth/doctor-profile');
      if (response.data.success) {
        const doctorData = response.data.data;
        if (doctorData.clinics && doctorData.clinics.length > 0) {
          setClinics(doctorData.clinics);
          setSelectedClinicId(doctorData.clinics[0]._id);
        }
      }
    } catch (error) {
      console.log('CLINIC FETCH ERROR', error);
    }
  };

  // ── Get appointments ──
  const getAppointments = async () => {
    try {
      const params: any = {};
      if (selectedClinicId) params.clinicId = selectedClinicId;
      const response = await API.get('/doctors/appointments/my', { params });
      setAppointments(response.data.appointments);
      applyFilter(activeFilter, response.data.appointments);
    } catch (error: any) {
      console.log('APPOINTMENTS ERROR', error?.response?.data || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── Apply status filter ──
  const applyFilter = (filter: FilterStatus, data = appointments) => {
    if (filter === 'all') {
      setFilteredAppointments(data);
    } else {
      setFilteredAppointments(data.filter(item => item.status === filter));
    }
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setActiveFilter(filter);
    applyFilter(filter);
  };

  // ── Refresh ──
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getAppointments();
  }, [selectedClinicId]);

  // ── Update Status ──
  const updateStatus = async (id: string, action: 'accept' | 'reject' | 'complete') => {
    try {
      const response = await API.put(`/doctors/appointments/${id}/${action}`);
      showAlert('Success', `Appointment ${action}ed successfully`);
      await getAppointments();
    } catch (error: any) {
      showAlert('Error', error?.response?.data?.message || 'Failed to update status');
    }
  };

  useEffect(() => {
    const init = async () => {
      await getDoctorClinics();
      await getAppointments();
    };
    init();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!loading) getAppointments();
  }, [selectedClinicId]);

  const getSelectedClinicName = () => {
    if (!selectedClinicId) return 'All Clinics';
    const found = clinics.find(c => c._id === selectedClinicId);
    return found ? found.name : 'All Clinics';
  };

  // ── Render item ──
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const status = statusColors[item.status] || statusColors.pending;
    const patientName = item.patientName || item.patient?.name || 'Unknown Patient';
    const doctorName = item.doctor?.name || item.doctorName || 'Doctor';

    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30 * (index + 1), 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>{patientName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardHeader}>
            <Text style={styles.patientName} numberOfLines={1}>{patientName}</Text>
            <Text style={styles.doctorName}>Dr. {doctorName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color={status.text} />
            <Text style={[styles.statusText, { color: status.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardMiddle}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#7A7A7A" />
            <Text style={styles.detailText}>
              {new Date(item.slotDate || item.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          {item.slotTime ? (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color={RED} />
              <Text style={[styles.detailText, { fontWeight: '700', color: RED }]}>
                {item.slotTime}
              </Text>
            </View>
          ) : null}
          {item.mobile ? (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={14} color="#7A7A7A" />
              <Text style={styles.detailText}>{item.mobile}</Text>
            </View>
          ) : null}
        </View>

        {/* Action buttons */}
        {item.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => updateStatus(item._id, 'accept')}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => updateStatus(item._id, 'reject')}
            >
              <Ionicons name="close" size={16} color={RED} />
              <Text style={[styles.actionBtnText, { color: RED }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'accepted' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.completeBtn, { width: '100%' }]}
            onPress={() => updateStatus(item._id, 'complete')}
          >
            <Ionicons name="checkmark-done" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Mark Completed</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  // ── Header with filter tabs ──
  const renderHeader = () => (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Appointments</Text>
        <Text style={styles.headerCount}>{filteredAppointments.length}</Text>
      </View>

      {/* Clinic Filter */}
      {clinics.length > 0 && (
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="business-outline" size={16} color={RED} />
          <Text style={styles.filterButtonText}>{getSelectedClinicName()}</Text>
          <Ionicons name="chevron-down" size={16} color="#8A8A8A" />
        </TouchableOpacity>
      )}

      {/* Status Tabs */}
      <View style={styles.tabsContainer}>
        {(['all', 'pending', 'accepted', 'completed', 'rejected'] as FilterStatus[]).map(status => {
          const count = status === 'all' ? appointments.length : appointments.filter(a => a.status === status).length;
          const isActive = activeFilter === status;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleFilterChange(status)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
              <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  // ── Empty state ──
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-clear-outline" size={56} color="#C4C4C4" />
      <Text style={styles.emptyTitle}>No appointments</Text>
      <Text style={styles.emptySub}>No appointments match your filters.</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.loaderText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <FlatList
        ref={listRef}
        data={filteredAppointments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RED} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Clinic Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Clinic</Text>
            <FlatList
              data={clinics}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selectedClinicId === item._id && styles.modalItemSelected]}
                  onPress={() => { setSelectedClinicId(item._id); setModalVisible(false); }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {selectedClinicId === item._id && <Ionicons name="checkmark" size={20} color={RED} />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AppointmentHistoryScreen;

// ── Styles ──
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#6B6B6B', fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight : 0) + 12 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  headerCount: { fontSize: 13, fontWeight: '700', color: '#8A8A8A', backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },

  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EDEDED', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, alignSelf: 'flex-start' },
  filterButtonText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginHorizontal: 6 },

  tabsContainer: { flexDirection: 'row', marginBottom: 14, gap: 6 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'transparent' },
  tabActive: { backgroundColor: 'rgba(230,57,70,0.08)', borderColor: RED },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6B6B6B' },
  tabTextActive: { color: RED },
  tabCount: { fontSize: 10, fontWeight: '700', color: '#9B9B9B', marginLeft: 6, backgroundColor: '#E8E8E8', paddingHorizontal: 4, borderRadius: 4, minWidth: 16, textAlign: 'center' },
  tabCountActive: { color: RED, backgroundColor: 'rgba(230,57,70,0.15)' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDEDED', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  patientAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(230,57,70,0.10)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: RED, fontSize: 14, fontWeight: '700' },
  cardHeader: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  doctorName: { fontSize: 12, color: '#6B6B6B' },

  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  cardMiddle: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#7A7A7A' },

  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 5 },
  acceptBtn: { backgroundColor: RED },
  rejectBtn: { backgroundColor: 'rgba(230,57,70,0.08)', borderWidth: 1, borderColor: 'rgba(230,57,70,0.3)' },
  completeBtn: { backgroundColor: '#2ECC71' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#8A8A8A', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDEDED' },
  modalItemSelected: { backgroundColor: 'rgba(230,57,70,0.05)', borderRadius: 8 },
  modalItemText: { fontSize: 16, color: '#1A1A1A' },
  modalCloseBtn: { marginTop: 12, paddingVertical: 14, backgroundColor: '#F0F0F0', borderRadius: 12, alignItems: 'center' },
  modalCloseText: { color: '#1A1A1A', fontSize: 16, fontWeight: '600' },
});