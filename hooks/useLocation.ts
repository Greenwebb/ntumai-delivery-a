// @ts-nocheck

// Location services hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { UseLocationOptions, LocationData, LocationError } from './types';
import { locationService, locationPermissions, geoUtils, LocationTracker } from '@/src/utils/location';

export interface UseLocationResult {
  // Location state
  location: LocationData | null;
  loading: boolean;
  error: LocationError | null;
  
  // Permission state
  hasPermission: boolean;
  permissionStatus: 'granted' | 'denied' | 'restricted' | 'undetermined';
  
  // Location actions
  getCurrentLocation: () => Promise<LocationData | null>;
  requestPermission: () => Promise<boolean>;
  startWatching: () => void;
  stopWatching: () => void;
  
  // Location utilities
  isWatching: boolean;
  lastUpdated: Date | null;
  accuracy: number;
}

export const useLocation = (options: UseLocationOptions = {}): UseLocationResult => {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 300000, // 5 minutes
    distanceFilter = 10, // 10 meters
    autoStart = false,
    onLocationUpdate,
    onError,
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'restricted' | 'undetermined'>('undetermined');
  const [isWatching, setIsWatching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [accuracy, setAccuracy] = useState(0);

  const watchId = useRef<number | null>(null);
  const locationTracker = useRef<LocationTracker | null>(null);
  const mounted = useRef(true);

  // Check permission status
  const checkPermission = useCallback(async (): Promise<void> => {
    try {
      const status = await locationPermissions.checkLocationPermission();
      
      if (mounted.current) {
        setPermissionStatus(status);
        setHasPermission(status === 'granted');
      }
    } catch (err: any) {
      console.error('Error checking location permission:', err);
      
      if (mounted.current) {
        setPermissionStatus('denied');
        setHasPermission(false);
      }
    }
  }, []);

  // Request location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const granted = await locationPermissions.requestLocationPermission();
      
      if (mounted.current) {
        setHasPermission(granted);
        setPermissionStatus(granted ? 'granted' : 'denied');
      }
      
      return granted;
    } catch (err: any) {
      const locationError: LocationError = {
        code: 'PERMISSION_DENIED',
        message: err.message || 'Failed to request location permission',
        timestamp: new Date(),
      };
      
      if (mounted.current) {
        setError(locationError);
        setHasPermission(false);
        setPermissionStatus('denied');
      }
      
      onError?.(locationError);
      return false;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [onError]);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Check permission first
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return null;
        }
      }
      
      const position = await locationService.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
      
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: new Date(position.timestamp),
      };
      
      if (mounted.current) {
        setLocation(locationData);
        setLastUpdated(new Date());
        setAccuracy(position.coords.accuracy);
      }
      
      onLocationUpdate?.(locationData);
      return locationData;
    } catch (err: any) {
      const locationError: LocationError = {
        code: err.code === 1 ? 'PERMISSION_DENIED' : 
               err.code === 2 ? 'POSITION_UNAVAILABLE' : 
               err.code === 3 ? 'TIMEOUT' : 'UNKNOWN_ERROR',
        message: err.message || 'Failed to get current location',
        timestamp: new Date(),
      };
      
      if (mounted.current) {
        setError(locationError);
      }
      
      onError?.(locationError);
      return null;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [hasPermission, enableHighAccuracy, timeout, maximumAge, requestPermission, onLocationUpdate, onError]);

  // Start watching location
  const startWatching = useCallback((): void => {
    if (isWatching || !hasPermission) return;
    
    try {
      setError(null);
      
      watchId.current = locationService.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp),
          };
          
          if (mounted.current) {
            setLocation(locationData);
            setLastUpdated(new Date());
            setAccuracy(position.coords.accuracy);
          }
          
          onLocationUpdate?.(locationData);
        },
        (err) => {
          const locationError: LocationError = {
            code: err.code === 1 ? 'PERMISSION_DENIED' : 
                   err.code === 2 ? 'POSITION_UNAVAILABLE' : 
                   err.code === 3 ? 'TIMEOUT' : 'UNKNOWN_ERROR',
            message: err.message || 'Failed to watch location',
            timestamp: new Date(),
          };
          
          if (mounted.current) {
            setError(locationError);
          }
          
          onError?.(locationError);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
          distanceFilter,
        }
      );
      
      if (mounted.current) {
        setIsWatching(true);
      }
    } catch (err: any) {
      const locationError: LocationError = {
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Failed to start watching location',
        timestamp: new Date(),
      };
      
      if (mounted.current) {
        setError(locationError);
      }
      
      onError?.(locationError);
    }
  }, [isWatching, hasPermission, enableHighAccuracy, timeout, maximumAge, distanceFilter, onLocationUpdate, onError]);

  // Stop watching location
  const stopWatching = useCallback((): void => {
    if (!isWatching || watchId.current === null) return;
    
    try {
      locationService.clearWatch(watchId.current);
      watchId.current = null;
      
      if (mounted.current) {
        setIsWatching(false);
      }
    } catch (err: any) {
      console.error('Error stopping location watch:', err);
    }
  }, [isWatching]);

  // Initialize
  useEffect(() => {
    checkPermission();
    
    if (autoStart) {
      getCurrentLocation();
    }
  }, [checkPermission, getCurrentLocation, autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      stopWatching();
    };
  }, [stopWatching]);

  return {
    // Location state
    location,
    loading,
    error,
    
    // Permission state
    hasPermission,
    permissionStatus,
    
    // Location actions
    getCurrentLocation,
    requestPermission,
    startWatching,
    stopWatching,
    
    // Location utilities
    isWatching,
    lastUpdated,
    accuracy,
  };
};

// Specialized location hooks
export const useCurrentLocation = (autoFetch: boolean = true) => {
  const { location, loading, error, getCurrentLocation, hasPermission } = useLocation({
    autoStart: autoFetch,
    enableHighAccuracy: true,
    timeout: 10000,
  });
  
  return {
    location,
    loading,
    error,
    hasPermission,
    refetch: getCurrentLocation,
  };
};

export const useLocationTracking = () => {
  const {
    location,
    loading,
    error,
    hasPermission,
    startWatching,
    stopWatching,
    isWatching,
    accuracy,
  } = useLocation({
    enableHighAccuracy: true,
    distanceFilter: 5, // Update every 5 meters
  });
  
  return {
    location,
    loading,
    error,
    hasPermission,
    isTracking: isWatching,
    accuracy,
    startTracking: startWatching,
    stopTracking: stopWatching,
  };
};

export const useLocationDistance = (targetLocation?: { latitude: number; longitude: number }) => {
  const { location } = useCurrentLocation();
  
  const distance = location && targetLocation 
    ? geoUtils.calculateDistance(
        location.latitude,
        location.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      )
    : null;
    
  const bearing = location && targetLocation
    ? geoUtils.calculateBearing(
        location.latitude,
        location.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      )
    : null;
  
  return {
    currentLocation: location,
    targetLocation,
    distance, // in meters
    bearing, // in degrees
    isNearby: distance ? distance < 100 : false, // Within 100 meters
  };
};

export const useDeliveryTracking = (orderId?: string) => {
  const [deliveryLocation, setDeliveryLocation] = useState<LocationData | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<'preparing' | 'on_way' | 'nearby' | 'delivered'>('preparing');
  
  const { location: userLocation } = useCurrentLocation();
  const { distance } = useLocationDistance(deliveryLocation || undefined);
  
  // Mock delivery tracking - in real app, this would connect to your delivery API
  useEffect(() => {
    if (!orderId) return;
    
    // Simulate delivery updates
    const interval = setInterval(() => {
      // This would be replaced with real API calls
      // For now, we'll simulate movement
      if (deliveryLocation) {
        const newLat = deliveryLocation.latitude + (Math.random() - 0.5) * 0.001;
        const newLng = deliveryLocation.longitude + (Math.random() - 0.5) * 0.001;
        
        setDeliveryLocation({
          ...deliveryLocation,
          latitude: newLat,
          longitude: newLng,
          timestamp: new Date(),
        });
      }
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [orderId, deliveryLocation]);
  
  // Update delivery status based on distance
  useEffect(() => {
    if (!distance) return;
    
    if (distance < 50) {
      setDeliveryStatus('delivered');
    } else if (distance < 200) {
      setDeliveryStatus('nearby');
    } else {
      setDeliveryStatus('on_way');
    }
  }, [distance]);
  
  return {
    userLocation,
    deliveryLocation,
    distance,
    estimatedArrival,
    deliveryStatus,
    isDeliveryNearby: distance ? distance < 200 : false,
  };
};

export const useLocationSearch = () => {
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    distance?: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  
  const { location: currentLocation } = useCurrentLocation();
  
  const searchNearby = useCallback(async (query: string, radius: number = 5000) => {
    if (!currentLocation) return;
    
    try {
      setLoading(true);
      
      // This would be replaced with actual location search API
      // For now, we'll return mock data
      const mockResults = [
        {
          id: '1',
          name: 'Restaurant A',
          address: '123 Main St',
          latitude: currentLocation.latitude + 0.001,
          longitude: currentLocation.longitude + 0.001,
        },
        {
          id: '2',
          name: 'Restaurant B',
          address: '456 Oak Ave',
          latitude: currentLocation.latitude - 0.002,
          longitude: currentLocation.longitude + 0.002,
        },
      ];
      
      // Calculate distances
      const resultsWithDistance = mockResults.map(result => ({
        ...result,
        distance: geoUtils.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          result.latitude,
          result.longitude
        ),
      }));
      
      // Filter by radius and sort by distance
      const filteredResults = resultsWithDistance
        .filter(result => result.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching nearby locations:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);
  
  return {
    searchResults,
    loading,
    searchNearby,
    currentLocation,
  };
};
