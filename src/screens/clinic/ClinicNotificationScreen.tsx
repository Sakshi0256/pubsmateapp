import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import API from '../../services/api';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useCallback } from 'react';

const API_BASE = 'http://pubsmate-backend.vercel.app';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  consultationFee: number;
  hospitalName: string;
  about: string;
  email?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
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

// ── Doctor Card ────────────────────────────────────────────────────────────────
const DoctorCard = ({
  item,
  index,
  isSelected,
  onSelect,
  onViewSlots,
}: {
  item: Doctor;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onViewSlots: () => void;
}) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 420, delay: index * 80, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 420, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const displayName = item.name?.trim()
    ? item.name.startsWith('Dr') ? item.name : `Dr. ${item.name}`
    : 'Doctor';
  const displaySpecialty = item.specialty?.trim() || 'General Physician';
  const displayQual = item.qualification?.trim() || null;
  const displayExp = item.experience?.trim() || null;
  const displayHosp = item.hospitalName?.trim() || null;
  const displayAbout = item.about?.trim() || null;

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: opacityAnim }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onSelect}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start()}>
        <View style={[styles.card, isSelected && styles.selectedCard]}>
          {isSelected && <View style={styles.selectedStripe} />}

          {/* Top row */}
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>{getIcon(displaySpecialty)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{displaySpecialty}</Text>
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
              <Text style={styles.feeAmount}>₹{item.consultationFee ?? 0}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Meta pills */}
          <View style={styles.metaRow}>
            {displayQual && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillIcon}>🎓</Text>
                <Text style={styles.metaPillText}>{displayQual}</Text>
              </View>
            )}
            {displayExp && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillIcon}>⏳</Text>
                <Text style={styles.metaPillText}>{displayExp}</Text>
              </View>
            )}
            {displayHosp && (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillIcon}>🏥</Text>
                <Text style={styles.metaPillText}>{displayHosp}</Text>
              </View>
            )}
          </View>

          {displayAbout && (
            <Text style={styles.about} numberOfLines={2}>{displayAbout}</Text>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {/* <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={onSelect}
              activeOpacity={0.8}>
              <Text style={styles.actionBtnSecondaryText}>
                {isSelected ? '✓ Selected' : 'Select'}
              </Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={onViewSlots}
              activeOpacity={0.8}>
              <Text style={styles.actionBtnPrimaryText}>View Slots →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────
const ClinicAppointmentsScreen = ({ navigation }: { navigation: any }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
}, []);

const refreshDoctors = useCallback(() => {
  fetchDoctors();
}, []);

useAutoRefresh(refreshDoctors);

  // const fetchDoctors = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const res = await fetch(`${API_BASE}/api/v1/doctors`);
  //     const data = await res.json();
  //     if (data.success && Array.isArray(data.doctors)) {
  //       setDoctors(data.doctors);
  //     } else {
  //       setError('Unexpected response from server.');
  //     }
  //   } catch {
  //     setError('Unable to connect. Please check your network.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchDoctors = async () => {
  try {
    setLoading(true);
    setError(null);
    // ✅ Use clinic-specific endpoint
    const response = await API.get('/clinic/doctors');
    if (response.data.success && Array.isArray(response.data.doctors)) {
      setDoctors(response.data.doctors);
    } else {
      setError('Unexpected response from server.');
    }
  } catch (error: any) {
    console.log('Fetch doctors error:', error);
    setError(error?.response?.data?.message || 'Unable to connect. Please check your network.');
  } finally {
    setLoading(false);
  }
};


  const handleViewSlots = (
    doctor: Doctor
  ) => {

    navigation.navigate(
      'Dashboard',
      {
        screen: 'DoctorSlots',
        params: {
          doctorId: doctor._id,
          doctorName: doctor.name,
        },
      }
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
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View
          style={[styles.headerBlock, {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          }]}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              navigation.navigate(
                'Dashboard',
                {
                  screen: 'AddDoctor',
                }
              );
            }}>

            <Text style={styles.addBtnTxt}>
              + Add Doctor
            </Text>
          </TouchableOpacity>
          <View style={styles.headerTopRow}>
           
          </View>
          <Text style={styles.pageTitle}>Our Specialists</Text>
          <Text style={styles.pageSubtitle}>
            Tap "View Slots" to see availability & book an appointment
          </Text>
        </Animated.View>

        {/* Stats strip */}
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
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

export default ClinicAppointmentsScreen;

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  bgBlob1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(168,213,186,0.10)', top: -60, right: -80 },
  bgBlob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(100,180,140,0.07)', bottom: 120, left: -60 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 56 },

  headerBlock: { marginBottom: 24 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  logoMark: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#D62828', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: -0.5 },
  clinicLabel: { color: '#D62828', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  pageTitle: { fontSize: 36, fontWeight: '800', color: '#1A1A1A', letterSpacing: -1, lineHeight: 40, marginBottom: 8 },
  pageSubtitle: { color: '#6B7C73', fontSize: 14, lineHeight: 21 },

  statsStrip: { flexDirection: 'row', backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: '#EDEDED', padding: 16, marginBottom: 24, alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#D62828', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { color: '#8A8A8A', fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 30, backgroundColor: '#EDEDED' },
  addBtn: {
    backgroundColor: '#D62828',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addBtnTxt: {
    color: '#fff',
    fontWeight: '700',
  },

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
});