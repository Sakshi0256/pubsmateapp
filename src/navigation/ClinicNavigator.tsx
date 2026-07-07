import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';
import ClinicStackNavigator from './ClinicStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

import ClinicAppointmentsScreen from '../screens/clinic/ClinicAppointmentsScreen';
import ClinicNotificationScreen from '../screens/clinic/ClinicNotificationScreen';

const Tab = createBottomTabNavigator();

const ClinicNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
  headerShown: false,

  tabBarActiveTintColor: '#D62828',
  tabBarInactiveTintColor: '#B3B3B3',

  tabBarStyle: {
    height: 72,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0A0A0A',
    elevation: 0,
  },

  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '700',
  },

  tabBarIcon: ({color, focused}) => {
    let iconName: any;

    if (route.name === 'Dashboard') {
      iconName = focused
        ? 'home'
        : 'home-outline';
    } else if (route.name === 'Appointments') {
      iconName = focused
        ? 'calendar'
        : 'calendar-outline';
    } else if (route.name === 'Doctors') {
      iconName = focused
        ? 'notifications'
        : 'notifications-outline';
    } else if (route.name === 'Profile') {
      iconName = focused
        ? 'person'
        : 'person-outline';
    } else if (route.name === 'Slots') {
      iconName = focused
        ? 'time'
        : 'time-outline';
    }

    return (
      <Ionicons
        name={iconName}
        size={22}
        color={color}
      />
    );
  },
})}>

      {/* DASHBOARD */}
      <Tab.Screen
        name="Dashboard"
        component={ClinicStackNavigator}
      />

      {/* APPOINTMENTS */}
      <Tab.Screen
        name="Appointments"
        component={ClinicAppointmentsScreen}
      />

      {/* NOTIFICATIONS */}
      <Tab.Screen
        name="Doctors"
        component={ClinicNotificationScreen}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
      />

    </Tab.Navigator>
  );
};

export default ClinicNavigator;