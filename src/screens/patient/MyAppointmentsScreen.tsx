import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const appointments = [
  {
    id: 1,
    doctor: 'Dr. Priya Mehta',
    specialty: 'Cardiologist',
    date: '26 May 2026',
    time: '10:00 AM',
    status: 'Upcoming',
  },

  {
    id: 2,
    doctor: 'Dr. Meena Sharma',
    specialty: 'Dermatologist',
    date: '24 May 2026',
    time: '11:30 AM',
    status: 'Completed',
  },

  {
    id: 3,
    doctor: 'Dr. Rahul Jain',
    specialty: 'Dentist',
    date: '22 May 2026',
    time: '02:00 PM',
    status: 'Cancelled',
  },
];

const MyAppointmentsScreen = () => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.header}>
        My Appointments
      </Text>

      {appointments.map(item => (

        <View
          key={item.id}
          style={styles.card}>

          {/* TOP */}
          <View style={styles.topRow}>

            <View>

              <Text style={styles.doctorName}>
                {item.doctor}
              </Text>

              <Text style={styles.specialty}>
                {item.specialty}
              </Text>

            </View>

            <View
              style={[
                styles.statusBadge,

                item.status === 'Upcoming' &&
                  styles.upcomingBadge,

                item.status === 'Completed' &&
                  styles.completedBadge,

                item.status === 'Cancelled' &&
                  styles.cancelledBadge,
              ]}>

              <Text
                style={[
                  styles.statusText,

                  item.status === 'Upcoming' &&
                    styles.upcomingText,

                  item.status === 'Completed' &&
                    styles.completedText,

                  item.status === 'Cancelled' &&
                    styles.cancelledText,
                ]}>

                {item.status}

              </Text>

            </View>

          </View>

          {/* DATE */}
          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Date
            </Text>

            <Text style={styles.infoValue}>
              {item.date}
            </Text>

          </View>

          {/* TIME */}
          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Time
            </Text>

            <Text style={styles.infoValue}>
              {item.time}
            </Text>

          </View>

          {/* BUTTON */}
          {item.status === 'Upcoming' && (

            <TouchableOpacity
              style={styles.cancelButton}>

              <Text style={styles.cancelText}>
                Cancel Appointment
              </Text>

            </TouchableOpacity>
          )}

        </View>
      ))}

    </ScrollView>
  );
};

export default MyAppointmentsScreen;

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
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  doctorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  specialty: {
    fontSize: 13,
    color: '#64748B',
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },

  upcomingBadge: {
    backgroundColor: '#DBEAFE',
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  upcomingText: {
    color: '#2563EB',
  },

  completedText: {
    color: '#16A34A',
  },

  cancelledText: {
    color: '#DC2626',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  cancelButton: {
    backgroundColor: '#EF4444',
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },

  cancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});