import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

const notifications = [
  {
    id: 1,
    title: 'New Appointment Request',
    message:
      'Rahul Sharma requested appointment for 10:30 AM',
    time: '2 min ago',
    type: 'primary',
  },

  {
    id: 2,
    title: 'Appointment Cancelled',
    message:
      'Neha Verma cancelled tomorrow appointment',
    time: '15 min ago',
    type: 'danger',
  },

  {
    id: 3,
    title: 'Slot Booked',
    message:
      'Your 04:00 PM slot has been booked successfully',
    time: '30 min ago',
    type: 'success',
  },

  {
    id: 4,
    title: 'New Patient Registered',
    message:
      'A new patient profile has been assigned to you',
    time: '1 hour ago',
    type: 'warning',
  },

  {
    id: 5,
    title: 'Appointment Completed',
    message:
      'Patient consultation marked as completed',
    time: '2 hours ago',
    type: 'success',
  },

  {
    id: 6,
    title: 'Clinic Reminder',
    message:
      'Please update your available slots for tomorrow',
    time: '4 hours ago',
    type: 'primary',
  },
];

const DoctorNotificationsScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.header}>
        Notifications
      </Text>

      {notifications.map(item => (

        <View
          key={item.id}
          style={styles.card}>

          <View style={styles.row}>

            <View
              style={[
                styles.dot,

                item.type === 'primary' &&
                  styles.primaryDot,

                item.type === 'danger' &&
                  styles.dangerDot,

                item.type === 'success' &&
                  styles.successDot,

                item.type === 'warning' &&
                  styles.warningDot,
              ]}
            />

            <View style={styles.content}>

              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.message}>
                {item.message}
              </Text>

              <Text style={styles.time}>
                {item.time}
              </Text>

            </View>

          </View>

        </View>
      ))}

    </ScrollView>
  );
};

export default DoctorNotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  header: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: '#EDEDED',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 50,
    marginTop: 5,
    marginRight: 14,
  },

  primaryDot: {
    backgroundColor: '#3B82F6',
  },

  dangerDot: {
    backgroundColor: '#DC2626',
  },

  successDot: {
    backgroundColor: '#16A34A',
  },

  warningDot: {
    backgroundColor: '#D97706',
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },

  message: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 10,
  },

  time: {
    fontSize: 12,
    color: '#D62828',
    fontWeight: '600',
  },
});