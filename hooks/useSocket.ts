// @ts-nocheck

// Custom hook for Socket.io real-time communication
import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '@/services/socketService';
import { useToast } from '@/lib/toast-provider';

interface UseSocketOptions {
  autoConnect?: boolean;
  showConnectionStatus?: boolean;
}

export function useSocket(userId: string, token: string, options: UseSocketOptions = {}) {
  const { autoConnect = true, showConnectionStatus = false } = options;
  const { showToast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const listenersRef = useRef<Map<string, Function>>(new Map());

  // Connect to Socket.io
  const connect = useCallback(async () => {
    try {
      await socketService.connect(userId, token);
      setIsConnected(true);
      setConnectionError(null);
      
      if (showConnectionStatus) {
        showToast({
          type: 'success',
          message: 'Connected to server',
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect';
      setConnectionError(errorMessage);
      setIsConnected(false);
      
      if (showConnectionStatus) {
        showToast({
          type: 'error',
          message: errorMessage,
        });
      }
    }
  }, [userId, token, showConnectionStatus, showToast]);

  // Disconnect from Socket.io
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    listenersRef.current.clear();
  }, []);

  // Subscribe to event
  const on = useCallback((event: string, callback: (data: any) => void) => {
    socketService.on(event, callback);
    listenersRef.current.set(event, callback);
  }, []);

  // Unsubscribe from event
  const off = useCallback((event: string) => {
    socketService.off(event);
    listenersRef.current.delete(event);
  }, []);

  // Subscribe to event once
  const once = useCallback((event: string, callback: (data: any) => void) => {
    socketService.once(event, callback);
  }, []);

  // Emit event
  const emit = useCallback((event: string, data?: any) => {
    if (isConnected) {
      socketService.emit(event, data);
    } else {
      console.warn(`[useSocket] Cannot emit ${event}: socket not connected`);
    }
  }, [isConnected]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      // Cleanup listeners on unmount
      listenersRef.current.forEach((callback, event) => {
        socketService.off(event);
      });
      listenersRef.current.clear();
    };
  }, [autoConnect, connect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    on,
    off,
    once,
    emit,
  };
}

// Specialized hooks for specific Socket.io events

export function useLocationUpdates(userId: string, token: string) {
  const [locations, setLocations] = useState<Map<string, any>>(new Map());
  const { on, off, isConnected } = useSocket(userId, token);

  useEffect(() => {
    if (isConnected) {
      on('location-update', (data) => {
        setLocations((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.taskerId, data);
          return newMap;
        });
      });
    }

    return () => {
      off('location-update');
    };
  }, [isConnected, on, off]);

  return {
    locations,
    getLocation: (taskerId: string) => locations.get(taskerId),
  };
}

export function useOrderStatusUpdates(userId: string, token: string) {
  const [orderStatuses, setOrderStatuses] = useState<Map<string, any>>(new Map());
  const { on, off, isConnected } = useSocket(userId, token);

  useEffect(() => {
    if (isConnected) {
      on('order-status', (data) => {
        setOrderStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.orderId, data);
          return newMap;
        });
      });
    }

    return () => {
      off('order-status');
    };
  }, [isConnected, on, off]);

  return {
    orderStatuses,
    getOrderStatus: (orderId: string) => orderStatuses.get(orderId),
  };
}

export function useJobOffers(userId: string, token: string) {
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const { on, off, emit, isConnected } = useSocket(userId, token);
  const { showToast } = useToast();

  useEffect(() => {
    if (isConnected) {
      on('job-offer', (data) => {
        setJobOffers((prev) => [...prev, data]);
        
        showToast({
          type: 'info',
          message: `New job offer: ${data.estimatedEarnings}`,
        });
      });
    }

    return () => {
      off('job-offer');
    };
  }, [isConnected, on, off, showToast]);

  const acceptJob = useCallback((jobId: string) => {
    if (isConnected) {
      socketService.acceptJobOffer(jobId);
      setJobOffers((prev) => prev.filter((offer) => offer.jobId !== jobId));
    }
  }, [isConnected]);

  const rejectJob = useCallback((jobId: string) => {
    if (isConnected) {
      socketService.rejectJobOffer(jobId);
      setJobOffers((prev) => prev.filter((offer) => offer.jobId !== jobId));
    }
  }, [isConnected]);

  return {
    jobOffers,
    acceptJob,
    rejectJob,
  };
}

export function useNotifications(userId: string, token: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { on, off, isConnected } = useSocket(userId, token);
  const { showToast } = useToast();

  useEffect(() => {
    if (isConnected) {
      on('notification', (data) => {
        setNotifications((prev) => [data, ...prev]);
        
        showToast({
          type: 'info',
          message: data.message,
        });
      });
    }

    return () => {
      off('notification');
    };
  }, [isConnected, on, off, showToast]);

  return {
    notifications,
    clearNotifications: () => setNotifications([]),
  };
}

export function useChat(userId: string, token: string, chatId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { on, off, emit, isConnected } = useSocket(userId, token);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isConnected) {
      on('message', (data) => {
        if (data.chatId === chatId) {
          setMessages((prev) => [...prev, data]);
        }
      });

      on('typing', (data) => {
        if (data.chatId === chatId) {
          setIsTyping(data.isTyping);
        }
      });
    }

    return () => {
      off('message');
      off('typing');
    };
  }, [isConnected, on, off, chatId]);

  const sendMessage = useCallback((message: string) => {
    if (isConnected) {
      socketService.emitMessage(chatId, message);
    }
  }, [isConnected, chatId]);

  const setTypingIndicator = useCallback((typing: boolean) => {
    if (isConnected) {
      socketService.emitTyping(chatId, typing);
      
      // Auto-clear typing indicator after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      if (typing) {
        typingTimeoutRef.current = setTimeout(() => {
          socketService.emitTyping(chatId, false);
        }, 3000);
      }
    }
  }, [isConnected, chatId]);

  return {
    messages,
    isTyping,
    sendMessage,
    setTypingIndicator,
  };
}
