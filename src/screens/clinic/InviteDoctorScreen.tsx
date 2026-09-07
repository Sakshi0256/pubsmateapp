import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../../services/api';

type DoctorStatus = 'none' | 'pending' | 'linked';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  status: DoctorStatus;
}

const InviteDoctorScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch all doctors on mount ──
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async (query = '') => {
    setLoading(true);
    try {
      const response = await API.get(`/clinic/search-doctors?q=${encodeURIComponent(query)}`);
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.log('Fetch doctors error:', error);
      showAlert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchDoctors(text);
    }, 500);
  };

  // ── Send Invitation ──
  const sendInvite = async (doctorEmail: string) => {
    setProcessing(doctorEmail);
    try {
      await API.post('/clinic/invite', { doctorEmail });
      showAlert('Success', 'Invitation sent successfully');
      // Refresh list to update status (now pending)
      fetchDoctors(searchQuery);
    } catch (error: any) {
      showAlert('Error', error?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setProcessing(null);
    }
  };

  // ── Generate Slots for linked doctor ──
  const generateSlots = async (doctorId: string) => {
    setProcessing(doctorId);
    try {
      const response = await API.post(`/clinic/doctors/${doctorId}/generate-slots`);
      showAlert('Success', response.data.message);
    } catch (error: any) {
      showAlert('Error', error?.response?.data?.message || 'Failed to generate slots');
    } finally {
      setProcessing(null);
    }
  };

  const renderItem = ({ item }: { item: Doctor }) => {
    let button: React.ReactNode;
    switch (item.status) {
      case 'none':
        button = (
          <TouchableOpacity
            style={styles.btnInvite}
            onPress={() => sendInvite(item.email)}
            disabled={processing === item.email}
          >
            {processing === item.email ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnText}>Invite</Text>}
          </TouchableOpacity>
        );
        break;
      case 'pending':
        button = (
          <View style={[styles.btnPending]}>
            <Text style={styles.btnText}>Pending</Text>
          </View>
        );
        break;
      case 'linked':
        button = (
          <TouchableOpacity
            style={styles.btnGenerate}
            onPress={() => generateSlots(item._id)}
            disabled={processing === item._id}
          >
            {processing === item._id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnText}>Generate Slots</Text>}
          </TouchableOpacity>
        );
        break;
      default:
        button = null;
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.specialty}>{item.specialty || 'General Physician'}</Text>
          </View>
          {button}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
     

      <View style={styles.content}>
       
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchDoctors(''); }}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#D62828" />
          </View>
        ) : (
          <FlatList
            data={doctors}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={56} color="#444" />
                <Text style={styles.emptyTitle}>No doctors found</Text>
                <Text style={styles.emptySub}>Try a different search term</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default InviteDoctorScreen;

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
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  backBtn: { padding: 4 },
  headerTitle: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,

  },
  description: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 22,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1A1A1A',
    padding: 0,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 20 },
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  email: { fontSize: 13, color: '#6B6B6B', marginBottom: 2 },
  specialty: { fontSize: 13, color: '#8A8A8A' },
  btnInvite: {
    backgroundColor: '#D62828',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  btnPending: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  btnGenerate: {
    backgroundColor: '#2F7A4F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: { color: '#1A1A1A', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#8A8A8A', fontSize: 14, marginTop: 8, textAlign: 'center' },
});