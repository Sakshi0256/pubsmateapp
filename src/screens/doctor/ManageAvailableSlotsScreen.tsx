import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';

const RED = '#E63946';
const BG = '#FFFFFF';

const statusStyles: Record<string, { border: string; bg: string; text: string }> = {
  available: { border: 'rgba(34,197,94,0.35)', bg: 'rgba(34,197,94,0.08)', text: '#16A34A' },
  unavailable: { border: 'rgba(230,57,70,0.35)', bg: 'rgba(230,57,70,0.08)', text: RED },
  booked: { border: 'rgba(59,130,246,0.35)', bg: 'rgba(59,130,246,0.08)', text: '#2563EB' },
  past: { border: 'rgba(136,136,136,0.25)', bg: 'rgba(136,136,136,0.06)', text: '#8A8A8A' },
};

// ── Week helpers (Mon–Sun) ──
const getWeekRange = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = today.getDay(); // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { today, monday, sunday };
};

// ── Check if a slot's time has already passed (only matters for today) ──
const isSlotTimePast = (slotDate: string, slotTime: string) => {
  const now = new Date();
  const d = new Date(slotDate);
  const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dOnly.getTime() !== todayOnly.getTime()) return false; // only checks today

  const timeParts = slotTime.match(/(\d+):(\d+)\s*([AP]M)/i);
  if (!timeParts) return false;

  let hour = parseInt(timeParts[1]);
  const minute = parseInt(timeParts[2]);
  const ampm = timeParts[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  const slotMinutes = hour * 60 + minute;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slotMinutes <= currentMinutes;
};

const ManageAvailableSlotsScreen = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);

  const getSlots = async () => {
    try {
      setLoading(true);
      const response = await API.get('/slots');
      setSlots(response.data.slots || []);
    } catch (error: any) {
      console.log('SLOTS ERROR', error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = async (id: string) => {
    try {
      await API.put(`/slots/${id}/toggle`);
      await getSlots();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to update slot');
    }
  };

  // ── Mark all of today's available slots as unavailable ──
  const markTodayUnavailable = async () => {
    const { today } = getWeekRange();
    const todaySlots = slots.filter((item) => {
      const d = new Date(item.slotDate);
      const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return (
        dOnly.getTime() === today.getTime() &&
        item.status === 'available' &&
        !item.isPast &&
        !isSlotTimePast(item.slotDate, item.slotTime)
      );
    });

    if (todaySlots.length === 0) {
      Alert.alert('No Slots', 'There are no available slots today to update.');
      return;
    }

    Alert.alert(
      'Confirm',
      `Mark all ${todaySlots.length} slots as unavailable for today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Mark All',
          style: 'destructive',
          onPress: async () => {
            try {
              setBulkLoading(true);
              await Promise.all(todaySlots.map((item) => API.put(`/slots/${item._id}/toggle`)));
              await getSlots();
            } catch (error: any) {
              Alert.alert('Error', 'Some slots could not be updated. Please try again.');
            } finally {
              setBulkLoading(false);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    getSlots();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.loaderText}>Loading Slots...</Text>
      </View>
    );
  }

  const { today, sunday } = getWeekRange();

  // ── Filter to current calendar week (today → Sunday), drop everything before today ──
  const weekSlots = slots.filter((item) => {
    const d = new Date(item.slotDate);
    const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dOnly.getTime() >= today.getTime() && dOnly.getTime() <= sunday.getTime();
  });

  // ── Group filtered slots by date ──
  const grouped: Record<string, any[]> = {};
  weekSlots.forEach((item) => {
    const key = new Date(item.slotDate).toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const doctorName = slots.length > 0 ? slots[0]?.doctor?.name : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.header}>Available Slots</Text>
          {doctorName ? <Text style={styles.doctorName}>Dr. {doctorName}</Text> : null}
        </View>
        <Text style={styles.headerCount}>{weekSlots.length}</Text>
      </View>

      <Text style={styles.subHeader}>Tap a slot to enable or disable it · This week only</Text>

      {/* BULK ACTION */}
      <TouchableOpacity
        style={styles.bulkButton}
        onPress={markTodayUnavailable}
        disabled={bulkLoading}
        activeOpacity={0.85}>
        {bulkLoading ? (
          <ActivityIndicator color={RED} size="small" />
        ) : (
          <>
            <Ionicons name="close-circle-outline" size={16} color={RED} />
            <Text style={styles.bulkButtonText}>Mark All Today Unavailable</Text>
          </>
        )}
      </TouchableOpacity>

      {/* LEGEND */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusStyles.available.text }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusStyles.unavailable.text }]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusStyles.booked.text }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      {sortedDates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={22} color="#B0B0B0" />
          <Text style={styles.emptyText}>No slots this week</Text>
        </View>
      ) : (
        sortedDates.map((date) => {
          const dateSlots = grouped[date];
          return (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>
                {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>

              <View style={styles.chipsWrap}>
                {dateSlots.map((item: any) => {
                  const timeExpired = isSlotTimePast(item.slotDate, item.slotTime);
                  const isPast = item.isPast || timeExpired;
                  const key = isPast ? 'past' : item.status;
                  const style = statusStyles[key] || statusStyles.available;
                  const disabled = item.status === 'booked' || isPast;

                  return (
                    <TouchableOpacity
                      key={item._id}
                      disabled={disabled}
                      activeOpacity={0.75}
                      onPress={() => toggleSlot(item._id)}
                      style={[
                        styles.chip,
                        { backgroundColor: style.bg, borderColor: style.border },
                      ]}>
                      <Text style={[styles.chipTime, { color: style.text }]}>
                        {item.slotTime}
                      </Text>
                      <Text style={[styles.chipStatus, { color: style.text }]}>
                        {isPast ? 'Expired' : item.status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default ManageAvailableSlotsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#6B6B6B', fontSize: 13 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  header: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 },
  doctorName: { fontSize: 12, color: RED, fontWeight: '600', marginTop: 2 },
  headerCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  subHeader: { fontSize: 12, color: '#8A8A8A', marginTop: 10, marginBottom: 14 },

  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(230,57,70,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.3)',
    borderRadius: 12,
    paddingVertical: 11,
    marginBottom: 16,
  },
  bulkButtonText: { color: RED, fontSize: 13, fontWeight: '700' },

  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  legendText: { fontSize: 10.5, color: '#8A8A8A', fontWeight: '600' },

  dateGroup: { marginBottom: 18 },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipTime: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  chipStatus: { fontSize: 9.5, fontWeight: '700', textTransform: 'capitalize' },

  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { color: '#9B9B9B', fontSize: 12, fontWeight: '600', marginTop: 6 },
});