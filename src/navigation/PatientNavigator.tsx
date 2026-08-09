import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import Ionicons from 'react-native-vector-icons/Ionicons';

import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import CategoryScreen from '../screens/patient/CategoryScreen';
import DoctorListScreen from '../screens/patient/DoctorListScreen';
import DoctorDetailScreen from '../screens/patient/DoctorDetailScreen';
import SlotBookingScreen from '../screens/patient/SlotBookingScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import PatientNotificationsScreen from '../screens/patient/PatientNotificationsScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
/* ---------------- HOME STACK ---------------- */

const HomeStack = () => {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="PatientHome"
        component={PatientHomeScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="DoctorDetail"
        component={DoctorDetailScreen}
        options={{
          title: 'Doctor Details',
        }}
      />

      <Stack.Screen
        name="SlotBooking"
        component={SlotBookingScreen}
        options={{
          title: 'Book Appointment',
        }}
      />

    </Stack.Navigator>
  );
};

/* ---------------- CATEGORY STACK ---------------- */

const CategoryStack = () => {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="CategoriesScreen"
        component={CategoryScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={{
          title: 'Doctors',
        }}
      />

      <Stack.Screen
        name="DoctorDetail"
        component={DoctorDetailScreen}
        options={{
          title: 'Doctor Details',
        }}
      />

      <Stack.Screen
        name="SlotBooking"
        component={SlotBookingScreen}
        options={{
          title: 'Book Appointment',
        }}
      />

    </Stack.Navigator>
  );
};

/* ---------------- MAIN TABS ---------------- */

const PatientNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,

        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',

        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 10,
          backgroundColor: '#fff',
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        tabBarIcon: ({color, focused}) => {

          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused
              ? 'home'
              : 'home-outline';
          }

          else if (
            route.name === 'Categories'
          ) {
            iconName = focused
              ? 'grid'
              : 'grid-outline';
          }

          else if (
            route.name === 'Appointments'
          ) {
            iconName = focused
              ? 'calendar'
              : 'calendar-outline';
          }

          else if (
            route.name === 'Notifications'
          ) {
            iconName = focused
              ? 'notifications'
              : 'notifications-outline';
          }

          else if (
            route.name === 'Profile'
          ) {
            iconName = focused
              ? 'person'
              : 'person-outline';
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

      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={HomeStack}
      />

      {/* CATEGORY */}
      <Tab.Screen
        name="Categories"
        component={CategoryStack}
      />

      {/* APPOINTMENTS */}
      <Tab.Screen
        name="Appointments"
        component={MyAppointmentsScreen}
      />

      {/* NOTIFICATIONS */}
      <Tab.Screen
        name="Notifications"
        component={PatientNotificationsScreen}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={PatientProfileScreen}
      />

    </Tab.Navigator>
  );
};

export default PatientNavigator;