import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const categories = [
  'Cardiologist',
  'Dentist',
  'Neurologist',
  'Dermatologist',
];

const topDoctors = [
  {
    id: 1,
    name: 'Dr. Priya Mehta',
    specialty: 'Cardiologist',
    experience: '8 Years Exp.',
  },

  {
    id: 2,
    name: 'Dr. Meena Sharma',
    specialty: 'Dermatologist',
    experience: '5 Years Exp.',
  },
];

const PatientHomeScreen = ({navigation}: any) => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>

        <View>
          <Text style={styles.greeting}>
            Welcome 👋
          </Text>

          <Text style={styles.username}>
            Sakshi
          </Text>
        </View>

        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>
            S
          </Text>
        </View>

      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="Search doctors..."
        placeholderTextColor="#94A3B8"
        style={styles.searchInput}
      />

      {/* BANNER */}
      <View style={styles.banner}>

        <Text style={styles.bannerTitle}>
          Book Appointments Easily
        </Text>

        <Text style={styles.bannerSubtitle}>
          Find trusted doctors near you
        </Text>

      </View>

      {/* CATEGORIES */}
      <View style={styles.sectionRow}>

        <Text style={styles.sectionTitle}>
          Categories
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Categories')
          }>

          <Text style={styles.viewAll}>
            View All
          </Text>

        </TouchableOpacity>

      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}>

        {categories.map((item, index) => (

          <TouchableOpacity
            key={index}
            style={styles.categoryCard}>

            <Text style={styles.categoryText}>
              {item}
            </Text>

          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* TOP DOCTORS */}
      <Text style={styles.sectionTitle}>
        Top Doctors
      </Text>

      {topDoctors.map(item => (

        <TouchableOpacity
          key={item.id}
          style={styles.doctorCard}
          onPress={() =>
            navigation.navigate(
              'DoctorDetail',
            )
          }>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              DR
            </Text>
          </View>

          <View style={styles.doctorInfo}>

            <Text style={styles.doctorName}>
              {item.name}
            </Text>

            <Text style={styles.specialty}>
              {item.specialty}
            </Text>

            <Text style={styles.exp}>
              {item.experience}
            </Text>

          </View>

        </TouchableOpacity>
      ))}

    </ScrollView>
  );
};

export default PatientHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  greeting: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 4,
  },

  username: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },

  profileCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    marginBottom: 22,
    fontSize: 15,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  banner: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },

  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },

  bannerSubtitle: {
    fontSize: 14,
    color: '#DBEAFE',
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },

  viewAll: {
    color: '#2563EB',
    fontWeight: '700',
  },

  categoryCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    marginRight: 14,
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

  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
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

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatarText: {
    color: '#2563EB',
    fontWeight: '800',
    fontSize: 16,
  },

  doctorInfo: {
    flex: 1,
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
    marginBottom: 4,
  },

  exp: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
});