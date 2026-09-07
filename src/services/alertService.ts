import { Alert } from 'react-native';

let alertHandler: ((msg: string, opts?: any) => void) | null = null;

export const setAlertHandler = (handler: any) => {
  alertHandler = handler;
};

export const showAlert = (msg: string, opts?: any) => {
  if (alertHandler) {
    alertHandler(msg, opts);
  } else {
    Alert.alert('', msg);
  }
};