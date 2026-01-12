// @ts-nocheck
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { JobOffer } from '@/components/job-offer-modal';

const PUSH_TOKEN_KEY = 'expo_push_token';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Lazy load notifications module
let Notifications: any = null;

async function getNotifications() {
  if (Notifications) return Notifications;
  if (Platform.OS === 'web' || isExpoGo) return null;
  
  try {
    Notifications = await import('expo-notifications');
    return Notifications;
  } catch (e) {
    console.warn('expo-notifications not available:', e);
    return null;
  }
}

/**
 * Notification settings interface
 */
export interface NotificationSettings {
  jobAlerts: boolean;
  chatMessages: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  sound: boolean;
  vibration: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  jobAlerts: true,
  chatMessages: true,
  orderUpdates: true,
  promotions: false,
  sound: true,
  vibration: true,
};

/**
 * Configure notification handler for foreground notifications
 * Only set up on native platforms (not web or Expo Go)
 */
async function configureNotificationHandler() {
  const notifications = await getNotifications();
  if (!notifications) return;
  
  notifications.setNotificationHandler({
    handleNotification: async (notification: any) => {
      const data = notification.request.content.data;
      
      // Check if it's a job offer - these should show even in foreground
      const isJobOffer = data?.type === 'job_offer';
      
      return {
        shouldShowAlert: !isJobOffer, // Don't show alert for job offers (we show modal instead)
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: !isJobOffer,
        shouldShowList: true,
      };
    },
  });
}

// Initialize handler asynchronously
if (Platform.OS !== 'web' && !isExpoGo) {
  configureNotificationHandler();
}

/**
 * Notification Service
 * Handles push notifications for tasker job alerts and other app notifications
 */
class NotificationService {
  private pushToken: string | null = null;
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private notificationListener: any = null;
  private responseListener: any = null;
  private onJobOfferCallback: ((offer: JobOffer) => void) | null = null;
  private initialized = false;

  constructor() {
    // Only load settings on native platforms (not Expo Go)
    if (Platform.OS !== 'web' && !isExpoGo) {
      this.loadSettings();
    }
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<string | null> {
    if (isExpoGo) {
      console.log('Push notifications not available in Expo Go');
      return null;
    }
    
    // Request permissions
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return null;
    }

    // Get push token
    this.pushToken = await this.registerForPushNotifications();
    
    // Set up listeners
    await this.setupListeners();

    return this.pushToken;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web' || isExpoGo) {
      return false;
    }

    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return false;
    }

    const notifications = await getNotifications();
    if (!notifications) return false;

    const { status: existingStatus } = await notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await notifications.setNotificationChannelAsync('job-alerts', {
        name: 'Job Alerts',
        importance: notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#009688',
        sound: 'default',
      });

      await notifications.setNotificationChannelAsync('chat-messages', {
        name: 'Chat Messages',
        importance: notifications.AndroidImportance.HIGH,
        sound: 'default',
      });

      await notifications.setNotificationChannelAsync('order-updates', {
        name: 'Order Updates',
        importance: notifications.AndroidImportance.DEFAULT,
      });
    }

    return true;
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (isExpoGo) return null;
    
    const notifications = await getNotifications();
    if (!notifications) return null;
    
    try {
      // Check for cached token
      const cachedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (cachedToken) {
        this.pushToken = cachedToken;
        return cachedToken;
      }

      // Get new token
      const tokenData = await notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || undefined,
      });

      const token = tokenData.data;
      
      // Cache token
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      this.pushToken = token;

      return token;
    } catch (error) {
      // Silently fail if Firebase/FCM is not configured
      // This is expected in development builds without Firebase setup
      console.warn('Failed to get push token (this is normal if Firebase is not configured):', error.message);
      return null;
    }
  }

  /**
   * Set up notification listeners
   */
  private async setupListeners() {
    if (isExpoGo) return;
    
    const notifications = await getNotifications();
    if (!notifications) return;
    
    // Handle notifications received while app is foregrounded
    this.notificationListener = notifications.addNotificationReceivedListener(
      (notification: any) => {
        this.handleNotificationReceived(notification);
      }
    );

    // Handle notification taps
    this.responseListener = notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle received notification
   */
  private handleNotificationReceived(notification: any) {
    const data = notification.request.content.data;

    if (data?.type === 'job_offer' && this.onJobOfferCallback) {
      // Parse job offer from notification data
      const jobOffer: JobOffer = {
        id: data.jobId as string,
        type: data.jobType as JobOffer['type'],
        title: data.title as string,
        description: data.description as string,
        pickupAddress: data.pickupAddress as string,
        dropoffAddress: data.dropoffAddress as string,
        estimatedEarnings: data.estimatedEarnings as number,
        estimatedDistance: data.estimatedDistance as string,
        estimatedDuration: data.estimatedDuration as string,
        customerName: data.customerName as string,
        customerRating: data.customerRating as number,
        urgency: data.urgency as JobOffer['urgency'],
      };

      this.onJobOfferCallback(jobOffer);
    }
  }

  /**
   * Handle notification tap response
   */
  private handleNotificationResponse(response: any) {
    const data = response.notification.request.content.data;

    // Navigate based on notification type
    switch (data?.type) {
      case 'job_offer':
        // Navigate to job details or show modal
        console.log('Job offer tapped:', data.jobId);
        break;
      case 'chat_message':
        // Navigate to chat
        console.log('Chat message tapped:', data.conversationId);
        break;
      case 'order_update':
        // Navigate to order tracking
        console.log('Order update tapped:', data.orderId);
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  /**
   * Set callback for job offer notifications
   */
  setJobOfferCallback(callback: (offer: JobOffer) => void) {
    this.onJobOfferCallback = callback;
  }

  /**
   * Send local notification (for testing)
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>,
    channelId?: string
  ): Promise<string> {
    if (isExpoGo) {
      console.log('Local notifications not available in Expo Go');
      return '';
    }
    
    const notifications = await getNotifications();
    if (!notifications) return '';
    
    const id = await notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: this.settings.sound ? 'default' : undefined,
      },
      trigger: null, // Immediate
    });

    return id;
  }

  /**
   * Send job offer notification (for testing)
   */
  async sendJobOfferNotification(offer: JobOffer): Promise<string> {
    return this.sendLocalNotification(
      `New ${offer.urgency === 'express' ? '⚡ EXPRESS ' : ''}Job: K${offer.estimatedEarnings.toFixed(0)}`,
      `${offer.title} - ${offer.estimatedDistance}`,
      {
        type: 'job_offer',
        jobId: offer.id,
        jobType: offer.type,
        title: offer.title,
        description: offer.description,
        pickupAddress: offer.pickupAddress,
        dropoffAddress: offer.dropoffAddress,
        estimatedEarnings: offer.estimatedEarnings,
        estimatedDistance: offer.estimatedDistance,
        estimatedDuration: offer.estimatedDuration,
        customerName: offer.customerName,
        customerRating: offer.customerRating,
        urgency: offer.urgency,
      },
      'job-alerts'
    );
  }

  /**
   * Send chat message notification
   */
  async sendChatNotification(
    senderName: string,
    message: string,
    conversationId: string
  ): Promise<string> {
    if (!this.settings.chatMessages) return '';

    return this.sendLocalNotification(
      senderName,
      message,
      {
        type: 'chat_message',
        conversationId,
      },
      'chat-messages'
    );
  }

  /**
   * Send order update notification
   */
  async sendOrderUpdateNotification(
    orderId: string,
    status: string,
    message: string
  ): Promise<string> {
    if (!this.settings.orderUpdates) return '';

    return this.sendLocalNotification(
      `Order ${status}`,
      message,
      {
        type: 'order_update',
        orderId,
        status,
      },
      'order-updates'
    );
  }

  /**
   * Load notification settings
   */
  private async loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  /**
   * Save notification settings
   */
  async saveSettings(settings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...settings };
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Clear badge count
   */
  async clearBadge() {
    if (isExpoGo) return;
    const notifications = await getNotifications();
    if (notifications) {
      await notifications.setBadgeCountAsync(0);
    }
  }

  /**
   * Set badge count
   */
  async setBadge(count: number) {
    if (isExpoGo) return;
    const notifications = await getNotifications();
    if (notifications) {
      await notifications.setBadgeCountAsync(count);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAll() {
    if (isExpoGo) return;
    const notifications = await getNotifications();
    if (notifications) {
      await notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

// Export singleton instance - lazy initialization to avoid web/Expo Go errors
let _notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!_notificationService) {
    _notificationService = new NotificationService();
  }
  return _notificationService;
}

// For backward compatibility - create a safe instance
export const notificationService = new NotificationService();
export default notificationService;
