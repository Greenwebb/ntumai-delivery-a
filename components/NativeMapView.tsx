// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Feather } from '@expo/vector-icons';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBXm4vNto8YqGp3kZ_RjK6gYZqH5mR7xYo'; // Replace with your key

interface NativeMapViewProps {
  /** Initial region to display */
  initialRegion?: Region;
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
}

export function NativeMapView({
  initialRegion,
  driverLocation,
  pickupLocation,
  destinationLocation,
  driverName = 'Driver',
  showRoute = true,
  interactive = true,
  height = 300,
  onLocationSelect,
  selectedLocation,
}: NativeMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  // Default region (Lusaka, Zambia)
  const defaultRegion: Region = {
    latitude: -15.3875,
    longitude: 28.3228,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const region = initialRegion || defaultRegion;

  // Fit map to show all markers
  useEffect(() => {
    if (mapReady && mapRef.current) {
      const coordinates = [];
      
      if (driverLocation) coordinates.push(driverLocation);
      if (pickupLocation) coordinates.push(pickupLocation);
      if (destinationLocation) coordinates.push(destinationLocation);
      if (selectedLocation) coordinates.push(selectedLocation);

      if (coordinates.length > 1) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 500);
      }
    }
  }, [mapReady, driverLocation, pickupLocation, destinationLocation, selectedLocation]);

  const handleMapPress = (event: any) => {
    if (onLocationSelect && interactive) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onLocationSelect({ latitude, longitude });
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
        onPress={handleMapPress}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        mapType="standard"
      >
        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title={driverName}
            description="Current location"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.driverMarker}>
              <View style={styles.driverMarkerInner}>
                <Feather name="navigation" size={16} color="white" />
              </View>
              <View style={styles.driverMarkerPulse} />
            </View>
          </Marker>
        )}

        {/* Pickup Marker */}
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Location"
            description="Order pickup point"
            pinColor="#3B82F6"
          >
            <View style={styles.pickupMarker}>
              <Feather name="package" size={20} color="white" />
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationLocation && !selectedLocation && (
          <Marker
            coordinate={destinationLocation}
            title="Delivery Location"
            description="Your delivery address"
            pinColor="#22C55E"
          >
            <View style={styles.destinationMarker}>
              <Feather name="map-pin" size={24} color="white" />
            </View>
          </Marker>
        )}

        {/* Selected Location Marker (for address picker) */}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Location"
            draggable={interactive}
            onDragEnd={(e) => onLocationSelect?.(e.nativeEvent.coordinate)}
          >
            <View style={styles.selectedMarker}>
              <Feather name="map-pin" size={28} color="#EF4444" />
            </View>
          </Marker>
        )}

        {/* Route from driver to destination */}
        {showRoute && driverLocation && destinationLocation && (
          <MapViewDirections
            origin={driverLocation}
            destination={destinationLocation}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#3B82F6"
            optimizeWaypoints={true}
            onReady={(result) => {
              console.log(`Distance: ${result.distance} km`);
              console.log(`Duration: ${result.duration} min`);
            }}
            onError={(errorMessage) => {
              console.log('Directions error:', errorMessage);
            }}
          />
        )}

        {/* Route from pickup to destination (when no driver location) */}
        {showRoute && !driverLocation && pickupLocation && destinationLocation && (
          <MapViewDirections
            origin={pickupLocation}
            destination={destinationLocation}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#8B5CF6"
            optimizeWaypoints={true}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  driverMarker: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  driverMarkerPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    opacity: 0.3,
    zIndex: 1,
  },
  pickupMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarker: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
