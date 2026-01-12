// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

// Check if running in Expo Go (which doesn't support react-native-maps)
const isExpoGo = Constants.appOwnership === 'expo';

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;
type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

if (Platform.OS !== 'web' && !isExpoGo) {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('react-native-maps not available:', e);
  }
}
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface TrackingData {
  taskerLocation: Location;
  pickupLocation: Location;
  dropoffLocation: Location;
  status: 'heading_to_pickup' | 'at_pickup' | 'heading_to_dropoff' | 'at_dropoff' | 'completed';
  estimatedArrival?: string;
  taskerName?: string;
  taskerPhone?: string;
  taskerRating?: number;
  vehicleType?: string;
}

interface TrackingMapProps {
  trackingData: TrackingData;
  onCallTasker?: () => void;
  onMessageTasker?: () => void;
  showControls?: boolean;
  height?: number;
  className?: string;
}

export function TrackingMap({
  trackingData,
  onCallTasker,
  onMessageTasker,
  showControls = true,
  height = 300,
  className,
}: TrackingMapProps) {
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  useEffect(() => {
    const { taskerLocation, pickupLocation, dropoffLocation } = trackingData;
    const lats = [taskerLocation.latitude, pickupLocation.latitude, dropoffLocation.latitude];
    const lngs = [taskerLocation.longitude, pickupLocation.longitude, dropoffLocation.longitude];
    
    setRegion({
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: Math.max((Math.max(...lats) - Math.min(...lats)) * 1.5 || 0.02, 0.01),
      longitudeDelta: Math.max((Math.max(...lngs) - Math.min(...lngs)) * 1.5 || 0.02, 0.01),
    });
  }, [trackingData.pickupLocation, trackingData.dropoffLocation]);

  const getStatusText = () => {
    const statusMap = {
      heading_to_pickup: 'Heading to pickup',
      at_pickup: 'At pickup location',
      heading_to_dropoff: 'On the way to you',
      at_dropoff: 'Arrived at destination',
      completed: 'Delivery completed',
    };
    return statusMap[trackingData.status] || 'Tracking...';
  };

  const getStatusColor = () => {
    const colorMap = {
      heading_to_pickup: '#009688',
      heading_to_dropoff: '#009688',
      at_pickup: '#F59E0B',
      at_dropoff: '#F59E0B',
      completed: '#22C55E',
    };
    return colorMap[trackingData.status] || '#6B7280';
  };

  // Loading state
  if (!region) {
    return (
      <View className={`w-full rounded-2xl overflow-hidden bg-surface ${className || ''}`} style={{ height }}>
        <View className="flex-1 items-center justify-center">
          <Feather name="map" size={32} color="#D1D5DB" />
          <Text className="mt-2 text-muted text-sm">Loading map...</Text>
        </View>
      </View>
    );
  }

  // Web/Expo Go fallback (maps not available)
  if (Platform.OS === 'web' || !MapView || isExpoGo) {
    return (
      <View className={`w-full rounded-2xl overflow-hidden bg-surface ${className || ''}`} style={{ height }}>
        <View className="flex-1 items-center justify-center p-6">
          <Feather name="map-pin" size={48} color="#009688" />
          <Text className="text-lg font-semibold text-foreground mt-4">{getStatusText()}</Text>
          <Text className="text-sm text-muted mt-1">
            {trackingData.estimatedArrival ? `ETA: ${trackingData.estimatedArrival}` : 'Tracking active'}
          </Text>
          <View className="mt-6 w-full max-w-[280px]">
            <View className="flex-row items-center py-2">
              <Feather name="circle" size={12} color="#22C55E" />
              <Text className="text-sm text-foreground ml-3 flex-1" numberOfLines={1}>
                {trackingData.pickupLocation.address || 'Pickup'}
              </Text>
            </View>
            <View className="w-0.5 h-5 bg-border ml-[5px]" />
            <View className="flex-row items-center py-2">
              <Feather name="map-pin" size={12} color="#EF4444" />
              <Text className="text-sm text-foreground ml-3 flex-1" numberOfLines={1}>
                {trackingData.dropoffLocation.address || 'Dropoff'}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-muted mt-6 italic">
            {isExpoGo ? 'Maps require a development build' : 'Open in native app for live map tracking'}
          </Text>
        </View>
      </View>
    );
  }

  // Native map
  return (
    <View className={`w-full rounded-2xl overflow-hidden bg-surface ${className || ''}`} style={{ height }}>
      <MapView
        ref={mapRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        <Marker coordinate={trackingData.taskerLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View className="w-10 h-10 items-center justify-center">
            <Animated.View className="absolute w-10 h-10 rounded-full bg-primary" style={pulseStyle} />
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center border-[3px] border-white">
              <Feather name="navigation" size={16} color="white" />
            </View>
          </View>
        </Marker>
        <Marker coordinate={trackingData.pickupLocation} anchor={{ x: 0.5, y: 1 }}>
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-success items-center justify-center border-2 border-white">
              <Feather name="package" size={14} color="white" />
            </View>
          </View>
        </Marker>
        <Marker coordinate={trackingData.dropoffLocation} anchor={{ x: 0.5, y: 1 }}>
          <View className="items-center">
            <View className="w-8 h-8 rounded-full bg-error items-center justify-center border-2 border-white">
              <Feather name="map-pin" size={14} color="white" />
            </View>
          </View>
        </Marker>
        <Polyline
          coordinates={[trackingData.taskerLocation, trackingData.status.includes('pickup') ? trackingData.pickupLocation : trackingData.dropoffLocation]}
          strokeColor="#009688"
          strokeWidth={4}
          lineDashPattern={[10, 5]}
        />
      </MapView>

      {/* Status Bar */}
      <View className="absolute top-3 left-3 right-3 flex-row items-center bg-background rounded-lg px-3 py-2 shadow-md">
        <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getStatusColor() }} />
        <Text className="flex-1 text-sm font-semibold text-foreground">{getStatusText()}</Text>
        {trackingData.estimatedArrival && (
          <Text className="text-xs text-muted">ETA: {trackingData.estimatedArrival}</Text>
        )}
      </View>

      {/* Tasker Card */}
      {showControls && trackingData.taskerName && (
        <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between bg-background rounded-xl p-3 shadow-md">
          <View className="flex-row items-center flex-1">
            <View className="w-11 h-11 rounded-full bg-surface items-center justify-center mr-3">
              <Feather name="user" size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">{trackingData.taskerName}</Text>
              <View className="flex-row items-center mt-0.5">
                {trackingData.taskerRating && (
                  <View className="flex-row items-center mr-3">
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text className="text-xs text-muted ml-1">{trackingData.taskerRating.toFixed(1)}</Text>
                  </View>
                )}
                {trackingData.vehicleType && (
                  <Text className="text-xs text-muted">{trackingData.vehicleType}</Text>
                )}
              </View>
            </View>
          </View>
          <View className="flex-row items-center">
            {onMessageTasker && (
              <TouchableOpacity onPress={onMessageTasker} className="w-11 h-11 rounded-full bg-surface items-center justify-center ml-2">
                <Feather name="message-circle" size={20} color="#009688" />
              </TouchableOpacity>
            )}
            {onCallTasker && (
              <TouchableOpacity onPress={onCallTasker} className="w-11 h-11 rounded-full bg-primary items-center justify-center ml-2">
                <Feather name="phone" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Legend */}
      <View className="absolute bottom-20 right-3 bg-background rounded-lg p-2 shadow-sm">
        <View className="flex-row items-center my-0.5">
          <View className="w-2 h-2 rounded-full bg-success mr-1.5" />
          <Text className="text-[10px] text-muted">Pickup</Text>
        </View>
        <View className="flex-row items-center my-0.5">
          <View className="w-2 h-2 rounded-full bg-error mr-1.5" />
          <Text className="text-[10px] text-muted">Drop-off</Text>
        </View>
      </View>
    </View>
  );
}

export default TrackingMap;
