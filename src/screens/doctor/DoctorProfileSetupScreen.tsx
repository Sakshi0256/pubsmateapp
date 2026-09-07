import { Animated } from 'react-native';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';

const RED = '#E63946';
const BG = '#FFFFFF';

const DoctorProfileScreen = ({ navigation }: any) => {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // ── Invitations state ──
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const cardAnim = useRef(new Animated.Value(0)).current;

  // ── Helper: proper "First Last" initials ──
  const getInitials = (fullName?: string) => {
    if (!fullName) return 'DP';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  };

  // ── Fetch profile ──
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

  // ── Fetch invitations ──
  const fetchInvitations = async () => {
    try {
      setInvitesLoading(true);
      const response = await API.get('/doctors/invitations');
      setInvitations(response.data.invitations || []);
    } catch (error: any) {
      console.log('FETCH INVITES ERROR', error);
    } finally {
      setInvitesLoading(false);
    }
  };

  // ── Accept / Reject ──
  const handleRespond = async (invitationId: string, action: 'accept' | 'reject') => {
    setProcessing(invitationId);
    try {
      await API.put(`/doctors/invitations/${invitationId}`, { action });
      showAlert('Success', `Invitation ${action === 'accept' ? 'accepted' : 'rejected'}`);
      await fetchInvitations();
      await getDoctorProfile();
    } catch (error: any) {
      showAlert('Error', error?.response?.data?.message || 'Failed to respond');
    } finally {
      setProcessing(null);
    }
  };

  // ── Pick and Upload Photo ──
  const pickAndUploadPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.6,
      maxWidth: 600,
      maxHeight: 600,
    });

    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const base64Image = `data:${asset.type};base64,${asset.base64}`;

    try {
      setUploading(true);
      const response = await API.put('/doctors/profile/photo', { image: base64Image });
      if (response.data.success) {
        setDoctor((prev: any) => ({ ...prev, photo: response.data.photo }));
        showAlert('Success', 'Profile photo updated');
      }
    } catch (error: any) {
      showAlert('Error', error?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };


   const performLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      global.authToken = null;
      navigation.replace('RoleSelection');
    } catch (error) {
      console.log('Logout Error:', error);
    }
  };

  useFocusEffect(
  useCallback(() => {
    getDoctorProfile();
    fetchInvitations();
  }, [])
);


  useEffect(() => {
    const init = async () => {
      await getDoctorProfile();
      await fetchInvitations();
    };
    init();
    Animated.spring(cardAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

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
          {/* ── Avatar with upload ── */}
          <TouchableOpacity
            onPress={pickAndUploadPhoto}
            disabled={uploading}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              {doctor?.photo ? (
                <Image source={{ uri: doctor.photo }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(doctor?.name)}</Text>
              )}
              {uploading && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                </View>
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>Dr. {doctor?.name || 'Doctor'}</Text>
          <Text style={styles.specialization}>{doctor?.specialty || 'No Specialty'}</Text>

          {doctor?.hospitalName ? (
            <View style={styles.hospitalChip}>
              <Ionicons name="business-outline" size={11} color={RED} />
              <Text style={styles.hospitalChipText}>{doctor.hospitalName}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* ── INVITATIONS SECTION ── */}
        {invitesLoading ? (
          <View style={styles.inviteLoader}>
            <ActivityIndicator size="small" color={RED} />
            <Text style={styles.inviteLoaderText}>Checking invitations...</Text>
          </View>
        ) : invitations.length > 0 ? (
          <View style={styles.inviteSection}>
            <View style={styles.inviteHeader}>
              <Ionicons name="mail-outline" size={18} color={RED} />
              <Text style={styles.inviteTitle}>Pending Invitations</Text>
              <Text style={styles.inviteCount}>{invitations.length}</Text>
            </View>

            {invitations.map((item) => (
              <View key={item._id} style={styles.inviteCard}>
                <View style={styles.inviteCardHeader}>
                  <View style={styles.clinicIcon}>
                    <Ionicons name="business-outline" size={20} color={RED} />
                  </View>
                  <View style={styles.clinicInfo}>
                    <Text style={styles.clinicName}>{item.clinic.name}</Text>
                    {item.clinic.address && (
                      <Text style={styles.clinicAddress}>{item.clinic.address}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.inviteActions}>
                  <TouchableOpacity
                    style={[styles.inviteBtn, styles.acceptBtn]}
                    onPress={() => handleRespond(item._id, 'accept')}
                    disabled={processing === item._id}
                  >
                    {processing === item._id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.inviteBtnText}>Accept</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inviteBtn, styles.rejectBtn]}
                    onPress={() => handleRespond(item._id, 'reject')}
                    disabled={processing === item._id}
                  >
                    <Text style={[styles.inviteBtnText, { color: RED }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* STATS */}
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

         <TouchableOpacity
  style={styles.editProfileBtn}
  onPress={() => navigation.navigate('DoctorEditProfile', { doctor })}
>
  <Ionicons name="create-outline" size={16} color="#FFFFFF" />
  <Text style={styles.editProfileBtnText}>Edit Profile</Text>
</TouchableOpacity>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton} onPress={performLogout} activeOpacity={0.8}>
      <Ionicons name="log-out-outline" size={16} color={RED} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DoctorProfileScreen;

// ── Styles ──
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { color: '#6B6B6B', fontSize: 13 },

  topHeader: {
    height: 60,
    backgroundColor: 'rgba(230,57,70,0.06)',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -50,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: -4,
    backgroundColor: RED,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 3 },
  specialization: { fontSize: 12.5, color: '#6B6B6B' },
  hospitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230,57,70,0.08)',
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
    backgroundColor: '#FAFAFA',
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  statNumber: { fontSize: 18, fontWeight: '800', color: RED, marginBottom: 3 },
  statLabel: { fontSize: 11, color: '#8A8A8A', fontWeight: '600' },

  infoContainer: { marginTop: 18, paddingHorizontal: 16 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  infoIcon: { marginRight: 10, marginTop: 2 },
  infoTextBlock: { flex: 1 },
  label: { fontSize: 11, color: '#8A8A8A', marginBottom: 3, fontWeight: '600' },
  value: { fontSize: 13.5, fontWeight: '700', color: '#1A1A1A' },

  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(230,57,70,0.08)',
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
    backgroundColor: 'rgba(230,57,70,0.05)',
    top: -80,
    right: -80,
  },
  bgBlob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(230,57,70,0.04)',
    bottom: 50,
    left: -60,
  },

  // ── Invitation styles ──
  inviteLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 8,
  },
  inviteLoaderText: { color: '#6B6B6B', fontSize: 13 },

  inviteSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  inviteTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  inviteCount: {
    backgroundColor: RED,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  inviteCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  inviteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clinicIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(230,57,70,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  clinicInfo: { flex: 1 },
  clinicName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  clinicAddress: { fontSize: 12, color: '#8A8A8A', marginTop: 2 },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  inviteBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  acceptBtn: {
    backgroundColor: RED,
    borderColor: RED,
  },
  rejectBtn: {
    backgroundColor: 'transparent',
    borderColor: RED,
  },
  inviteBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  editProfileBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#D62828',
  marginHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 14,
  gap: 6,
  marginTop: 8,
},
editProfileBtnText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '700',
},
});