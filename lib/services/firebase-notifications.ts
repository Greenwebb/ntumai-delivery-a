import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = '@fcm_token';

/**
 * Firebase Cloud Messaging service for push notifications
 */
export class FirebaseNotificationService {
  /**
   * Request notification permissions and get FCM token
   */
  static async requestPermission(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        console.log('FCM not supported on web');
        return null;
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        return await this.getFCMToken();
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  /**
   * Get FCM token for this device
   */
  static async getFCMToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return null;
      }

      const token = await messaging().getToken();
      if (token) {
        console.log('FCM Token:', token);
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Get stored FCM token from AsyncStorage
   */
  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting stored FCM token:', error);
      return null;
    }
  }

  /**
   * Initialize FCM listeners
   */
  static initialize(
    onMessageReceived?: (message: any) => void,
    onTokenRefresh?: (token: string) => void
  ) {
    if (Platform.OS === 'web') {
      return () => {};
    }

    // Handle foreground messages
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);
      if (onMessageReceived) {
        onMessageReceived(remoteMessage);
      }
    });

    // Handle background/quit state messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background notification received:', remoteMessage);
      if (onMessageReceived) {
        onMessageReceived(remoteMessage);
      }
    });

    // Handle token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
      console.log('FCM token refreshed:', token);
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      if (onTokenRefresh) {
        onTokenRefresh(token);
      }
    });

    // Return cleanup function
    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  }

  /**
   * Check if notification permission is granted
   */
  static async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  /**
   * Delete FCM token (for logout)
   */
  static async deleteToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        return;
      }

      await messaging().deleteToken();
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }
}
