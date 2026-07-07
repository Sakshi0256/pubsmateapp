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
    title: 'Appointment Confirmed',
    message:
      'Your appointment with Dr. Priya Mehta is confirmed for 26 May at 10:00 AM.',
    time: '2 min ago',
    type: 'success',
  },

  {
    id: 2,
    title: 'Appointment Reminder',
    message:
      'Reminder: You have an appointment tomorrow at 11:30 AM.',
    time: '30 min ago',
    type: 'primary',
  },

  {
    id: 3,
    title: 'Appointment Cancelled',
    message:
      'Your appointment with Dr. Rahul Jain was cancelled.',
    time: '1 hour ago',
    type: 'danger',
  },

  {
    id: 4,
    title: 'Doctor Available',
    message:
      'New slots are available for Dermatology consultation.',
    time: '3 hours ago',
    type: 'warning',
  },

  {
    id: 5,
    title: 'Payment Successful',
    message:
      'Your consultation payment was completed successfully.',
    time: 'Yesterday',
    type: 'success',
  },
];

const PatientNotificationsScreen = () => {
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

                item.type === 'success' &&
                  styles.successDot,

                item.type === 'danger' &&
                  styles.dangerDot,

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

export default PatientNotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
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

  row: {
    flexDirection: 'row',
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: 14,
  },

  primaryDot: {
    backgroundColor: '#2563EB',
  },

  successDot: {
    backgroundColor: '#16A34A',
  },

  dangerDot: {
    backgroundColor: '#EF4444',
  },

  warningDot: {
    backgroundColor: '#F59E0B',
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  message: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },

  time: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});