import React from 'react';

import {
  View,
 Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const PatientProfileScreen = ({
  navigation,
}: any) => {

  const handleLogout = () => {

    showAlert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Logout',

          onPress: () => {
            navigation.replace('Login');
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.topHeader} />

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            S
          </Text>
        </View>

        <Text style={styles.name}>
          Sakshi
        </Text>

        <Text style={styles.email}>
          sakshi@gmail.com
        </Text>

      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>

        <View style={styles.statCard}>

          <Text style={styles.statNumber}>
            12
          </Text>

          <Text style={styles.statLabel}>
            Appointments
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statNumber}>
            5
          </Text>

          <Text style={styles.statLabel}>
            Completed
          </Text>

        </View>

        <View style={styles.statCard}>

          <Text style={styles.statNumber}>
            3
          </Text>

          <Text style={styles.statLabel}>
            Upcoming
          </Text>

        </View>

      </View>

      {/* INFO SECTION */}
      <View style={styles.infoSection}>

        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <View style={styles.infoCard}>

          <Text style={styles.label}>
            Full Name
          </Text>

          <Text style={styles.value}>
            Sakshi Mishra
          </Text>

        </View>

        <View style={styles.infoCard}>

          <Text style={styles.label}>
            Phone Number
          </Text>

          <Text style={styles.value}>
            +91 9876543210
          </Text>

        </View>

        <View style={styles.infoCard}>

          <Text style={styles.label}>
            Blood Group
          </Text>

          <Text style={styles.value}>
            O+
          </Text>

        </View>

        <View style={styles.infoCard}>

          <Text style={styles.label}>
            Address
          </Text>

          <Text style={styles.value}>
            Mumbai, Maharashtra
          </Text>

        </View>

      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        style={styles.editButton}>

        <Text style={styles.editText}>
          Edit Profile
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}>

        <Text style={styles.logoutText}>
          Logout
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
};

export default PatientProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  topHeader: {
    height: 170,
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    marginTop: -60,
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 28,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563EB',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  email: {
    fontSize: 14,
    color: '#64748B',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 18,
  },

  statCard: {
    backgroundColor: '#fff',
    width: '31%',
    borderRadius: 20,
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
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },

  infoSection: {
    paddingHorizontal: 18,
    marginTop: 26,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
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

  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },

  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  editButton: {
    backgroundColor: '#2563EB',
    marginHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },

  editText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});