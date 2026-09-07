import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { LoaderProvider } from './src/context/LoaderContext';
import { AlertProvider } from './src/context/AlertContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0A0000"
        translucent={false}
      />
        <LoaderProvider>
           <AlertProvider>
      <AppNavigator />
      </AlertProvider>
      </LoaderProvider>
    </SafeAreaProvider>
  );
};

export default App;