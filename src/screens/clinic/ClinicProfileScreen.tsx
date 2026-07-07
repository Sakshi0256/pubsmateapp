import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../services/api';

const ClinicProfileScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clinic, setClinic] = useState<any>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const infoAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch Clinic Profile ──
  const fetchClinicProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await API.get('/clinic/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setClinic(response.data.clinic);
      }
    } catch (error: any) {
      console.log('Fetch profile error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClinicProfile();

    // Animate
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(infoAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Pull to Refresh ──
  const onRefresh = () => {
    setRefreshing(true);
    fetchClinicProfile();
  };

  // ── Logout ──
  const performLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.reset({
      index: 0,
      routes: [{ name: 'RoleSelection' }],
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: performLogout },
    ]);
  };

  // ── Get Initials ──
  const getInitials = (name: string) => {
    if (!name) return 'C';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#D62828" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D62828" />
        }>

        {/* TOP HEADER */}
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
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(clinic?.name || 'Clinic')}
            </Text>
          </View>

          <Text style={styles.clinicName}>
            {clinic?.name || 'Clinic'}
          </Text>

          <Text style={styles.clinicType}>
            {clinic?.hospitalName || 'Healthcare Clinic'}
          </Text>

        </Animated.View>

        {/* INFO SECTION */}
        <Animated.View
          style={[
            styles.infoContainer,
            {
              opacity: infoAnim,
              transform: [
                {
                  translateY: infoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{clinic?.email || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{clinic?.phone || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{clinic?.address || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Doctors</Text>
            <Text style={styles.infoValue}>{clinic?.totalDoctors || 0} Doctors</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>About</Text>
            <Text style={styles.infoValue}>{clinic?.about || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Registered Since</Text>
            <Text style={styles.infoValue}>
              {clinic?.createdAt ? new Date(clinic.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }) : 'Not provided'}
            </Text>
          </View>

        </Animated.View>

        {/* ACTIONS */}
       <TouchableOpacity
  style={styles.editButton}
  onPress={() => navigation.navigate('EditClinicProfile', { clinic })}>
  <Text style={styles.editButtonText}>Edit Profile</Text>
</TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

export default ClinicProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  bgBlob1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168,213,186,0.05)',
    top: -80,
    right: -80,
  },
  bgBlob2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(168,213,186,0.03)',
    bottom: 50,
    left: -60,
  },
  topHeader: {
    height: 160,
    backgroundColor: '#0A1210',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 18,
    marginTop: -55,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#D62828',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  clinicName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  clinicType: {
    fontSize: 13,
    color: '#B3B3B3',
  },
  infoContainer: {
    marginTop: 22,
    paddingHorizontal: 18,
  },
  infoItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoLabel: {
    fontSize: 12,
    color: '#B3B3B3',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    backgroundColor: '#D62828',
    marginHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutButton: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    marginHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});