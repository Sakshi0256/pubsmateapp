import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

const categories = [
  {
    id: 1,
    name: 'Cardiologist',
    icon: '❤️',
  },

  {
    id: 2,
    name: 'Dentist',
    icon: '🦷',
  },

  {
    id: 3,
    name: 'Neurologist',
    icon: '🧠',
  },

  {
    id: 4,
    name: 'Dermatologist',
    icon: '✨',
  },

  {
    id: 5,
    name: 'Orthopedic',
    icon: '🦴',
  },

  {
    id: 6,
    name: 'Pediatrician',
    icon: '👶',
  },
];

const CategoryScreen = ({navigation}: any) => {

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate(
          'DoctorList',
          {
            category: item.name,
          },
        )
      }>

      <Text style={styles.icon}>
        {item.icon}
      </Text>

      <Text style={styles.name}>
        {item.name}
      </Text>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <Text style={styles.header}>
        Categories
      </Text>

      <FlatList
        data={categories}
        keyExtractor={item =>
          item.id.toString()
        }
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
        }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
};

export default CategoryScreen;

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
    width: '48%',
    borderRadius: 24,
    paddingVertical: 30,
    alignItems: 'center',
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

  icon: {
    fontSize: 38,
    marginBottom: 14,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
});