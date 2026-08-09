import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const logo = require('../../assets/images/logo.png');

const SplashScreen = ({navigation}: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');

      setTimeout(() => {
        if (token && user) {
          const userData = JSON.parse(user);

          if (userData.role === 'patient') {
            navigation.replace('PatientTabs');
          } else if (userData.role === 'doctor') {
            navigation.replace('DoctorTabs');
          } else if (userData.role === 'clinic') {
            navigation.replace('ClinicTabs');
          } else {
            navigation.replace('RoleSelection');
          }
        } else {
          navigation.replace('RoleSelection');
        }
      }, 2500);
    } catch (error) {
      console.log(error);
      navigation.replace('RoleSelection');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0A0000" barStyle="light-content" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.tagline}>
          Modern Healthcare{'\n'}
          Management Platform
        </Text>

        <View style={styles.loader}>
          <View style={styles.dot} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
  },

  logo: {
    width: SCREEN_WIDTH * 0.55,
    height: (SCREEN_WIDTH * 0.55) / 1.62,
    marginBottom: 24,
  },

  tagline: {
    color: '#6B6B6B',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  loader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E63946',
    marginRight: 10,
  },

  loadingText: {
    color: '#6B6B6B',
    fontSize: 14,
  },
});