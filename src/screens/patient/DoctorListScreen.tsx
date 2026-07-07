import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

const doctors = [
  {
    id: 1,
    name: 'Dr. Priya Mehta',
    specialty: 'Cardiologist',
    experience: '8 Years Experience',
    fee: '₹800',
    rating: '4.9',
  },

  {
    id: 2,
    name: 'Dr. Meena Sharma',
    specialty: 'Dermatologist',
    experience: '5 Years Experience',
    fee: '₹600',
    rating: '4.8',
  },

  {
    id: 3,
    name: 'Dr. Amit Verma',
    specialty: 'Neurologist',
    experience: '10 Years Experience',
    fee: '₹1200',
    rating: '4.7',
  },

  {
    id: 4,
    name: 'Dr. Rahul Jain',
    specialty: 'Dentist',
    experience: '6 Years Experience',
    fee: '₹500',
    rating: '4.6',
  },
];

const DoctorListScreen = ({navigation, route}: any) => {

  const category =
    route?.params?.category;

  const renderItem = ({item}: any) => (

    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate(
          'DoctorDetail',
          {
            doctor: item,
          },
        )
      }>

      {/* LEFT AVATAR */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          DR
        </Text>
      </View>

      {/* INFO */}
      <View style={styles.infoContainer}>

        <Text style={styles.name}>
          {item.name}
        </Text>

        <Text style={styles.specialty}>
          {item.specialty}
        </Text>

        <Text style={styles.experience}>
          {item.experience}
        </Text>

        <View style={styles.bottomRow}>

          <Text style={styles.fee}>
            {item.fee}
          </Text>

          <Text style={styles.rating}>
            ⭐ {item.rating}
          </Text>

        </View>

      </View>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <Text style={styles.header}>
        {category || 'Doctors'}
      </Text>

      <FlatList
        data={doctors}
        keyExtractor={item =>
          item.id.toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
};

export default DoctorListScreen;

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
    padding: 18,
    flexDirection: 'row',
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

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },

  infoContainer: {
    flex: 1,
  },

  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },

  specialty: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },

  experience: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fee: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
  },

  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
});