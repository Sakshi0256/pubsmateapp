import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ClinicStackNavigator from './ClinicStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import BookAppointmentScreen from '../screens/clinic/BookAppointmentScreen';   // add

import ClinicAppointmentsScreen from '../screens/clinic/ClinicAppointmentsScreen';
import ClinicNotificationScreen from '../screens/clinic/ClinicNotificationScreen';

const Tab = createBottomTabNavigator();

const ClinicNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
  headerShown: false,

 tabBarActiveTintColor: '#D62828',
tabBarInactiveTintColor: '#9B9B9B',

tabBarStyle: {
  height: 72,
  paddingBottom: 10,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: '#EDEDED',
  backgroundColor: '#FFFFFF',
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
    ? 'medkit'
    : 'medkit-outline';
   } else if (route.name === 'Book') {
  iconName = focused ? 'add-circle' : 'add-circle-outline';
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

   <Tab.Screen
  name="Book"
  component={BookAppointmentScreen}
  options={{
    tabBarButton: (props) => (
      <TouchableOpacity
        onPress={props.onPress}
        activeOpacity={0.85}
        style={styles.fabWrapper}
      >
        <View style={styles.fabCircle}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </View>
        <Text style={styles.fabLabel}>Book</Text>
      </TouchableOpacity>
    ),
  }}
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

const styles = StyleSheet.create({
  fabWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D62828',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  fabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D62828',
    marginTop: 4,
  },
});

export default ClinicNavigator;