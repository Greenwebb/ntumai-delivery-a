/**
 * GeofencingService - Proximity-based alerts for delivery tracking
 * Triggers push notifications when driver enters pickup/delivery zones
 */
import * as Location from 'expo-location';
import { PushNotificationService } from './push-notification-service';

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'pickup' | 'delivery';
}

export interface GeofenceEvent {
  zoneId: string;
  zoneName: string;
  zoneType: 'pickup' | 'delivery';
  timestamp: string;
  distance: number; // meters from zone center
}

type GeofenceCallback = (event: GeofenceEvent) => void;

class GeofencingServiceClass {
  private activeZones: Map<string, GeofenceZone> = new Map();
  private callbacks: Map<string, Set<GeofenceCallback>> = new Map();
  private watchId: Location.LocationSubscription | null = null;
  private lastNotifiedZones: Set<string> = new Set();

  /**
   * Start monitoring geofence zones
   */
  async startMonitoring(zones: GeofenceZone[], orderId: string, callback: GeofenceCallback) {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission not granted');
      return;
    }

    // Store zones and callback
    zones.forEach((zone) => this.activeZones.set(zone.id, zone));
    if (!this.callbacks.has(orderId)) {
      this.callbacks.set(orderId, new Set());
    }
    this.callbacks.get(orderId)!.add(callback);

    // Start watching location if not already watching
    if (!this.watchId) {
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        (location) => {
          this.checkGeofences(location.coords.latitude, location.coords.longitude);
        }
      );
    }
  }

  /**
   * Stop monitoring for a specific order
   */
  stopMonitoring(orderId: string) {
    this.callbacks.delete(orderId);

    // If no more callbacks, stop watching location
    if (this.callbacks.size === 0 && this.watchId) {
      this.watchId.remove();
      this.watchId = null;
      this.activeZones.clear();
      this.lastNotifiedZones.clear();
    }
  }

  /**
   * Check if current location is within any geofence
   */
  private checkGeofences(latitude: number, longitude: number) {
    this.activeZones.forEach((zone) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        zone.latitude,
        zone.longitude
      );

      // Check if entered the zone
      if (distance <= zone.radius && !this.lastNotifiedZones.has(zone.id)) {
        this.lastNotifiedZones.add(zone.id);
        this.triggerGeofenceEvent(zone, distance);
      }

      // Check if exited the zone
      if (distance > zone.radius && this.lastNotifiedZones.has(zone.id)) {
        this.lastNotifiedZones.delete(zone.id);
      }
    });
  }

  /**
   * Trigger geofence event and send notifications
   */
  private triggerGeofenceEvent(zone: GeofenceZone, distance: number) {
    const event: GeofenceEvent = {
      zoneId: zone.id,
      zoneName: zone.name,
      zoneType: zone.type,
      timestamp: new Date().toISOString(),
      distance,
    };

    // Notify all callbacks
    this.callbacks.forEach((callbacks) => {
      callbacks.forEach((callback) => callback(event));
    });

    // Send push notification
    this.sendGeofenceNotification(zone);
  }

  /**
   * Send push notification for geofence event
   */
  private async sendGeofenceNotification(zone: GeofenceZone) {
    const title =
      zone.type === 'pickup'
        ? 'Driver Approaching Pickup'
        : 'Driver Approaching Delivery';

    const body =
      zone.type === 'pickup'
        ? `Your driver has arrived at ${zone.name} to pick up your order.`
        : `Your driver is approaching ${zone.name}. Please be ready to receive your order.`;

    await PushNotificationService.scheduleLocalNotification({
      title,
      body,
      data: {
        type: 'geofence_alert',
        zoneId: zone.id,
        zoneType: zone.type,
      },
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in meters
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Mock geofence trigger for testing
   */
  mockGeofenceTrigger(zone: GeofenceZone) {
    this.triggerGeofenceEvent(zone, 0);
  }

  /**
   * Get active zones
   */
  getActiveZones(): GeofenceZone[] {
    return Array.from(this.activeZones.values());
  }

  /**
   * Clear all monitoring
   */
  clearAll() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.activeZones.clear();
    this.callbacks.clear();
    this.lastNotifiedZones.clear();
  }
}

// Export singleton instance
export const GeofencingService = new GeofencingServiceClass();

// React hook for easy integration
import { useEffect, useState } from 'react';

export function useGeofencing(
  orderId: string | null,
  pickupLocation: { latitude: number; longitude: number; name: string } | null,
  deliveryLocation: { latitude: number; longitude: number; name: string } | null
) {
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!orderId || !pickupLocation || !deliveryLocation) {
      setIsMonitoring(false);
      return;
    }

    const zones: GeofenceZone[] = [
      {
        id: `pickup-${orderId}`,
        name: pickupLocation.name,
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
        radius: 100, // 100 meters
        type: 'pickup',
      },
      {
        id: `delivery-${orderId}`,
        name: deliveryLocation.name,
        latitude: deliveryLocation.latitude,
        longitude: deliveryLocation.longitude,
        radius: 50, // 50 meters
        type: 'delivery',
      },
    ];

    const handleGeofenceEvent = (event: GeofenceEvent) => {
      setEvents((prev) => [...prev, event]);
    };

    GeofencingService.startMonitoring(zones, orderId, handleGeofenceEvent);
    setIsMonitoring(true);

    return () => {
      GeofencingService.stopMonitoring(orderId);
      setIsMonitoring(false);
    };
  }, [orderId, pickupLocation, deliveryLocation]);

  return {
    events,
    isMonitoring,
    mockTrigger: (zoneType: 'pickup' | 'delivery') => {
      const zones = GeofencingService.getActiveZones();
      const zone = zones.find((z) => z.type === zoneType);
      if (zone) {
        GeofencingService.mockGeofenceTrigger(zone);
      }
    },
  };
}
