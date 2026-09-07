import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useClinicProfile } from '../context/ClinicProfileContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ import

const ClinicHeader = () => {
  const navigation = useNavigation();
  const { clinic } = useClinicProfile();
  const { name, photo } = clinic;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
      <View style={styles.left}>
        <View style={styles.logoBox}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.logoImage} />
          ) : (
            <>
              <Text style={styles.logoP}>P</Text>
              <Text style={styles.logoPlus}>+</Text>
            </>
          )}
        </View>
        <Text style={styles.brandName} numberOfLines={1}>
          {name || 'Clinic'}
        </Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="settings-outline" size={22} color="#1A1A1A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,   // reduced from 12
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#EDEDED',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#D22828',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  logoP: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 18,
  },
  logoPlus: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    fontSize: 9,
    marginTop: -3,
  },
  brandName: {
    color: '#1A1A1A',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: -0.3,
    maxWidth: 200,
  },
});

export default ClinicHeader;