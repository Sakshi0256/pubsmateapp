import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export const useAutoRefresh = (callback: () => void, intervalMs?: number) => {
  const appState = useRef(AppState.currentState);

  useFocusEffect(
    useCallback(() => {
      callback();
    }, [callback])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        callback();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [callback]);

  useEffect(() => {
    if (!intervalMs) return;
    const timer = setInterval(callback, intervalMs);
    return () => clearInterval(timer);
  }, [callback, intervalMs]);
};