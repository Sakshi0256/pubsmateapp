import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type AlertType = 'success' | 'error' | 'info' | 'warning';

type CustomAlertProps = {
  visible: boolean;
  message: string;
  type?: AlertType;
  duration?: number;
  onDismiss?: () => void;
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  message,
  type = 'error',
  duration = 4000,
  onDismiss,
}) => {
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#D1FAE5', border: '#34D399', text: '#065F46', icon: 'checkmark-circle' };
      case 'error':
        return { bg: '#FEE2E2', border: '#F87171', text: '#991B1B', icon: 'alert-circle' };
      case 'warning':
        return { bg: '#FEF3C7', border: '#FBBF24', text: '#92400E', icon: 'warning' };
      case 'info':
        return { bg: '#DBEAFE', border: '#60A5FA', text: '#1E3A8A', icon: 'information-circle' };
      default:
        return { bg: '#FEE2E2', border: '#F87171', text: '#991B1B', icon: 'alert-circle' };
    }
  };

  const colors = getColors();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismiss?.());
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacityAnim.setValue(0);
      slideAnim.setValue(-80);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={colors.icon} size={24} color={colors.text} style={styles.icon} />
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name="close" size={20} color={colors.text} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

export default CustomAlert;