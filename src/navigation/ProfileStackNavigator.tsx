import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import ClinicProfileScreen from '../screens/clinic/ClinicProfileScreen';
import EditClinicProfileScreen from '../screens/clinic/EditClinicProfileScreen';

const Stack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="ClinicProfile"
        component={ClinicProfileScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="EditClinicProfile"
        component={EditClinicProfileScreen}
        options={{
          title: 'Edit Profile',
          headerShown: false
        }}
      />

    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;