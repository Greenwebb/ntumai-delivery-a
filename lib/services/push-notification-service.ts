// @ts-nocheck
/**
 * PushNotificationService - Complete FCM push notifications integration
 * Handles notification permissions, token management, and message handling
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'order_update' | 'job_offer' | 'delivery_status' | 'chat_message' | 'substitution_request';
  orderId?: string;
  jobId?: string;
  deliveryId?: string;
  chatId?: string;
  substitutionId?: string;
  [key: string]: any;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: NotificationData;
  sound?: string;
  badge?: number;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize push notifications service
   */
  async initialize(): Promise<string | null> {
    try {
      // Register for push notifications
      const token = await this.registerForPushNotifications();
      
      if (token) {
        this.expoPushToken = token;
        console.log('Push notification token:', token);
        
        // Send token to backend
        await this.sendTokenToBackend(token);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      return token;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return null;
    }
  }

  /**
   * Register device for push notifications
   */
  private async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId || Constants.expoConfig?.projectId,
      });

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Job offers channel (high priority)
        await Notifications.setNotificationChannelAsync('job_offers', {
          name: 'Job Offers',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#0a7ea4',
          sound: 'default',
        });

        // Order updates channel
        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Order Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0a7ea4',
        });

        // Delivery status channel
        await Notifications.setNotificationChannelAsync('delivery', {
          name: 'Delivery Status',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22C55E',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification received while app is open
   */
  private handleNotificationReceived(notification: Notifications.Notification) {
    const data = notification.request.content.data as NotificationData;
    
    // Handle different notification types
    switch (data?.type) {
      case 'job_offer':
        // Show full-screen job offer modal
        console.log('Job offer received:', data.jobId);
        break;
      
      case 'order_update':
        // Update order status in store
        console.log('Order update:', data.orderId);
        break;
      
      case 'delivery_status':
        // Update delivery tracking
        console.log('Delivery status update:', data.deliveryId);
        break;
      
      case 'substitution_request':
        // Show substitution approval modal
        console.log('Substitution request:', data.substitutionId);
        break;
      
      case 'chat_message':
        // Update chat unread count
        console.log('Chat message:', data.chatId);
        break;
    }
  }

  /**
   * Handle user tapping on notification
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as NotificationData;
    
    // Navigate to appropriate screen based on notification type
    switch (data?.type) {
      case 'job_offer':
        // Navigate to job offer screen
        console.log('Navigate to job offer:', data.jobId);
        break;
      
      case 'order_update':
        // Navigate to order details
        console.log('Navigate to order:', data.orderId);
        break;
      
      case 'delivery_status':
        // Navigate to live tracking
        console.log('Navigate to tracking:', data.deliveryId);
        break;
      
      case 'substitution_request':
        // Navigate to active delivery with substitution modal
        console.log('Navigate to substitution:', data.substitutionId);
        break;
      
      case 'chat_message':
        // Navigate to chat
        console.log('Navigate to chat:', data.chatId);
        break;
    }
  }

  /**
   * Send push token to backend
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // Replace with actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          deviceId: Constants.deviceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register push token');
      }

      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(notification: PushNotification, delay: number = 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound || 'default',
          badge: notification.badge,
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  /**
   * Send job offer notification (call-like, high priority)
   */
  async sendJobOfferNotification(jobId: string, pickup: string, earnings: number) {
    await this.scheduleLocalNotification({
      title: '🚀 New Job Offer!',
      body: `Pickup: ${pickup}\nEstimated earnings: K${earnings.toFixed(2)}`,
      data: {
        type: 'job_offer',
        jobId,
      },
      sound: 'default',
    });
  }

  /**
   * Send order status update notification
   */
  async sendOrderUpdateNotification(orderId: string, status: string, message: string) {
    await this.scheduleLocalNotification({
      title: `Order ${status}`,
      body: message,
      data: {
        type: 'order_update',
        orderId,
        status,
      },
    });
  }

  /**
   * Send delivery status notification
   */
  async sendDeliveryStatusNotification(deliveryId: string, status: string, eta?: string) {
    let body = `Your delivery is ${status}`;
    if (eta) {
      body += `\nETA: ${eta}`;
    }

    await this.scheduleLocalNotification({
      title: '📦 Delivery Update',
      body,
      data: {
        type: 'delivery_status',
        deliveryId,
        status,
      },
    });
  }

  /**
   * Send substitution request notification
   */
  async sendSubstitutionRequestNotification(
    substitutionId: string,
    orderId: string,
    itemName: string
  ) {
    await this.scheduleLocalNotification({
      title: '🔄 Substitution Request',
      body: `Your tasker wants to substitute: ${itemName}`,
      data: {
        type: 'substitution_request',
        substitutionId,
        orderId,
      },
    });
  }

  /**
   * Get current push token
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
