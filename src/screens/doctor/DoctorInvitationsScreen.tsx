import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';

interface Invitation {
  _id: string;
  clinic: {
    _id: string;
    name: string;
    address: string;
    phone?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const DoctorInvitationsScreen = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await API.get('/doctors/invitations');
      setInvitations(response.data.invitations || []);
    } catch (error) {
      console.log('Fetch invitations error:', error);
      showAlert('Error', 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInvitations();
    }, [])
  );

  const handleRespond = async (invitationId: string, action: 'accept' | 'reject') => {
    setProcessing(invitationId);
    try {
      await API.put(`/doctors/invitations/${invitationId}`, { action });
      showAlert('Success', `Invitation ${action === 'accept' ? 'accepted' : 'rejected'}`);
      // Refresh list
      fetchInvitations();
    } catch (error: any) {
      showAlert('Error', error?.response?.data?.message || 'Failed to respond');
    } finally {
      setProcessing(null);
    }
  };

  const renderInvitation = ({ item }: { item: Invitation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.clinicIcon}>
          <Ionicons name="business-outline" size={24} color="#D62828" />
        </View>
        <View style={styles.clinicInfo}>
          <Text style={styles.clinicName}>{item.clinic.name}</Text>
          {item.clinic.address && (
            <Text style={styles.clinicAddress}>{item.clinic.address}</Text>
          )}
          {item.clinic.phone && (
            <Text style={styles.clinicPhone}>📞 {item.clinic.phone}</Text>
          )}
        </View>
      </View>

      <Text style={styles.inviteDate}>
        Received: {new Date(item.createdAt).toLocaleDateString()}
      </Text>

      {item.status === 'pending' ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => handleRespond(item._id, 'accept')}
            disabled={processing === item._id}
          >
            {processing === item._id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>Accept</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => handleRespond(item._id, 'reject')}
            disabled={processing === item._id}
          >
            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.statusBadge, item.status === 'accepted' ? styles.acceptedBadge : styles.rejectedBadge]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invitations</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D62828" />
          <Text style={styles.loadingText}>Loading invitations...</Text>
        </View>
      ) : invitations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-open-outline" size={56} color="#444" />
          <Text style={styles.emptyTitle}>No Invitations</Text>
          <Text style={styles.emptySub}>
            You have no pending invitations from clinics.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invitations}
          keyExtractor={(item) => item._id}
          renderItem={renderInvitation}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchInvitations}
        />
      )}
    </SafeAreaView>
  );
};

export default DoctorInvitationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#8A8A8A',
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
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  clinicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(214,40,40,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  clinicAddress: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  clinicPhone: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2,
  },
  inviteDate: {
    fontSize: 12,
    color: '#8A8A8A',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  acceptBtn: {
    backgroundColor: '#D62828',
    borderColor: '#D62828',
  },
  rejectBtn: {
    backgroundColor: 'transparent',
    borderColor: '#EF4444',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  acceptedBadge: {
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  rejectedBadge: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});