import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import CustomAlert from '../components/CustomAlert';
import { setAlertHandler } from '../services/alertService';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertContextType {
  showAlert: (title: string, message: string, buttons?: any[]) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('info');

  const show = (msg: string, alertType: AlertType) => {
    setMessage(msg);
    setType(alertType);
    setVisible(true);
  };

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  // ── Public showAlert (title, message, buttons) ──
  const showAlert = useCallback(
    (title: string, message: string, buttons?: any[]) => {
      let alertType: AlertType = 'info';
      const lower = title.toLowerCase();
      if (lower.includes('success')) alertType = 'success';
      else if (lower.includes('error') || lower.includes('failed') || lower.includes('fail')) alertType = 'error';
      else if (lower.includes('warning')) alertType = 'warning';
      else alertType = 'info';
      show(message, alertType);
    },
    []
  );

  // ── Register global helpers ──
  useEffect(() => {
    // Handler for the service (used internally)
    const handler = (msg: string, opts?: { type?: AlertType; duration?: number }) => {
      setMessage(msg);
      setType(opts?.type || 'info');
      setVisible(true);
    };
    setAlertHandler(handler);

    // ── Global showAlert (title, message) – for legacy calls ──
    global.showAlert = (title: string, message: string) => {
      let alertType: AlertType = 'info';
      const lower = title.toLowerCase();
      if (lower.includes('success')) alertType = 'success';
      else if (lower.includes('error') || lower.includes('failed')) alertType = 'error';
      else if (lower.includes('warning')) alertType = 'warning';
      else alertType = 'info';
      setMessage(message);
      setType(alertType);
      setVisible(true);
    };

    // ── Convenience helpers ──
    global.showSuccess = (msg: string) => {
      setMessage(msg);
      setType('success');
      setVisible(true);
    };
    global.showError = (msg: string) => {
      setMessage(msg);
      setType('error');
      setVisible(true);
    };
    global.showInfo = (msg: string) => {
      setMessage(msg);
      setType('info');
      setVisible(true);
    };
    global.showWarning = (msg: string) => {
      setMessage(msg);
      setType('warning');
      setVisible(true);
    };

    return () => {
      delete global.showAlert;
      delete global.showSuccess;
      delete global.showError;
      delete global.showInfo;
      delete global.showWarning;
      setAlertHandler(null);
    };
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={visible}
        message={message}
        type={type}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within an AlertProvider');
  return context;
};