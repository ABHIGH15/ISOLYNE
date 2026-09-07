import { Platform } from 'react-native';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || 'mock-app-id-for-shipaton';

export const NotificationService = {
  initialize: () => {
    if (Platform.OS === 'web') return; 

    try {
      console.log('OneSignal initialization skipped in mock environment');
    } catch (e) {
      console.log(e);
    }
  },

  login: (userId: string) => {
    try {
      console.log(`Mock OneSignal login: ${userId}`);
    } catch (e) {}
  },

  logout: () => {
    try {
      console.log('Mock OneSignal logout');
    } catch (e) {}
  },

  tagUser: (key: string, value: string) => {
    try {
      console.log(`Mock OneSignal tag: ${key}=${value}`);
    } catch (e) {}
  }
};
