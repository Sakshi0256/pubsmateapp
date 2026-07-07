import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend IP
const BASE_URL = 'https://pubsmate-backend.vercel.app/api/v1';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Flag to prevent multiple logout triggers ──
let isLoggingOut = false;

// ── Request Interceptor ──
API.interceptors.request.use(
  async (config) => {
    try {
      // ✅ Always get fresh token from AsyncStorage
      let token = await AsyncStorage.getItem('token');
      
      // ✅ If not found, fallback to global (if set)
      if (!token && global.authToken) {
        token = global.authToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // ✅ Update global for future use
        global.authToken = token;
      } else {
        // ⚠️ Don't clear token here – just log
        console.log('⚠️ No token for request:', config.url);
      }
    } catch (error) {
      console.error('❌ Interceptor error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──
API.interceptors.response.use(
  (response) => {
    // ✅ On success, update global token if new token returned
    if (response.data?.token) {
      const token = response.data.token;
      global.authToken = token;
      AsyncStorage.setItem('token', token).catch(console.error);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // 🔥 If 401 and not login route, clear token and logout
    if (status === 401 && !url.includes('/auth/login')) {
      console.log('⏰ 401 Unauthorized – clearing token and logging out');

      // ✅ Prevent multiple logout calls
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

      // ✅ Redirect to login (can be handled in app)
      // You can use navigation here, but better to handle in a global listener
      // For now, we'll just reject
    }

    return Promise.reject(error);
  }
);

// ── Initialize token on app startup ──
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