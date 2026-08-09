import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import ManageAppointmentsScreen from '../screens/doctor/ManageAppointmentsScreen';
import DoctorNotificationsScreen from '../screens/doctor/DoctorNotificationsScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileSetupScreen';
import ManageAvailableSlotsScreen from '../screens/doctor/ManageAvailableSlotsScreen';

const Tab = createBottomTabNavigator();

const DoctorNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: '#D62828',
        tabBarInactiveTintColor: '#9B9B9B',

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: '#EDEDED',
          elevation: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },

        tabBarIcon: ({ color, focused }) => {
          let iconName: any;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused
                ? 'home'
                : 'home-outline';
              break;

            case 'Appointments':
              iconName = focused
                ? 'calendar'
                : 'calendar-outline';
              break;

            case 'Slots':
              iconName = focused
                ? 'time'
                : 'time-outline';
              break;

            case 'Notifications':
              iconName = focused
                ? 'notifications'
                : 'notifications-outline';
              break;

            case 'Profile':
              iconName = focused
                ? 'person'
                : 'person-outline';
              break;

            default:
              iconName = 'ellipse';
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

      <Tab.Screen
        name="Dashboard"
        component={DoctorDashboardScreen}
      />

      <Tab.Screen
        name="Appointments"
        component={ManageAppointmentsScreen}
      />

      <Tab.Screen
        name="Slots"
        component={ManageAvailableSlotsScreen}
      />

      {/* <Tab.Screen
        name="Notifications"
        component={DoctorNotificationsScreen}
      /> */}

      <Tab.Screen
        name="Profile"
        component={DoctorProfileScreen}
      />

    </Tab.Navigator>
  );
};

export default DoctorNavigator;