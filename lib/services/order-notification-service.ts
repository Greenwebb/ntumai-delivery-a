// Order notification service for ready-for-pickup and status updates
import { isDemoMode } from '@/lib/config/demo-mode';
import { Platform } from 'react-native';

interface OrderNotification {
  orderId: string;
  orderNumber: string;
  title: string;
  message: string;
  type: 'ready' | 'accepted' | 'preparing' | 'completed' | 'cancelled';
  timestamp: string;
}

class OrderNotificationService {
  /**
   * Send ready-for-pickup notification to customer and driver
   */
  async notifyOrderReady(orderId: string, orderNumber: string, restaurantName: string) {
    const notification: OrderNotification = {
      orderId,
      orderNumber,
      title: 'Order Ready for Pickup',
      message: `Your order ${orderNumber} from ${restaurantName} is ready for pickup!`,
      type: 'ready',
      timestamp: new Date().toISOString(),
    };

    if (isDemoMode()) {
      // In demo mode, just log the notification
      console.log('📦 Order Ready Notification:', notification);
      
      // Show local notification if on mobile
      if (Platform.OS !== 'web') {
        this.showLocalNotification(notification);
      }
      
      return;
    }

    // In production, send push notification via API
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/notifications/send', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     recipients: ['customer', 'driver'],
      //     notification,
      //   }),
      // });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Send order accepted notification to customer
   */
  async notifyOrderAccepted(orderId: string, orderNumber: string, prepTime: number) {
    const notification: OrderNotification = {
      orderId,
      orderNumber,
      title: 'Order Accepted',
      message: `Your order ${orderNumber} has been accepted. Estimated prep time: ${prepTime} minutes.`,
      type: 'accepted',
      timestamp: new Date().toISOString(),
    };

    if (isDemoMode()) {
      console.log('✅ Order Accepted Notification:', notification);
      if (Platform.OS !== 'web') {
        this.showLocalNotification(notification);
      }
      return;
    }

    // In production, send via API
    try {
      // TODO: Implement API call
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Send order preparing notification to customer
   */
  async notifyOrderPreparing(orderId: string, orderNumber: string) {
    const notification: OrderNotification = {
      orderId,
      orderNumber,
      title: 'Order Being Prepared',
      message: `Your order ${orderNumber} is now being prepared.`,
      type: 'preparing',
      timestamp: new Date().toISOString(),
    };

    if (isDemoMode()) {
      console.log('👨‍🍳 Order Preparing Notification:', notification);
      if (Platform.OS !== 'web') {
        this.showLocalNotification(notification);
      }
      return;
    }

    // In production, send via API
    try {
      // TODO: Implement API call
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Send order completed notification
   */
  async notifyOrderCompleted(orderId: string, orderNumber: string) {
    const notification: OrderNotification = {
      orderId,
      orderNumber,
      title: 'Order Delivered',
      message: `Your order ${orderNumber} has been delivered. Enjoy your meal!`,
      type: 'completed',
      timestamp: new Date().toISOString(),
    };

    if (isDemoMode()) {
      console.log('🎉 Order Completed Notification:', notification);
      if (Platform.OS !== 'web') {
        this.showLocalNotification(notification);
      }
      return;
    }

    // In production, send via API
    try {
      // TODO: Implement API call
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Send order cancelled notification
   */
  async notifyOrderCancelled(orderId: string, orderNumber: string, reason?: string) {
    const notification: OrderNotification = {
      orderId,
      orderNumber,
      title: 'Order Cancelled',
      message: reason 
        ? `Your order ${orderNumber} has been cancelled. Reason: ${reason}`
        : `Your order ${orderNumber} has been cancelled.`,
      type: 'cancelled',
      timestamp: new Date().toISOString(),
    };

    if (isDemoMode()) {
      console.log('❌ Order Cancelled Notification:', notification);
      if (Platform.OS !== 'web') {
        this.showLocalNotification(notification);
      }
      return;
    }

    // In production, send via API
    try {
      // TODO: Implement API call
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Show local notification (for demo mode on mobile)
   */
  private async showLocalNotification(notification: OrderNotification) {
    if (Platform.OS === 'web') return;

    try {
      // Check if expo-notifications is available
      const Notifications = await import('expo-notifications');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: { orderId: notification.orderId },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      // Notifications not available in Expo Go
      console.log('Local notification skipped (Expo Go):', notification.title);
    }
  }

  /**
   * Get notification history for an order
   */
  async getOrderNotifications(orderId: string): Promise<OrderNotification[]> {
    if (isDemoMode()) {
      // Return mock notification history
      return [
        {
          orderId,
          orderNumber: '#0001',
          title: 'Order Placed',
          message: 'Your order has been placed successfully',
          type: 'accepted',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        },
        {
          orderId,
          orderNumber: '#0001',
          title: 'Order Accepted',
          message: 'Restaurant has accepted your order',
          type: 'accepted',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          orderId,
          orderNumber: '#0001',
          title: 'Order Being Prepared',
          message: 'Your order is now being prepared',
          type: 'preparing',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ];
    }

    // In production, fetch from API
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/orders/${orderId}/notifications`);
      // return await response.json();
      return [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }
}

export const orderNotificationService = new OrderNotificationService();
