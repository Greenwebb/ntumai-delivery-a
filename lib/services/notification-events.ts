// @ts-nocheck
/**
 * Notification Event Handler
 * Connects NotificationService to real job offers, chat messages, and order status changes
 */

import { Platform } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Event types for type safety
export interface JobOfferEvent {
  jobId: string;
  type: 'delivery' | 'errand' | 'marketplace';
  pickupAddress: string;
  dropoffAddress: string;
  estimatedEarnings: number;
  distance: string;
  expiresAt: Date;
}

export interface ChatMessageEvent {
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  orderId?: string;
}

export interface OrderStatusEvent {
  orderId: string;
  status: 'confirmed' | 'preparing' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  previousStatus?: string;
  taskerName?: string;
  estimatedArrival?: string;
}

/**
 * Handle new job offer notification for taskers
 */
export async function handleJobOfferNotification(event: JobOfferEvent): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Job offer notification (simulated):', event);
    return;
  }
  
  const { notificationService } = await import('./notification-service');
  
  const title = getJobOfferTitle(event.type);
  const body = `K${event.estimatedEarnings.toFixed(0)} • ${event.distance} away\n${event.pickupAddress} → ${event.dropoffAddress}`;
  
  await notificationService.sendLocalNotification(
    title,
    body,
    {
      type: 'job_offer',
      jobId: event.jobId,
      jobType: event.type,
      earnings: event.estimatedEarnings,
      expiresAt: event.expiresAt.toISOString(),
    }
  );
}

/**
 * Handle new chat message notification
 */
export async function handleChatMessageNotification(event: ChatMessageEvent): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Chat message notification (simulated):', event);
    return;
  }
  
  const { notificationService } = await import('./notification-service');
  
  const title = event.senderName;
  const body = truncateMessage(event.message, 100);
  
  await notificationService.sendChatNotification(
    title,
    body,
    event.conversationId
  );
}

/**
 * Handle order status change notification
 */
export async function handleOrderStatusNotification(event: OrderStatusEvent): Promise<void> {
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Order status notification (simulated):', event);
    return;
  }
  
  const { notificationService } = await import('./notification-service');
  
  const { title, body } = getOrderStatusContent(event);
  
  await notificationService.sendOrderUpdateNotification(
    event.orderId,
    event.status,
    body
  );
}

/**
 * Handle notification tap - navigate to appropriate screen
 */
export function handleNotificationTap(data: Record<string, any>): void {
  const { type } = data;
  
  switch (type) {
    case 'job_offer':
      // Navigate to job offer modal/screen
      router.push({
        pathname: '/(tasker)/JobOfferScreen',
        params: { jobId: data.jobId },
      });
      break;
      
    case 'chat_message':
      // Navigate to chat screen
      router.push({
        pathname: '/(customer)/ChatScreen',
        params: { 
          conversationId: data.conversationId,
          orderId: data.orderId,
        },
      });
      break;
      
    case 'order_status':
      // Navigate to order tracking
      router.push({
        pathname: '/(customer)/DeliveryTrackingScreen',
        params: { deliveryId: data.orderId },
      });
      break;
      
    default:
      console.log('Unknown notification type:', type);
  }
}

/**
 * Initialize notification event listeners
 */
export async function initializeNotificationEvents(): Promise<(() => void) | void> {
  // Skip initialization in Expo Go or web
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Notifications not available in Expo Go - using simulated notifications');
    return () => {};
  }
  
  try {
    const { notificationService } = await import('./notification-service');
    
    // Request permissions
    const hasPermission = await notificationService.requestPermissions();
    
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return () => {};
    }
    
    // Initialize the service
    await notificationService.initialize();
    
    return () => {
      notificationService.cleanup();
    };
  } catch (error) {
    console.warn('Failed to initialize notifications:', error);
    return () => {};
  }
}

// Helper functions
function getJobOfferTitle(type: string): string {
  switch (type) {
    case 'delivery':
      return '📦 New Delivery Request!';
    case 'errand':
      return '🏃 New Errand Request!';
    case 'marketplace':
      return '🛒 New Marketplace Order!';
    default:
      return '🔔 New Job Available!';
  }
}

function getOrderStatusContent(event: OrderStatusEvent): { title: string; body: string } {
  switch (event.status) {
    case 'confirmed':
      return {
        title: '✅ Order Confirmed',
        body: 'Your order has been confirmed and is being prepared.',
      };
    case 'preparing':
      return {
        title: '👨‍🍳 Preparing Your Order',
        body: 'The vendor is preparing your items.',
      };
    case 'picked_up':
      return {
        title: '📦 Order Picked Up',
        body: event.taskerName 
          ? `${event.taskerName} has picked up your order.`
          : 'Your order has been picked up.',
      };
    case 'in_transit':
      return {
        title: '🚗 On The Way',
        body: event.estimatedArrival
          ? `Your order will arrive by ${event.estimatedArrival}.`
          : 'Your order is on the way!',
      };
    case 'delivered':
      return {
        title: '🎉 Order Delivered!',
        body: 'Your order has been delivered. Enjoy!',
      };
    case 'cancelled':
      return {
        title: '❌ Order Cancelled',
        body: 'Your order has been cancelled.',
      };
    default:
      return {
        title: '📋 Order Update',
        body: `Your order status has been updated to: ${event.status}`,
      };
  }
}

function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + '...';
}

// Export singleton instance for easy access
export const notificationEvents = {
  handleJobOffer: handleJobOfferNotification,
  handleChatMessage: handleChatMessageNotification,
  handleOrderStatus: handleOrderStatusNotification,
  handleTap: handleNotificationTap,
  initialize: initializeNotificationEvents,
};
