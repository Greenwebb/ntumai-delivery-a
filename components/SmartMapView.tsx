// @ts-nocheck
/**
 * SmartMapView - Unified map interface for all platforms
 * 
 * Uses expo-maps for native performance on mobile devices
 * Falls back to WebView maps on web platform
 */

import { Platform } from 'react-native';

// Native expo-maps (recommended for production)
import { ExpoMapView } from './ExpoMapView';

// Fallback WebView maps (for web platform)
import { DriverTrackingMap as WebViewMap } from './WebViewMap';

interface SmartMapViewProps {
  /** Initial region to display */
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  /** Driver/tasker current location */
  driverLocation?: { latitude: number; longitude: number };
  /** Pickup location */
  pickupLocation?: { latitude: number; longitude: number };
  /** Delivery/destination location */
  destinationLocation: { latitude: number; longitude: number };
  /** Driver name for marker */
  driverName?: string;
  /** Show route between locations */
  showRoute?: boolean;
  /** Allow map interaction */
  interactive?: boolean;
  /** Map height */
  height?: number;
  /** On location selected (for address picker) */
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void;
  /** Selected location (for address picker) */
  selectedLocation?: { latitude: number; longitude: number };
  /** Route coordinates for polyline */
  routeCoordinates?: Array<{ latitude: number; longitude: number }>;
}

export function SmartMapView(props: SmartMapViewProps) {
  // Use WebView maps on web platform, expo-maps on mobile
  if (Platform.OS === 'web') {
    return <WebViewMap {...props} />;
  }
  
  // Default: expo-maps for native performance
  return <ExpoMapView {...props} />;
}

// Export type for convenience
export type { SmartMapViewProps };
