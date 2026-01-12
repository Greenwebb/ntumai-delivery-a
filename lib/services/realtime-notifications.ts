// @ts-nocheck
/**
 * Real-time Notification Handler
 * Connects WebSocket events to push notifications
 */

import { notificationEvents, JobOfferEvent, ChatMessageEvent, OrderStatusEvent } from './notification-events';

// WebSocket connection state
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

// Event listeners
type EventCallback = (data: any) => void;
const eventListeners: Map<string, Set<EventCallback>> = new Map();

/**
 * Connect to the real-time notification server
 */
export function connectToRealtimeServer(userId: string, authToken: string): void {
  const wsUrl = `wss://api.ntumai.com/ws?userId=${userId}&token=${authToken}`;
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0;
      
      // Subscribe to user's notification channels
      ws?.send(JSON.stringify({
        type: 'subscribe',
        channels: ['job_offers', 'chat_messages', 'order_updates'],
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      attemptReconnect(userId, authToken);
    };
  } catch (error) {
    console.error('Failed to connect to WebSocket:', error);
    attemptReconnect(userId, authToken);
  }
}

/**
 * Disconnect from the real-time server
 */
export function disconnectFromRealtimeServer(): void {
  if (ws) {
    ws.close();
    ws = null;
  }
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent reconnection
}

/**
 * Handle incoming WebSocket messages
 */
function handleWebSocketMessage(data: any): void {
  const { type, payload } = data;
  
  // Emit to local listeners
  emitEvent(type, payload);
  
  // Trigger push notifications based on event type
  switch (type) {
    case 'new_job_offer':
      handleNewJobOffer(payload);
      break;
      
    case 'new_chat_message':
      handleNewChatMessage(payload);
      break;
      
    case 'order_status_changed':
      handleOrderStatusChange(payload);
      break;
      
    case 'job_offer_expired':
      handleJobOfferExpired(payload);
      break;
      
    case 'job_accepted_by_other':
      handleJobAcceptedByOther(payload);
      break;
      
    default:
      console.log('Unknown WebSocket event:', type);
  }
}

/**
 * Handle new job offer from WebSocket
 */
async function handleNewJobOffer(payload: any): Promise<void> {
  const event: JobOfferEvent = {
    jobId: payload.id,
    type: payload.jobType || 'delivery',
    pickupAddress: payload.pickup?.address || 'Pickup Location',
    dropoffAddress: payload.dropoff?.address || 'Dropoff Location',
    estimatedEarnings: payload.earnings || 0,
    distance: payload.distance || '0 km',
    expiresAt: new Date(payload.expiresAt || Date.now() + 30000),
  };
  
  await notificationEvents.handleJobOffer(event);
}

/**
 * Handle new chat message from WebSocket
 */
async function handleNewChatMessage(payload: any): Promise<void> {
  const event: ChatMessageEvent = {
    conversationId: payload.conversationId,
    senderId: payload.sender?.id || '',
    senderName: payload.sender?.name || 'User',
    message: payload.content || '',
    orderId: payload.orderId,
  };
  
  await notificationEvents.handleChatMessage(event);
}

/**
 * Handle order status change from WebSocket
 */
async function handleOrderStatusChange(payload: any): Promise<void> {
  const event: OrderStatusEvent = {
    orderId: payload.orderId,
    status: payload.newStatus,
    previousStatus: payload.previousStatus,
    taskerName: payload.tasker?.name,
    estimatedArrival: payload.eta,
  };
  
  await notificationEvents.handleOrderStatus(event);
}

/**
 * Handle job offer expiration
 */
function handleJobOfferExpired(payload: any): void {
  console.log('Job offer expired:', payload.jobId);
  emitEvent('job_expired', payload);
}

/**
 * Handle job accepted by another tasker
 */
function handleJobAcceptedByOther(payload: any): void {
  console.log('Job accepted by another tasker:', payload.jobId);
  emitEvent('job_taken', payload);
}

/**
 * Attempt to reconnect to WebSocket
 */
function attemptReconnect(userId: string, authToken: string): void {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('Max reconnection attempts reached');
    return;
  }
  
  reconnectAttempts++;
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  
  setTimeout(() => {
    connectToRealtimeServer(userId, authToken);
  }, RECONNECT_DELAY * reconnectAttempts);
}

/**
 * Subscribe to local events
 */
export function addEventListener(event: string, callback: EventCallback): () => void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event)!.add(callback);
  
  // Return unsubscribe function
  return () => {
    eventListeners.get(event)?.delete(callback);
  };
}

/**
 * Emit event to local listeners
 */
function emitEvent(event: string, data: any): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach((callback) => callback(data));
  }
}

/**
 * Send message through WebSocket
 */
export function sendWebSocketMessage(type: string, payload: any): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected');
    return false;
  }
  
  ws.send(JSON.stringify({ type, payload }));
  return true;
}

/**
 * Check if WebSocket is connected
 */
export function isConnected(): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

// Export singleton for easy access
export const realtimeNotifications = {
  connect: connectToRealtimeServer,
  disconnect: disconnectFromRealtimeServer,
  addEventListener,
  sendMessage: sendWebSocketMessage,
  isConnected,
};
