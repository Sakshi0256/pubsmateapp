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
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../services/api';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Appointment {
  _id: string;
  patientName: string;
  patient?: { name: string; email: string };
  doctorName: string;
  doctor?: { name: string; email: string };
  slotTime: string;
  slotDate?: string;
  createdAt?: string;
  updatedAt?: string;
  date: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
}

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
// ── Helper Functions ──────────────────────────────────────────────────────────
// const formatDate = (dateString: string | undefined) => {
//   if (!dateString) {
//     return 'No Date';
//   }
  
//   try {
//     // If it's already a formatted string like "2024-01-15"
//     if (typeof dateString === 'string') {
//       // Check if it's in YYYY-MM-DD format
//       if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
//         const [year, month, day] = dateString.split('-');
//         return `${day}/${month}/${year}`;
//       }
      
//       // Try to parse as date
//       const date = new Date(dateString);
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleDateString('en-IN', {
//           day: '2-digit',
//           month: 'short',
//           year: 'numeric',
//         });
//       }
      
//       // If all fails, return the original string
//       return dateString;
//     }
    
//     return 'Invalid Date';
//   } catch (error) {
//     return dateString || 'Error';
//   }
// };

// ── Helper Functions ──────────────────────────────────────────────────────────
const formatDisplayDate = (dateString: string | undefined) => {
  if (!dateString) return 'No Date';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If it's already a string like "2024-01-15", try parsing manually
      const parts = dateString.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }
      }
      return dateString; // fallback
    }
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString || 'Invalid';
  }
};


// ── Main Screen ────────────────────────────────────────────────────────────────
const ClinicAppointmentsScreen = ({ navigation }: { navigation: any }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;


  
 useEffect(() => {
  Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
}, []);

const refreshAppointments = useCallback(() => {
  fetchAppointments();
}, []);

useAutoRefresh(refreshAppointments);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, searchQuery, dateFrom, dateTo]);

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(app => 
        (app.patientName?.toLowerCase().includes(query) || 
         app.patient?.name?.toLowerCase().includes(query) ||
         app.doctorName?.toLowerCase().includes(query) ||
         app.doctor?.name?.toLowerCase().includes(query))
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(app => {
        const appDate = app.date || app.slotDate || app.createdAt;
        return appDate ? appDate >= dateFrom : true;
      });
    }
    if (dateTo) {
      filtered = filtered.filter(app => {
        const appDate = app.date || app.slotDate || app.createdAt;
        return appDate ? appDate <= dateTo : true;
      });
    }

    filtered.sort((a, b) => {
      try {
        const dateA = new Date(a.date || a.slotDate || a.createdAt || '');
        const dateB = new Date(b.date || b.slotDate || b.createdAt || '');
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      } catch {
        return 0;
      }
    });

    setFilteredAppointments(filtered);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      const response = await API.get('/clinic/appointments', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 },
      });

      console.log('Appointments Response:', JSON.stringify(response.data, null, 2));
      
      setAppointments(response.data.appointments || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch appointments');
      console.log('Appointments Error', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
      pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
      accepted: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3B82F6' },
      completed: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#22C55E' },
      rejected: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' },
    };
    const style = colors[status] || colors.pending;

    return (
      <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
        <Text style={[styles.badgeText, { color: style.text }]}>{status}</Text>
      </View>
    );
  };

  const AppointmentCard = ({ item }: { item: Appointment }) => {
    // Get date from multiple possible fields
    const dateValue = item.date || item.slotDate || item.createdAt || item.updatedAt;
   const formattedDate = formatDisplayDate(dateValue);
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>
              {item.patientName || item.patient?.name || 'Unknown Patient'}
            </Text>
            <Text style={styles.doctorName}>
              {item.doctorName || item.doctor?.name || 'Unknown Doctor'}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{item.slotTime || '—'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
     <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Appointments</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by patient or doctor..."
              placeholderTextColor={C.dimmed}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['all', 'pending', 'accepted', 'completed', 'rejected'].map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                style={[
                  styles.filterChip,
                  statusFilter === status && styles.filterChipActive,
                ]}>
                <Text style={[
                  styles.filterChipText,
                  statusFilter === status && styles.filterChipTextActive,
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.dateRow}>
            {/* <TextInput
              style={styles.dateInput}
              placeholder="From Date (YYYY-MM-DD)"
              placeholderTextColor={C.dimmed}
              value={dateFrom}
              onChangeText={setDateFrom}
            />
            <TextInput
              style={styles.dateInput}
              placeholder="To Date (YYYY-MM-DD)"
              placeholderTextColor={C.dimmed}
              value={dateTo}
              onChangeText={setDateTo}
            /> */}
          </View>
        </View>

        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredAppointments.length}</Text>
            <Text style={styles.statLabel}>Showing</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {filteredAppointments.filter(a => a.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>
              {filteredAppointments.filter(a => a.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <ScrollView
          style={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.red} />
          }>
          
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={C.red} />
              <Text style={styles.loadingText}>Loading appointments…</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchAppointments}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredAppointments.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorEmoji}>📋</Text>
              <Text style={styles.errorText}>No appointments found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : (
            <View style={styles.listContent}>
              {filteredAppointments.map((item) => (
                <AppointmentCard key={item._id} item={item} />
              ))}
            </View>
          )}
          
          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default ClinicAppointmentsScreen;

// ── Styles (same as before) ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    // paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: 4 },
  backBtnText: { color: C.white, fontSize: 28, fontWeight: '300' },
  headerTitle: { color: C.white, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  headerRight: { width: 32 },
  filtersContainer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: C.white, fontSize: 14, paddingVertical: 10 },
  clearBtn: { padding: 4 },
  clearBtnText: { color: C.dimmed, fontSize: 14 },
  filterScroll: { marginBottom: 12 },
  filterChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: C.surface,
  },
  filterChipActive: { backgroundColor: C.redSoft, borderColor: C.borderAccent },
  filterChipText: { fontSize: 12, color: C.muted, fontWeight: '600' },
  filterChipTextActive: { color: C.red },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateInput: {
    flex: 1,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: C.white,
    fontWeight: '500',
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statValue: { color: C.white, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { color: C.dimmed, fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 30, backgroundColor: C.border },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 18, paddingTop: 14 },
  appointmentCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: { flex: 1, marginRight: 12 },
  patientName: { color: C.white, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  doctorName: { color: C.muted, fontSize: 13, fontWeight: '500' },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  detailItem: { alignItems: 'center', flex: 1 },
  detailLabel: { color: C.dimmed, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { color: C.textSub, fontSize: 13, fontWeight: '600' },
  detailDivider: { width: 1, backgroundColor: C.border },
  centerBox: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { color: C.muted, marginTop: 16, fontSize: 14 },
  errorEmoji: { fontSize: 40, marginBottom: 12 },
  errorText: { color: C.muted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  emptySubtext: { color: C.dimmed, fontSize: 13, marginTop: 8 },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: C.redSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.borderAccent,
  },
  retryText: { color: C.red, fontWeight: '700', fontSize: 14 },
});