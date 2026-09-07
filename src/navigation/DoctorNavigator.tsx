import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import API from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import ManageAppointmentsScreen from '../screens/doctor/ManageAppointmentsScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileSetupScreen';
import ManageAvailableSlotsScreen from '../screens/doctor/ManageAvailableSlotsScreen';

const Tab = createBottomTabNavigator();

// ── Custom Header Component (compact) ──
const DoctorHeader = ({ navigation }) => {
  const [doctor, setDoctor] = useState({ name: '', photo: '' });
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await API.get('/auth/doctor-profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setDoctor({
          name: response.data.data.name || '',
          photo: response.data.data.photo || '',
        });
      }
    } catch (error) {
      console.log('Header fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'Dr';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
      <View style={styles.left}>
        {loading ? (
          <ActivityIndicator size="small" color="#E63946" />
        ) : doctor.photo ? (
          <Image source={{ uri: doctor.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initials}>{getInitials(doctor.name)}</Text>
          </View>
        )}
        <Text style={styles.name}>Dr. {doctor.name || 'Doctor'}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="settings-outline" size={20} color="#1A1A1A" />
      </TouchableOpacity>
    </View>
  );
};

// ── Main Navigator ──
const DoctorNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: (props) => <DoctorHeader {...props} />,
        tabBarActiveTintColor: '#D62828',
        tabBarInactiveTintColor: '#9B9B9B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: '#EDEDED',
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: any;
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Slots':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DoctorDashboardScreen} />
      <Tab.Screen name="Appointments" component={ManageAppointmentsScreen} />
      <Tab.Screen name="Slots" component={ManageAvailableSlotsScreen} />
      <Tab.Screen name="Profile" component={DoctorProfileScreen} />
    </Tab.Navigator>
  );
};

// ── Compact Header Styles ──
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0, // Remove border for cleaner look
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});

export default DoctorNavigator;