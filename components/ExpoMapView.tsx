// @ts-nocheck
/**
 * ExpoMapView - Native map component using expo-maps
 * Provides better performance than WebView-based maps
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ExpoMap, Marker, Polyline, type CameraPosition } from 'expo-maps';
import { useColors } from '@/hooks/use-colors';
import { googleMapsService, type LatLng } from '@/lib/services/google-maps-service';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface ExpoMapViewProps {
  /** Initial camera position */
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  /** Driver/tasker current location */
  driverLocation?: Coordinate;
  /** Pickup location */
  pickupLocation?: Coordinate;
  /** Delivery/destination location */
  destinationLocation: Coordinate;
  /** Driver name for marker */
  driverName?: string;
  /** Show route between locations */
  showRoute?: boolean;
  /** Allow map interaction */
  interactive?: boolean;
  /** Map height */
  height?: number;
  /** Route coordinates for polyline */
  routeCoordinates?: Coordinate[];
}

// Default Lusaka coordinates
const DEFAULT_LOCATION = {
  latitude: -15.3875,
  longitude: 28.3228,
};

export function ExpoMapView({
  initialRegion = {
    ...DEFAULT_LOCATION,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  driverLocation,
  pickupLocation,
  destinationLocation,
  driverName = 'Driver',
  showRoute = true,
  interactive = true,
  height = 256,
  routeCoordinates = [],
}: ExpoMapViewProps) {
  const mapRef = useRef<any>(null);
  const colors = useColors();
  const [realRouteCoordinates, setRealRouteCoordinates] = useState<Coordinate[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Calculate zoom level from delta
  const getZoom = (delta: number) => {
    return Math.min(18, Math.max(10, Math.round(Math.log(360 / delta) / Math.LN2)));
  };

  const zoom = getZoom(initialRegion.latitudeDelta || 0.01);

  // Initial camera position
  const initialCamera: CameraPosition = {
    center: {
      latitude: initialRegion.latitude,
      longitude: initialRegion.longitude,
    },
    zoom,
  };

  // Generate route coordinates if not provided
  const getRouteCoordinates = (): Coordinate[] => {
    if (routeCoordinates.length > 0) {
      return routeCoordinates;
    }

    // Simple straight line between driver and destination
    if (driverLocation && destinationLocation) {
      return [driverLocation, destinationLocation];
    }

    // Fallback: pickup to destination
    if (pickupLocation && destinationLocation) {
      return [pickupLocation, destinationLocation];
    }

    return [];
  };

  // Fetch real route from Google Directions API
  useEffect(() => {
    if (showRoute && (driverLocation || pickupLocation) && destinationLocation) {
      fetchRealRoute();
    }
  }, [driverLocation, pickupLocation, destinationLocation, showRoute]);

  const fetchRealRoute = async () => {
    setIsLoadingRoute(true);
    try {
      const origin = driverLocation || pickupLocation;
      if (!origin) return;

      const directions = await googleMapsService.getDirections(
        origin,
        destinationLocation
      );

      if (directions.routes.length > 0) {
        setRealRouteCoordinates(directions.routes[0].points);
      }
    } catch (error) {
      console.error('Failed to fetch route from Google Directions API:', error);
      // Fallback to simple straight line
      setRealRouteCoordinates(getRouteCoordinates());
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const route = showRoute ? (realRouteCoordinates.length > 0 ? realRouteCoordinates : getRouteCoordinates()) : [];

  // Fit map to show all markers
  useEffect(() => {
    if (mapRef.current && (driverLocation || pickupLocation)) {
      const coordinates: Coordinate[] = [];
      if (driverLocation) coordinates.push(driverLocation);
      if (pickupLocation) coordinates.push(pickupLocation);
      if (destinationLocation) coordinates.push(destinationLocation);

      if (coordinates.length > 1) {
        // Calculate bounds
        const lats = coordinates.map(c => c.latitude);
        const lngs = coordinates.map(c => c.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const latDelta = (maxLat - minLat) * 1.5; // Add padding
        const lngDelta = (maxLng - minLng) * 1.5;

        const newZoom = getZoom(Math.max(latDelta, lngDelta));

        mapRef.current?.animateCamera({
          center: {
            latitude: centerLat,
            longitude: centerLng,
          },
          zoom: newZoom,
          duration: 1000,
        });
      }
    }
  }, [driverLocation, pickupLocation, destinationLocation]);

  return (
    <View style={[styles.container, { height }]}>
      <ExpoMap
        ref={mapRef}
        style={styles.map}
        initialCameraPosition={initialCamera}
        provider="google"
        gestureHandling={interactive ? 'greedy' : 'none'}
        mapType="standard"
      >
        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title={driverName}
            description="Current location"
            pinColor={colors.primary}
            icon="car"
          />
        )}

        {/* Pickup Marker */}
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup"
            description="Pickup location"
            pinColor="#3B82F6"
            icon="location"
          />
        )}

        {/* Destination Marker */}
        <Marker
          coordinate={destinationLocation}
          title="Destination"
          description="Delivery location"
          pinColor="#22C55E"
          icon="location"
        />

        {/* Route Polyline */}
        {showRoute && route.length >= 2 && (
          <Polyline
            coordinates={route}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        )}
      </ExpoMap>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
  },
  map: {
    flex: 1,
  },
});
