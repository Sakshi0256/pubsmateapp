import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import API from '../../services/api';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SPECIALTY_ICONS: Record<string, string> = {
  Cardiologist: '🫀',
  Dermatologist: '🧴',
  Neurologist: '🧠',
  Orthopedic: '🦴',
  Pediatrician: '👶',
  Gynecologist: '🩺',
  Ophthalmologist: '👁️',
  default: '⚕️',
};

const getIcon = (s: string) => SPECIALTY_ICONS[s] ?? SPECIALTY_ICONS.default;

// ── Helper: convert working days ──
const getWorkingDaysString = (workingDays: number[]): string => {
  if (!workingDays || workingDays.length === 0) return 'No days set';
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sorted = [...workingDays].sort();
  if (sorted.length === 7) return 'All days';
  if (sorted.length === 5 && sorted.every(d => d >= 1 && d <= 5)) return 'Mon–Fri';
  if (sorted.length === 6 && sorted.every(d => d >= 1 && d <= 6)) return 'Mon–Sat';
  return sorted.map(d => dayNames[d]).join(', ');
};

// ── Doctor Card ──────────────────────────────────────────────────────────
const DoctorCard = ({
  item,
  index,
  isSelected,
  onSelect,
  onViewSlots,
  onSetTiming,
  onRemove,
}: {
  item: any;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onViewSlots: () => void;
  onSetTiming: () => void;
  onRemove: () => void;
}) => {
  if (!item || typeof item !== 'object' || !item._id) return null;

  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 420, delay: index * 80, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 420, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const name = String(item.name || '').trim() || 'Doctor';
  const displayName = name.startsWith('Dr') ? name : `Dr. ${name}`;
  const specialty = String(item.specialty || '').trim() || 'General Physician';
  const qual = String(item.qualification || '').trim() || null;
  const exp = String(item.experience || '').trim() || null;
  const hosp = String(item.hospitalName || '').trim() || null;
  const about = String(item.about || '').trim() || null;
  const fee = typeof item.consultationFee === 'number' ? item.consultationFee : 0;

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: opacityAnim }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onSelect}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start()}>
        <View style={[styles.card, isSelected && styles.selectedCard]}>
          {isSelected && <View style={styles.selectedStripe} />}

          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>{getIcon(specialty)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.feeBox}>
              <Text style={styles.feeLabel}>Fee</Text>
              <Text style={styles.feeAmount}>₹{fee}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            {qual && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillIcon}>🎓</Text>
                <Text style={styles.metaPillText}>{qual}</Text>
              </View>
            )}
            {exp && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillIcon}>⏳</Text>
                <Text style={styles.metaPillText}>{exp}</Text>
              </View>
            )}
            {hosp && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillIcon}>🏥</Text>
                <Text style={styles.metaPillText}>{hosp}</Text>
              </View>
            )}
          </View>

          {about && (
            <Text style={styles.about} numberOfLines={2}>{about}</Text>
          )}

          {item.timing && (
            <View style={styles.timingRow}>
              <Ionicons name="time-outline" size={12} color="#6B6B6B" />
              <Text style={styles.timingText}>
                {item.timing.start} – {item.timing.end}
              </Text>
            </View>
          )}

          {item.workingDays && item.workingDays.length > 0 && (
            <View style={styles.workingDaysRow}>
              <Ionicons name="calendar-outline" size={12} color="#6B6B6B" />
              <Text style={styles.workingDaysText}>
                {getWorkingDaysString(item.workingDays)}
              </Text>
            </View>
          )}

          {/* ── Action Buttons ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={onSetTiming}
            >
              <Text style={styles.actionBtnSecondaryText}>Set Timing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={onViewSlots}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnPrimaryText}>View Slots </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={onRemove}
            >
              <Text style={styles.actionBtnDangerText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────
const ClinicAppointmentsScreen = ({ navigation }: { navigation: any }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const refreshDoctors = useCallback(() => {
    fetchDoctors();
  }, []);

  useAutoRefresh(refreshDoctors);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/clinic/doctors');
      if (response.data.success && Array.isArray(response.data.doctors)) {
        const valid = response.data.doctors.filter(doc => doc && doc._id && doc.name);
        setDoctors(valid);
        if (valid.length === 0) setError('No active doctors found.');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (error: any) {
      console.log('Fetch doctors error:', error);
      setError(error?.response?.data?.message || 'Unable to connect.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlots = (doctor: any) => {
    navigation.navigate('Dashboard', {
      screen: 'DoctorSlots',
      params: {
        doctorId: doctor._id,
        doctorName: doctor.name,
      },
    });
  };

  const handleSetTiming = (doctor: any) => {
    navigation.navigate('Dashboard', {
      screen: 'SetDoctorTiming',
      params: {
        doctorId: doctor._id,
        doctorName: doctor.name,
        timing: doctor.timing,
        workingDays: doctor.workingDays,
      },
    });
  };

  const handleRemove = (doctor: any) => {
    Alert.alert(
      'Remove Doctor',
      `Are you sure you want to remove ${doctor.name} from your clinic?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.delete(`/clinic/doctors/${doctor._id}`);
              global.showSuccess('Doctor removed successfully');
              fetchDoctors(); // refresh
            } catch (error: any) {
              global.showError(error?.response?.data?.message || 'Failed to remove doctor');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.headerBlock,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.inviteBtn}
              onPress={() => navigation.navigate('Dashboard', { screen: 'InviteDoctor' })}
            >
              <Ionicons name="mail-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Invite Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('Dashboard', { screen: 'AddDoctor' })}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.actionBtnText}>Add Doctor</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.pageTitle}>Our Specialists</Text>
          <Text style={styles.pageSubtitle}>
            Tap "Set Timing" to configure schedule, then "View Slots" to see availability.
          </Text>
        </Animated.View>

        {!loading && !error && doctors.length > 0 && (
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{doctors.length}</Text>
              <Text style={styles.statLabel}>Doctors</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Online</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Today</Text>
              <Text style={styles.statLabel}>Slots</Text>
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#D62828" />
            <Text style={styles.loadingText}>Loading specialists…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchDoctors}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && doctors.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={styles.errorEmoji}>🗓️</Text>
            <Text style={styles.errorText}>No doctors available right now.</Text>
          </View>
        )}

        {!loading && !error && doctors.map((item, index) => (
          <DoctorCard
            key={item._id}
            item={item}
            index={index}
            isSelected={selectedDoctor?._id === item._id}
            onSelect={() => setSelectedDoctor(prev => prev?._id === item._id ? null : item)}
            onViewSlots={() => handleViewSlots(item)}
            onSetTiming={() => handleSetTiming(item)}
            onRemove={() => handleRemove(item)}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

export default ClinicAppointmentsScreen;

// ── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  bgBlob1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(168,213,186,0.10)', top: -60, right: -80 },
  bgBlob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(100,180,140,0.07)', bottom: 120, left: -60 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },
  headerBlock: { marginBottom: 24 },
  headerActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2F7A4F', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 6, flex: 1, justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D62828', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 6, flex: 1, justifyContent: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', letterSpacing: -1, lineHeight: 40, marginBottom: 8 },
  pageSubtitle: { color: '#6B7C73', fontSize: 14, lineHeight: 21 },
  statsStrip: { flexDirection: 'row', backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: '#EDEDED', padding: 16, marginBottom: 24, alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#D62828', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { color: '#8A8A8A', fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 30, backgroundColor: '#EDEDED' },
  centerBox: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { color: '#8A8A8A', marginTop: 16, fontSize: 14 },
  errorEmoji: { fontSize: 40, marginBottom: 12 },
  errorText: { color: '#6B7C73', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  retryBtn: { marginTop: 20, paddingHorizontal: 28, paddingVertical: 12, backgroundColor: 'rgba(168,213,186,0.2)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168,213,186,0.5)' },
  retryText: { color: '#D62828', fontWeight: '700', fontSize: 14 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDEDED', borderRadius: 24, padding: 18, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  selectedCard: { borderColor: 'rgba(168,213,186,0.7)', backgroundColor: 'rgba(168,213,186,0.08)' },
  selectedStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: '#D62828', borderTopLeftRadius: 24, borderBottomLeftRadius: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  avatarContainer: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(168,213,186,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(168,213,186,0.3)' },
  avatarEmoji: { fontSize: 24 },
  headerInfo: { flex: 1 },
  name: { color: '#1A1A1A', fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specialtyBadge: { backgroundColor: 'rgba(168,213,186,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(168,213,186,0.35)' },
  specialtyText: { color: '#2F7A4F', fontSize: 12, fontWeight: '600' },
  selectedBadge: { backgroundColor: 'rgba(168,213,186,0.3)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  selectedBadgeText: { color: '#2F7A4F', fontSize: 12, fontWeight: '700' },
  feeBox: { alignItems: 'flex-end' },
  feeLabel: { color: '#8A9E94', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  feeAmount: { color: '#1A1A1A', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  divider: { height: 1, backgroundColor: '#EDEDED', marginBottom: 14 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  metaPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#E8E8E8' },
  metaPillIcon: { fontSize: 12, marginRight: 5 },
  metaPillText: { color: '#6B7C73', fontSize: 12, fontWeight: '500' },
  about: { color: '#6E8A7A', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  actionBtnSecondary: { backgroundColor: '#F5F5F5', borderColor: '#E8E8E8' },
  actionBtnSecondaryText: { color: '#6B6B6B', fontSize: 13, fontWeight: '600' },
  actionBtnPrimary: { backgroundColor: 'rgba(168,213,186,0.2)', borderColor: 'rgba(168,213,186,0.5)' },
  actionBtnPrimaryText: { color: '#2F7A4F', fontSize: 13, fontWeight: '700' },
  actionBtnDanger: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  actionBtnDangerText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  disabledBtn: { backgroundColor: '#E0E0E0', borderColor: '#CCCCCC' },
  disabledText: { color: '#999999' },
  timingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  timingText: { fontSize: 12, color: '#6B6B6B', marginLeft: 4 },
  workingDaysRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  workingDaysText: { fontSize: 12, color: '#6B6B6B', marginLeft: 4 },
});