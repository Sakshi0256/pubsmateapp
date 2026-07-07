import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const logo = require('../../assets/images/logo.png');

const RoleSelectionScreen = ({navigation}: any) => {
  const navigateToLogin = (role: string) => {
    navigation.navigate('Login', {role});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#050808" barStyle="light-content" />

      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.heading}>Choose Your Role</Text>
        <Text style={styles.subHeading}>Access your healthcare workspace</Text>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => navigateToLogin('doctor')}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🩺</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Doctor Login</Text>
            <Text style={styles.cardDesc}>Manage patients and appointments</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => navigateToLogin('clinic')}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🏥</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Clinic Login</Text>
            <Text style={styles.cardDesc}>Monitor doctors and clinic operations</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0000',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingTop: SCREEN_WIDTH * 0.1,
    marginBottom: SCREEN_WIDTH * 0.2,
  },

  logo: {
    width: SCREEN_WIDTH * 0.55,
    height: (SCREEN_WIDTH * 0.55) / 1.62, // original logo ratio (167x103)
    alignSelf: 'center',
    marginBottom: SCREEN_WIDTH * 0.08,
  },

  heading: {
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH * 0.085,
    fontWeight: '800',
    marginBottom: 8,
  },

  subHeading: {
    color: '#9B7474',
    fontSize: SCREEN_WIDTH * 0.038,
    marginBottom: SCREEN_WIDTH * 0.1,
  },

  card: {
    backgroundColor: '#150505',
    borderWidth: 1,
    borderColor: '#3D1414',
    borderRadius: 28,
    padding: SCREEN_WIDTH * 0.055,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  iconCircle: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_WIDTH * 0.15,
    borderRadius: 18,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: SCREEN_WIDTH * 0.06,
  },

  textContainer: {
    flex: 1,
    marginLeft: 16,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    marginBottom: 4,
  },

  cardDesc: {
    color: '#9B7474',
    fontSize: SCREEN_WIDTH * 0.033,
    lineHeight: 20,
  },
});