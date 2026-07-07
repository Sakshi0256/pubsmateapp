import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const availableSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:30 PM',
  '02:00 PM',
  '04:00 PM',
];

const SlotBookingScreen = ({
  route,
  navigation,
}: any) => {

  const doctor = route?.params?.doctor;

  const [selectedSlot, setSelectedSlot] =
    useState('');

  const handleBooking = () => {

    if (!selectedSlot) {

      Alert.alert(
        'Select Slot',
        'Please select appointment slot',
      );

      return;
    }

    Alert.alert(
      'Appointment Booked',
      `Your appointment with ${doctor?.name} is confirmed for ${selectedSlot}`,
    );

    navigation.navigate('Appointments');
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>

      {/* DOCTOR CARD */}
      <View style={styles.doctorCard}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            DR
          </Text>
        </View>

        <Text style={styles.name}>
          {doctor?.name}
        </Text>

        <Text style={styles.specialty}>
          {doctor?.specialty}
        </Text>

      </View>

      {/* DATE */}
      <View style={styles.dateCard}>

        <Text style={styles.dateTitle}>
          Appointment Date
        </Text>

        <Text style={styles.dateText}>
          26 May 2026
        </Text>

      </View>

      {/* SLOTS */}
      <Text style={styles.sectionTitle}>
        Available Slots
      </Text>

      <View style={styles.slotsContainer}>

        {availableSlots.map(slot => {

          const selected =
            selectedSlot === slot;

          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotButton,

                selected &&
                  styles.selectedSlot,
              ]}
              onPress={() =>
                setSelectedSlot(slot)
              }>

              <Text
                style={[
                  styles.slotText,

                  selected &&
                    styles.selectedText,
                ]}>

                {slot}

              </Text>

            </TouchableOpacity>
          );
        })}

      </View>

      {/* BOOK BUTTON */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBooking}>

        <Text style={styles.bookButtonText}>
          Confirm Appointment
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
};

export default SlotBookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  doctorCard: {
    backgroundColor: '#2563EB',
    borderRadius: 28,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },

  specialty: {
    fontSize: 14,
    color: '#DBEAFE',
  },

  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  dateTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },

  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },

  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  slotButton: {
    backgroundColor: '#fff',
    width: '48%',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  selectedSlot: {
    backgroundColor: '#2563EB',
  },

  slotText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  selectedText: {
    color: '#fff',
  },

  bookButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 30,
  },

  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});