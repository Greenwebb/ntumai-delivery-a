// @ts-nocheck
/**
 * WebViewMap - A cross-platform map component that works in Expo Go
 * Uses Google Maps JavaScript API via WebView instead of react-native-maps
 * This allows maps to work without native modules
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Platform, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { Feather } from '@expo/vector-icons';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Marker {
  id: string;
  coordinate: Coordinate;
  title?: string;
  description?: string;
  color?: string;
  icon?: 'driver' | 'destination' | 'location' | 'pickup' | 'default';
}

interface WebViewMapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  markers?: Marker[];
  routeCoordinates?: Coordinate[];
  onMapPress?: (coordinate: Coordinate) => void;
  onMapReady?: () => void;
  showUserLocation?: boolean;
  height?: number;
  className?: string;
  primaryColor?: string;
  showRoute?: boolean;
  apiKey?: string;
}

// Default Lusaka coordinates
const DEFAULT_LOCATION = {
  latitude: -15.3875,
  longitude: 28.3228,
};

const GOOGLE_MAPS_API_KEY = 'AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik';

export function WebViewMap({
  initialRegion = {
    ...DEFAULT_LOCATION,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  markers = [],
  routeCoordinates = [],
  onMapPress,
  onMapReady,
  showUserLocation = false,
  height = 256,
  className = '',
  primaryColor = '#009688',
  showRoute = true,
  apiKey = GOOGLE_MAPS_API_KEY,
}: WebViewMapProps) {
  const webViewRef = useRef<WebView>(null);
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate zoom from delta (approximate conversion)
  const getZoom = (delta: number) => {
    return Math.min(18, Math.max(10, Math.round(Math.log(360 / delta) / Math.LN2)));
  };

  const zoom = getZoom(initialRegion.latitudeDelta || 0.01);

  // Generate marker HTML
  const generateMarkerHTML = (marker: Marker) => {
    const iconColor = marker.color || primaryColor;
    
    switch (marker.icon) {
      case 'driver':
        return `
          <div style="
            background: ${iconColor};
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        `;
      case 'destination':
        return `
          <div style="
            background: #22C55E;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `;
      case 'pickup':
        return `
          <div style="
            background: #3B82F6;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `;
      case 'location':
      default:
        return `
          <div style="
            background: ${iconColor};
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `;
    }
  };

  // Generate markers JavaScript
  const markersJS = markers.map((marker, index) => {
    const markerHTML = generateMarkerHTML(marker);
    return `
      (function() {
        var markerDiv = document.createElement('div');
        markerDiv.innerHTML = \`${markerHTML}\`;
        var advancedMarker = new google.maps.marker.AdvancedMarkerElement({
          map: map,
          position: { lat: ${marker.coordinate.latitude}, lng: ${marker.coordinate.longitude} },
          title: "${marker.title || ''}",
          content: markerDiv.firstElementChild
        });
        markers.push(advancedMarker);
      })();
    `;
  }).join('\n');

  // Generate route drawing JavaScript using Directions API
  const routeJS = showRoute && routeCoordinates.length >= 2 ? `
    // Draw route using Directions Service
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '${primaryColor}',
        strokeOpacity: 1.0,
        strokeWeight: 5
      }
    });
    
    var origin = { lat: ${routeCoordinates[0].latitude}, lng: ${routeCoordinates[0].longitude} };
    var destination = { lat: ${routeCoordinates[routeCoordinates.length - 1].latitude}, lng: ${routeCoordinates[routeCoordinates.length - 1].longitude} };
    
    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
      if (status === 'OK') {
        directionsRenderer.setDirections(response);
        
        // Get route info
        var route = response.routes[0];
        var leg = route.legs[0];
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'routeInfo',
          distance: leg.distance.text,
          duration: leg.duration.text,
          distanceValue: leg.distance.value,
          durationValue: leg.duration.value
        }));
      } else {
        // Fallback to simple polyline if directions fail
        var routePath = new google.maps.Polyline({
          path: [origin, destination],
          geodesic: true,
          strokeColor: '${primaryColor}',
          strokeOpacity: 1.0,
          strokeWeight: 4,
          strokeDashArray: [10, 5]
        });
        routePath.setMap(map);
      }
    });
  ` : '';

  // Map click handler
  const clickHandlerJS = onMapPress ? `
    map.addListener('click', function(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'mapPress',
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng()
      }));
    });
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; }
          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div id="map"><div class="loading">Loading map...</div></div>
        <script>
          var map;
          var markers = [];
          
          function initMap() {
            try {
              map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: ${initialRegion.latitude}, lng: ${initialRegion.longitude} },
                zoom: ${zoom},
                mapId: "TA_APP_MAP",
                disableDefaultUI: true,
                zoomControl: true,
                gestureHandling: "greedy",
                styles: [
                  {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                  }
                ]
              });

              // Add markers
              ${markersJS}
              
              // Draw route
              ${routeJS}
              
              // Click handler
              ${clickHandlerJS}

              // Fit bounds to show all markers
              if (markers.length > 1) {
                var bounds = new google.maps.LatLngBounds();
                markers.forEach(function(marker) {
                  bounds.extend(marker.position);
                });
                map.fitBounds(bounds, 50);
              }

              // Notify React Native that map is ready
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'error', 
                message: error.message 
              }));
            }
          }
          
          // Load Google Maps
          function loadGoogleMaps() {
            var script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,geometry&callback=initMap&v=weekly';
            script.async = true;
            script.defer = true;
            script.onerror = function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'error', 
                message: 'Failed to load Google Maps' 
              }));
            };
            document.head.appendChild(script);
          }
          
          loadGoogleMaps();
        </script>
      </body>
    </html>
  `;

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'mapReady':
          setIsLoading(false);
          setError(null);
          onMapReady?.();
          break;
        case 'mapPress':
          onMapPress?.({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          break;
        case 'routeInfo':
          // Route info available - could be used for ETA display
          console.log('Route info:', data);
          break;
        case 'error':
          setError(data.message);
          setIsLoading(false);
          break;
      }
    } catch (e) {
      console.error('WebViewMap message error:', e);
    }
  }, [onMapPress, onMapReady]);

  // For web platform, show a placeholder
  if (Platform.OS === 'web') {
    return (
      <View 
        className={`bg-surface items-center justify-center ${className}`}
        style={{ height }}
      >
        <Feather name="map" size={48} color={colors.muted} />
        <Text className="text-muted mt-2">Map view available on mobile</Text>
      </View>
    );
  }

  return (
    <View className={className} style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(nativeEvent.description);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-2">Loading map...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorOverlay}>
          <Feather name="alert-circle" size={32} color={colors.error} />
          <Text className="text-error mt-2 text-center px-4">{error}</Text>
        </View>
      )}
    </View>
  );
}

// Simple location picker component
export function LocationPicker({
  initialLocation,
  onLocationSelect,
  height = 256,
}: {
  initialLocation?: Coordinate;
  onLocationSelect: (coordinate: Coordinate) => void;
  height?: number;
}) {
  const [selectedLocation, setSelectedLocation] = useState<Coordinate>(
    initialLocation || DEFAULT_LOCATION
  );
  const colors = useColors();

  const handleMapPress = useCallback((coordinate: Coordinate) => {
    setSelectedLocation(coordinate);
    onLocationSelect(coordinate);
  }, [onLocationSelect]);

  return (
    <View style={{ height }}>
      <WebViewMap
        initialRegion={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        markers={[
          {
            id: 'selected',
            coordinate: selectedLocation,
            title: 'Selected Location',
            icon: 'location',
            color: colors.primary,
          },
        ]}
        onMapPress={handleMapPress}
        height={height}
        showRoute={false}
      />
      <View style={styles.tapHint}>
        <Feather name="crosshair" size={14} color={colors.muted} />
        <Text className="text-xs text-muted ml-1">Tap map to select location</Text>
      </View>
    </View>
  );
}

// Driver tracking map component
export function DriverTrackingMap({
  driverLocation,
  destinationLocation,
  pickupLocation,
  driverName = 'Driver',
  height = 256,
  showETA = true,
}: {
  driverLocation: Coordinate;
  destinationLocation: Coordinate;
  pickupLocation?: Coordinate;
  driverName?: string;
  height?: number;
  showETA?: boolean;
}) {
  const colors = useColors();
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  const markers: Marker[] = [
    {
      id: 'driver',
      coordinate: driverLocation,
      title: driverName,
      icon: 'driver',
      color: colors.primary,
    },
    {
      id: 'destination',
      coordinate: destinationLocation,
      title: 'Delivery Location',
      icon: 'destination',
    },
  ];

  if (pickupLocation) {
    markers.splice(1, 0, {
      id: 'pickup',
      coordinate: pickupLocation,
      title: 'Pickup Location',
      icon: 'pickup',
    });
  }

  // Calculate center point between all locations
  const centerLat = markers.reduce((sum, m) => sum + m.coordinate.latitude, 0) / markers.length;
  const centerLng = markers.reduce((sum, m) => sum + m.coordinate.longitude, 0) / markers.length;

  return (
    <View style={{ height }}>
      <WebViewMap
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        markers={markers}
        routeCoordinates={[driverLocation, destinationLocation]}
        height={height}
        primaryColor={colors.primary}
        showRoute={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapHint: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
