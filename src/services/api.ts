import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://pubsmate-backend.vercel.app//api/v1';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Loader ref bridge (set by LoaderProvider) ──
let loaderRef: { show: () => void; hide: () => void } | null = null;
export const setLoaderRef = (ref: any) => {
  loaderRef = ref;
};

let isLoggingOut = false;

// ── Request Interceptor ──
API.interceptors.request.use(
  async (config) => {
    loaderRef?.show();   // add

    try {
      let token = await AsyncStorage.getItem('token');
      if (!token && global.authToken) {
        token = global.authToken;
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        global.authToken = token;
      } else {
        console.log('⚠️ No token for request:', config.url);
      }
    } catch (error) {
      console.error('❌ Interceptor error:', error);
    }
    return config;
  },
  (error) => {
    loaderRef?.hide();   // add
    return Promise.reject(error);
  }
);

// ── Response Interceptor ──
API.interceptors.response.use(
  (response) => {
    loaderRef?.hide();   // add

    if (response.data?.token) {
      const token = response.data.token;
      global.authToken = token;
      AsyncStorage.setItem('token', token).catch(console.error);
    }
    return response;
  },
  async (error) => {
    loaderRef?.hide();   // add

    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    if (status === 401 && !url.includes('/auth/login')) {
      console.log('⏰ 401 Unauthorized – clearing token and logging out');
      if (!isLoggingOut) {
        isLoggingOut = true;
        try {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          global.authToken = null;
        } catch (e) {
          console.error('Logout error:', e);
        } finally {
          isLoggingOut = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export const initializeToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      global.authToken = token;
      console.log('✅ Token initialized from AsyncStorage');
    }
  } catch (error) {
    console.error('❌ Error initializing token:', error);
  }
};

export default API;