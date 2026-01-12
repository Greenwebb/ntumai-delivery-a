/**
 * WebSocketTrackingService - Real-time order tracking with WebSocket (mock)
 * Simulates WebSocket connection for live driver location updates
 */

export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  driverLocation?: DriverLocation;
  eta?: number; // minutes
  distance?: number; // km
  message?: string;
}

type TrackingCallback = (update: OrderStatusUpdate) => void;

class WebSocketTrackingServiceClass {
  private subscribers: Map<string, Set<TrackingCallback>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private mockDriverLocations: Map<string, DriverLocation> = new Map();

  /**
   * Subscribe to real-time updates for an order
   */
  subscribe(orderId: string, callback: TrackingCallback): () => void {
    if (!this.subscribers.has(orderId)) {
      this.subscribers.set(orderId, new Set());
      this.startMockUpdates(orderId);
    }

    const callbacks = this.subscribers.get(orderId)!;
    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.stopMockUpdates(orderId);
        this.subscribers.delete(orderId);
      }
    };
  }

  /**
   * Start mock WebSocket updates for an order
   */
  private startMockUpdates(orderId: string) {
    // Initialize mock driver location (Lusaka coordinates)
    const initialLocation: DriverLocation = {
      latitude: -15.4167 + (Math.random() - 0.5) * 0.1,
      longitude: 28.2833 + (Math.random() - 0.5) * 0.1,
      heading: Math.random() * 360,
      speed: 20 + Math.random() * 20, // 20-40 km/h
      timestamp: new Date().toISOString(),
    };
    this.mockDriverLocations.set(orderId, initialLocation);

    // Send initial update
    this.emitUpdate(orderId, {
      orderId,
      status: 'in_transit',
      driverLocation: initialLocation,
      eta: 15 + Math.floor(Math.random() * 10),
      distance: 5 + Math.random() * 5,
      message: 'Driver is on the way',
    });

    // Update location every 3 seconds
    const interval = setInterval(() => {
      const currentLocation = this.mockDriverLocations.get(orderId);
      if (!currentLocation) return;

      // Simulate driver movement
      const newLocation: DriverLocation = {
        latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.001,
        longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.001,
        heading: currentLocation.heading + (Math.random() - 0.5) * 20,
        speed: Math.max(0, currentLocation.speed + (Math.random() - 0.5) * 5),
        timestamp: new Date().toISOString(),
      };
      this.mockDriverLocations.set(orderId, newLocation);

      // Calculate mock ETA (decreasing over time)
      const callbacks = this.subscribers.get(orderId);
      if (!callbacks || callbacks.size === 0) return;

      const eta = Math.max(1, 15 - Math.floor(Math.random() * 2));
      const distance = Math.max(0.5, 5 - Math.random() * 0.5);

      this.emitUpdate(orderId, {
        orderId,
        status: 'in_transit',
        driverLocation: newLocation,
        eta,
        distance,
      });
    }, 3000);

    this.intervals.set(orderId, interval);
  }

  /**
   * Stop mock updates for an order
   */
  private stopMockUpdates(orderId: string) {
    const interval = this.intervals.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(orderId);
    }
    this.mockDriverLocations.delete(orderId);
  }

  /**
   * Emit update to all subscribers
   */
  private emitUpdate(orderId: string, update: OrderStatusUpdate) {
    const callbacks = this.subscribers.get(orderId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(update));
    }
  }

  /**
   * Manually update order status (for testing)
   */
  updateOrderStatus(
    orderId: string,
    status: OrderStatusUpdate['status'],
    message?: string
  ) {
    const currentLocation = this.mockDriverLocations.get(orderId);
    this.emitUpdate(orderId, {
      orderId,
      status,
      driverLocation: currentLocation,
      message,
    });

    // Stop updates if order is completed
    if (status === 'delivered' || status === 'cancelled') {
      this.stopMockUpdates(orderId);
    }
  }

  /**
   * Disconnect all subscriptions
   */
  disconnectAll() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
    this.mockDriverLocations.clear();
  }

  /**
   * Get current driver location for an order
   */
  getCurrentLocation(orderId: string): DriverLocation | null {
    return this.mockDriverLocations.get(orderId) || null;
  }

  /**
   * Simulate driver arriving at pickup location
   */
  simulatePickup(orderId: string) {
    this.updateOrderStatus(orderId, 'picked_up', 'Driver has picked up your order');
  }

  /**
   * Simulate driver arriving at delivery location
   */
  simulateDelivery(orderId: string) {
    this.updateOrderStatus(orderId, 'delivered', 'Order has been delivered successfully');
  }

  /**
   * Simulate order cancellation
   */
  simulateCancellation(orderId: string, reason: string) {
    this.updateOrderStatus(orderId, 'cancelled', `Order cancelled: ${reason}`);
  }
}

// Export singleton instance
export const WebSocketTrackingService = new WebSocketTrackingServiceClass();

// React hook for easy integration
import { useEffect, useState } from 'react';

export function useOrderTracking(orderId: string | null) {
  const [update, setUpdate] = useState<OrderStatusUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setIsConnected(false);
      return;
    }

    setIsConnected(true);
    const unsubscribe = WebSocketTrackingService.subscribe(orderId, (newUpdate) => {
      setUpdate(newUpdate);
    });

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [orderId]);

  return {
    update,
    isConnected,
    currentLocation: update?.driverLocation || null,
    eta: update?.eta || null,
    distance: update?.distance || null,
    status: update?.status || null,
  };
}
