import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api'; // ✅ Use API instance

const RED = '#E63946';
const BG = '#0A0000';

const statusStyles: Record<string, { border: string; bg: string; text: string }> = {
  available: { border: 'rgba(34,197,94,0.35)', bg: 'rgba(34,197,94,0.08)', text: '#2ECC71' },
  unavailable: { border: 'rgba(230,57,70,0.35)', bg: 'rgba(230,57,70,0.08)', text: RED },
  booked: { border: 'rgba(76,154,255,0.35)', bg: 'rgba(76,154,255,0.08)', text: '#4C9AFF' },
  past: { border: 'rgba(136,136,136,0.25)', bg: 'rgba(136,136,136,0.05)', text: '#6B6B6B' },
};

const ManageAvailableSlotsScreen = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Get Slots ──
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

  // ── Toggle Slot ──
  const toggleSlot = async (id: string) => {
    try {
      await API.put(`/slots/${id}/toggle`);
      await getSlots(); // Refresh list
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to update slot');
    }
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

  // ── Group slots by date ──
  const grouped: Record<string, any[]> = {};
  slots.forEach((item) => {
    const key = new Date(item.slotDate).toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const doctorName = slots.length > 0 ? slots[0]?.doctor?.name : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.header}>Available Slots</Text>
          {doctorName ? <Text style={styles.doctorName}>Dr. {doctorName}</Text> : null}
        </View>
        <Text style={styles.headerCount}>{slots.length}</Text>
      </View>

      <Text style={styles.subHeader}>Tap a slot to enable or disable it</Text>

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

      {slots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={22} color="#5C5C5C" />
          <Text style={styles.emptyText}>No slots available</Text>
        </View>
      ) : (
        Object.entries(grouped).map(([date, dateSlots]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateLabel}>
              {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>

            <View style={styles.chipsWrap}>
              {dateSlots.map((item: any) => {
                const isPast = item.isPast || false;
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
                    <Text style={[styles.chipTime, { color: disabled ? style.text : '#FFFFFF' }]}>
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
        ))
      )}
    </ScrollView>
  );
};

export default ManageAvailableSlotsScreen;

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#8F8F8F', fontSize: 13 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  header: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  doctorName: { fontSize: 12, color: RED, fontWeight: '600', marginTop: 2 },
  headerCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8F8F8F',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  subHeader: { fontSize: 12, color: '#8F8F8F', marginTop: 10, marginBottom: 14 },

  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  legendText: { fontSize: 10.5, color: '#8F8F8F', fontWeight: '600' },

  dateGroup: { marginBottom: 18 },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8F8F8F',
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
  emptyText: { color: '#5C5C5C', fontSize: 12, fontWeight: '600', marginTop: 6 },
});