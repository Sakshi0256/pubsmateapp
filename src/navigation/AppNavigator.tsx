import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import PatientNavigator from './PatientNavigator';
import DoctorNavigator from './DoctorNavigator';
import ClinicNavigator from './ClinicNavigator';
import SplashScreen from '../screens/auth/splashscree';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import DoctorEditProfileScreen from '../screens/doctor/DoctorEditProfileScreen';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                   contentStyle: { backgroundColor: '#FFFFFF' },

                }}>

                <Stack.Screen
                    name="splash"
                    component={SplashScreen}
                />

                <Stack.Screen
                    name="RoleSelection"
                    component={RoleSelectionScreen}
                />

                <Stack.Screen
                    name="Signup"
                    component={SignupScreen}
                />

                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                />

                <Stack.Screen
                    name="PatientTabs"
                    component={PatientNavigator}
                />

                <Stack.Screen
                    name="DoctorTabs"
                    component={DoctorNavigator}
                />
                <Stack.Screen
                    name="ClinicTabs"
                    component={ClinicNavigator}
                />
  <Stack.Screen name="DoctorEditProfile" component={DoctorEditProfileScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;