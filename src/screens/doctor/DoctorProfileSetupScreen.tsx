import { Animated } from 'react-native';
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';

const RED = '#E63946';
const BG = '#0A0000';

const DoctorProfileScreen = ({ navigation }: any) => {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const cardAnim = useRef(new Animated.Value(0)).current;

  // ── Helper: proper "First Last" initials ──
  const getInitials = (fullName?: string) => {
    if (!fullName) return 'DP';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  };

  useEffect(() => {
    getDoctorProfile();
  }, []);

  const getDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/auth/doctor-profile');
      if (response.data.success) {
        setDoctor(response.data.data);
      }
    } catch (error: any) {
      console.log('PROFILE ERROR', error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              global.authToken = null;
              navigation.replace('RoleSelection');
            } catch (error) {
              console.log('Logout Error:', error);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.loaderText}>No profile data available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topHeader} />

        {/* PROFILE CARD */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(doctor?.name)}</Text>
          </View>

          <Text style={styles.name}>Dr. {doctor?.name || 'Doctor'}</Text>
          <Text style={styles.specialization}>{doctor?.specialty || 'No Specialty'}</Text>

          {doctor?.hospitalName ? (
            <View style={styles.hospitalChip}>
              <Ionicons name="business-outline" size={11} color={RED} />
              <Text style={styles.hospitalChipText}>{doctor.hospitalName}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* STATS — real data only */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{doctor?.experience || '0'}</Text>
            <Text style={styles.statLabel}>Years Exp.</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>₹{doctor?.consultationFee || 0}</Text>
            <Text style={styles.statLabel}>Consult Fee</Text>
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={15} color="#7A7A7A" style={styles.infoIcon} />
            <View style={styles.infoTextBlock}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value} numberOfLines={1}>{doctor?.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={15} color="#7A7A7A" style={styles.infoIcon} />
            <View style={styles.infoTextBlock}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{doctor?.phone || '+91 9876543210'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="business-outline" size={15} color="#7A7A7A" style={styles.infoIcon} />
            <View style={styles.infoTextBlock}>
              <Text style={styles.label}>Hospital</Text>
              <Text style={styles.value}>{doctor?.hospitalName || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="school-outline" size={15} color="#7A7A7A" style={styles.infoIcon} />
            <View style={styles.infoTextBlock}>
              <Text style={styles.label}>Qualification</Text>
              <Text style={styles.value}>{doctor?.qualification || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={15} color="#7A7A7A" style={styles.infoIcon} />
            <View style={styles.infoTextBlock}>
              <Text style={styles.label}>About</Text>
              <Text style={styles.value}>{doctor?.about || 'No information available'}</Text>
            </View>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={16} color={RED} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DoctorProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#8F8F8F', fontSize: 13 },

  topHeader: {
    height: 130,
    backgroundColor: 'rgba(230,57,70,0.06)',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 16,
    marginTop: -50,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#0A0000' },
  name: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 3 },
  specialization: { fontSize: 12.5, color: '#8F8F8F' },
  hospitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230,57,70,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  hospitalChipText: { fontSize: 11, color: RED, fontWeight: '700', marginLeft: 4 },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statNumber: { fontSize: 18, fontWeight: '800', color: RED, marginBottom: 3 },
  statLabel: { fontSize: 11, color: '#8F8F8F', fontWeight: '600' },

  infoContainer: { marginTop: 18, paddingHorizontal: 16 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  infoIcon: { marginRight: 10, marginTop: 2 },
  infoTextBlock: { flex: 1 },
  label: { fontSize: 11, color: '#8F8F8F', marginBottom: 3, fontWeight: '600' },
  value: { fontSize: 13.5, fontWeight: '700', color: '#FFFFFF' },

  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(230,57,70,0.1)',
    marginHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.25)',
  },
  logoutText: { color: RED, fontSize: 14, fontWeight: '700' },

  bgBlob1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(230,57,70,0.04)',
    top: -80,
    right: -80,
  },
  bgBlob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(230,57,70,0.03)',
    bottom: 50,
    left: -60,
  },
});