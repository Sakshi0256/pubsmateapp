import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';

const DoctorSlotsScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { doctorId, doctorName } = route.params;
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log('📦 route.params:', route.params);
}, []);

  useEffect(() => {
    getSlots();
  }, []);

  const getSlots = async () => {
    try {
      const response = await API.get(`/slots/doctor/${doctorId}`);
      const allSlots = response.data.slots || [];

      // Filter only available & future slots
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const filteredSlots = allSlots.filter((item: any) => {
        if (item.status !== 'available') return false;

        const slotDate = item.slotDate;
        if (slotDate < todayStr) return false;
        if (slotDate > todayStr) return true;

        const timeStr = item.slotTime;
        const timeParts = timeStr.match(/(\d+):(\d+)\s*([AP]M)/i);
        if (!timeParts) return true;
        let hour = parseInt(timeParts[1]);
        const minute = parseInt(timeParts[2]);
        const ampm = timeParts[3].toUpperCase();
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        const slotMinutes = hour * 60 + minute;
        const currentMinutes = currentHour * 60 + currentMinute;
        return slotMinutes > currentMinutes;
      });

      setSlots(filteredSlots);
    } catch (error) {
      console.log('Get Slots Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotPress = (item: any) => {
    if (item.status !== 'available') return;
    navigation.navigate('BookAppointment', {
      doctorId: item.doctor?._id || doctorId,
      doctorName,
      slotTime: item.slotTime,
      slotId: item._id,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderSlot = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={item.status === 'available' ? 0.7 : 1}
      onPress={() => handleSlotPress(item)}
      style={[
        styles.card,
        item.status !== 'available' && styles.cardDisabled,
      ]}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.dateText}>{formatDate(item.slotDate)}</Text>
        <Text style={styles.timeText}>{item.slotTime}</Text>
      </View>
      <View style={[styles.statusBadge, styles.statusAvailable]}>
        <Text style={styles.statusText}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
   <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {doctorName}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Body ── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#D62828" />
          <Text style={styles.loadingText}>Loading slots...</Text>
        </View>
      ) : slots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={56} color="#444" />
          <Text style={styles.emptyTitle}>No Available Slots</Text>
          <Text style={styles.emptySub}>
            {doctorName} has no open slots at the moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item._id}
          renderItem={renderSlot}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default DoctorSlotsScreen;

// ── Styles ──
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8A8A8A',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    color: '#8A8A8A',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.4,
  },
  cardLeft: {
    flex: 1,
  },
  dateText: {
    color: '#6B6B6B',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  statusAvailable: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
    textTransform: 'capitalize',
  },
});