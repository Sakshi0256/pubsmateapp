import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ClinicDashboardScreen from '../screens/clinic/ClinicDashboardScreen';
import BookAppointmentScreen from '../screens/clinic/BookAppointmentScreen';
import AddDoctorScreen from '../screens/clinic/AddDoctorScreen';
import DoctorSlotsScreen from '../screens/clinic/DoctorSlotsScreen';
import InviteDoctorScreen from '../screens/clinic/InviteDoctorScreen';
import SetDoctorTimingScreen from '../screens/clinic/SetDoctorTimingScreen';
const Stack = createNativeStackNavigator();

const ClinicStackNavigator = () => {
    return (
        <Stack.Navigator>

            <Stack.Screen
                name="ClinicDashboard"
                component={ClinicDashboardScreen}
                options={{
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name="BookAppointment"
                component={BookAppointmentScreen}
                options={{
                    title: 'Book Appointment',
                }}
            />

            <Stack.Screen
                name="AddDoctor"
                component={AddDoctorScreen}
                options={{
                    title: 'Add Doctor',
                     headerShown: false,
                }}
            />

            <Stack.Screen
                name="DoctorSlots"
                component={DoctorSlotsScreen}
                options={{
                    title: 'Doctor Slots',
                    headerShown: false,
                }}
            />
<Stack.Screen name="InviteDoctor" component={InviteDoctorScreen}   options={{ headerShown: false }}/>
<Stack.Screen name="SetDoctorTiming" component={SetDoctorTimingScreen} options={{ headerShown: false }} />

        </Stack.Navigator>
    );
};

export default ClinicStackNavigator;