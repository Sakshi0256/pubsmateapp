import React from 'react';

import {
  View,
 Text,
 StyleSheet,
 ScrollView,
 TouchableOpacity,
} from 'react-native';

const DoctorDetailScreen = ({
  navigation,
  route,
}: any) => {

  const doctor = route?.params?.doctor;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>

      {/* TOP CARD */}
      <View style={styles.topCard}>

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

        <Text style={styles.exp}>
          {doctor?.experience}
        </Text>

      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            ⭐ 4.9
          </Text>

          <Text style={styles.statLabel}>
            Rating
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            1.2k+
          </Text>

          <Text style={styles.statLabel}>
            Patients
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {doctor?.fee}
          </Text>

          <Text style={styles.statLabel}>
            Fee
          </Text>
        </View>

      </View>

      {/* ABOUT */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          About Doctor
        </Text>

        <Text style={styles.description}>
          Experienced specialist providing
          trusted healthcare consultations
          with patient-focused treatment and
          modern medical practices.
        </Text>

      </View>

      {/* AVAILABLE TIMINGS */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          Available Timings
        </Text>

        <Text style={styles.timing}>
          Monday - Saturday
        </Text>

        <Text style={styles.timing}>
          10:00 AM - 6:00 PM
        </Text>

      </View>

      {/* BOOK BUTTON */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate(
            'SlotBooking',
            {
              doctor,
            },
          )
        }>

        <Text style={styles.bookText}>
          Book Appointment
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
};

export default DoctorDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  topCard: {
    backgroundColor: '#2563EB',
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563EB',
  },

  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },

  specialty: {
    fontSize: 15,
    color: '#DBEAFE',
    marginBottom: 6,
  },

  exp: {
    fontSize: 14,
    color: '#DBEAFE',
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: -28,
  },

  statCard: {
    backgroundColor: '#fff',
    width: '31%',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 6,
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },

  section: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    borderRadius: 24,
    padding: 20,
    marginTop: 22,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },

  description: {
    fontSize: 14,
    lineHeight: 24,
    color: '#64748B',
  },

  timing: {
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 10,
    fontWeight: '600',
  },

  bookButton: {
    backgroundColor: '#2563EB',
    marginHorizontal: 18,
    marginTop: 28,
    marginBottom: 30,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },

  bookText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});