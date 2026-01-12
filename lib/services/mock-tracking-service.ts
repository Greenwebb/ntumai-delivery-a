// @ts-nocheck
/**
 * MockTrackingService - Mock APIs for features not available from Google Maps
 * Includes real-time driver location updates, traffic data, and geofencing
 */

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  heading: number; // degrees, 0-360
  speed: number; // km/h
  timestamp: Date;
}

export interface TrafficData {
  level: 'low' | 'moderate' | 'heavy' | 'severe';
  delayMinutes: number;
  affectedRoute: boolean;
}

export interface GeofenceEvent {
  type: 'enter' | 'exit';
  zone: 'pickup' | 'delivery';
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

class MockTrackingService {
  private driverLocations: Map<string, DriverLocation> = new Map();
  private locationUpdateCallbacks: Map<string, (location: DriverLocation) => void> = new Map();
  private geofenceCallbacks: Map<string, (event: GeofenceEvent) => void> = new Map();
  private simulationIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start tracking a driver's location (simulated)
   */
  startTrackingDriver(
    driverId: string,
    initialLocation: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    onLocationUpdate: (location: DriverLocation) => void
  ) {
    // Store callback
    this.locationUpdateCallbacks.set(driverId, onLocationUpdate);

    // Initialize driver location
    const driverLocation: DriverLocation = {
      driverId,
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
      heading: this.calculateHeading(initialLocation, destination),
      speed: 40 + Math.random() * 20, // 40-60 km/h
      timestamp: new Date(),
    };
    this.driverLocations.set(driverId, driverLocation);

    // Simulate location updates every 3 seconds
    const interval = setInterval(() => {
      this.simulateLocationUpdate(driverId, destination);
    }, 3000);

    this.simulationIntervals.set(driverId, interval);

    // Initial callback
    onLocationUpdate(driverLocation);
  }

  /**
   * Stop tracking a driver
   */
  stopTrackingDriver(driverId: string) {
    const interval = this.simulationIntervals.get(driverId);
    if (interval) {
      clearInterval(interval);
      this.simulationIntervals.delete(driverId);
    }
    this.locationUpdateCallbacks.delete(driverId);
    this.driverLocations.delete(driverId);
  }

  /**
   * Simulate driver location update (moving towards destination)
   */
  private simulateLocationUpdate(
    driverId: string,
    destination: { latitude: number; longitude: number }
  ) {
    const currentLocation = this.driverLocations.get(driverId);
    if (!currentLocation) return;

    // Calculate distance to destination
    const distance = this.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      destination.latitude,
      destination.longitude
    );

    // If very close to destination, stop moving
    if (distance < 0.0001) {
      return;
    }

    // Move towards destination (small step)
    const stepSize = 0.0001; // ~11 meters
    const latDiff = destination.latitude - currentLocation.latitude;
    const lngDiff = destination.longitude - currentLocation.longitude;
    const totalDiff = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    const newLocation: DriverLocation = {
      ...currentLocation,
      latitude: currentLocation.latitude + (latDiff / totalDiff) * stepSize,
      longitude: currentLocation.longitude + (lngDiff / totalDiff) * stepSize,
      heading: this.calculateHeading(currentLocation, destination),
      speed: 40 + Math.random() * 20, // Vary speed slightly
      timestamp: new Date(),
    };

    this.driverLocations.set(driverId, newLocation);

    // Trigger callback
    const callback = this.locationUpdateCallbacks.get(driverId);
    if (callback) {
      callback(newLocation);
    }
  }

  /**
   * Calculate heading between two points
   */
  private calculateHeading(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): number {
    const latDiff = to.latitude - from.latitude;
    const lngDiff = to.longitude - from.longitude;
    let heading = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
    heading = (heading + 360) % 360; // Normalize to 0-360
    return heading;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get current driver location
   */
  getDriverLocation(driverId: string): DriverLocation | null {
    return this.driverLocations.get(driverId) || null;
  }

  /**
   * Get mock traffic data for a route
   */
  async getTrafficData(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<TrafficData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Random traffic level
    const levels: TrafficData['level'][] = ['low', 'moderate', 'heavy', 'severe'];
    const level = levels[Math.floor(Math.random() * levels.length)];

    // Calculate delay based on level
    const delayMap = {
      low: 0,
      moderate: 5,
      heavy: 15,
      severe: 30,
    };

    return {
      level,
      delayMinutes: delayMap[level] + Math.floor(Math.random() * 5),
      affectedRoute: level !== 'low',
    };
  }

  /**
   * Set up geofencing for pickup/delivery zones
   */
  setupGeofencing(
    driverId: string,
    pickupZone: { latitude: number; longitude: number; radius: number },
    deliveryZone: { latitude: number; longitude: number; radius: number },
    onGeofenceEvent: (event: GeofenceEvent) => void
  ) {
    this.geofenceCallbacks.set(driverId, onGeofenceEvent);

    // Check geofence on each location update
    const originalCallback = this.locationUpdateCallbacks.get(driverId);
    if (!originalCallback) return;

    this.locationUpdateCallbacks.set(driverId, (location: DriverLocation) => {
      // Call original callback
      originalCallback(location);

      // Check geofences
      const distanceToPickup = this.calculateDistance(
        location.latitude,
        location.longitude,
        pickupZone.latitude,
        pickupZone.longitude
      ) * 1000; // Convert to meters

      const distanceToDelivery = this.calculateDistance(
        location.latitude,
        location.longitude,
        deliveryZone.latitude,
        deliveryZone.longitude
      ) * 1000;

      // Trigger geofence events
      if (distanceToPickup <= pickupZone.radius) {
        onGeofenceEvent({
          type: 'enter',
          zone: 'pickup',
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          timestamp: new Date(),
        });
      }

      if (distanceToDelivery <= deliveryZone.radius) {
        onGeofenceEvent({
          type: 'enter',
          zone: 'delivery',
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          timestamp: new Date(),
        });
      }
    });
  }

  /**
   * Calculate ETA with traffic consideration
   */
  async calculateETAWithTraffic(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    baseETAMinutes: number
  ): Promise<{
    eta: Date;
    etaMinutes: number;
    trafficDelay: number;
  }> {
    const traffic = await this.getTrafficData(origin, destination);
    const totalMinutes = baseETAMinutes + traffic.delayMinutes;
    
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + totalMinutes);

    return {
      eta,
      etaMinutes: totalMinutes,
      trafficDelay: traffic.delayMinutes,
    };
  }

  /**
   * Clean up all tracking
   */
  cleanup() {
    // Stop all simulations
    this.simulationIntervals.forEach((interval) => clearInterval(interval));
    this.simulationIntervals.clear();
    this.locationUpdateCallbacks.clear();
    this.geofenceCallbacks.clear();
    this.driverLocations.clear();
  }
}

// Export singleton instance
export const mockTrackingService = new MockTrackingService();
