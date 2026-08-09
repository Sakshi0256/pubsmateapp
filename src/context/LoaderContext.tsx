import React, { createContext, useContext, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

const LoaderContext = createContext({
  show: () => {},
  hide: () => {},
});

export const useLoader = () => useContext(LoaderContext);

let activeRequests = 0;

export const LoaderProvider = ({ children }: any) => {
  const [visible, setVisible] = useState(false);

  const show = () => {
    activeRequests += 1;
    setVisible(true);
  };

  const hide = () => {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) setVisible(false);
  };

  return (
    <LoaderContext.Provider value={{ show, hide }}>
      {children}
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#D62828" />
        </View>
      </Modal>
    </LoaderContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});