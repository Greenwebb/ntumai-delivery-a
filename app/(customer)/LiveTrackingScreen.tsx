// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Linking, Platform, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useOrderTrackingStore } from '@/stores/order-tracking-store';
import { useColors } from '@/hooks/use-colors';
import { SmartMapView } from '@/components/SmartMapView';

export default function LiveTrackingScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  
  const [showDetails, setShowDetails] = useState(true);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  const {
    activeTracking,
    isLoading,
    loadTracking,
    simulateMovement,
    clearTracking,
  } = useOrderTrackingStore();

  useEffect(() => {
    if (orderId) {
      loadTracking(orderId);
    }

    // Start simulation for demo
    simulationInterval.current = setInterval(() => {
      simulateMovement();
    }, 3000); // Update every 3 seconds

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [orderId]);

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (activeTracking) {
      Linking.openURL(`tel:${activeTracking.taskerPhone}`);
    }
  };

  const handleMessage = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(customer)/ChatScreen?orderId=${orderId}`);
  };

  const formatETA = (date: Date) => {
    const minutes = Math.round((date.getTime() - Date.now()) / 60000);
    if (minutes < 1) return 'Arriving now';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      confirmed: '#3B82F6',
      preparing: '#F59E0B',
      picked_up: '#8B5CF6',
      en_route: '#009688',
      arriving: '#22C55E',
      delivered: '#10B981',
    };
    return statusColors[status] || '#6B7280';
  };

  const getVehicleIcon = (type: string) => {
    const icons: Record<string, any> = {
      bicycle: 'disc',
      motorcycle: 'zap',
      car: 'truck',
    };
    return icons[type] || 'navigation';
  };

  if (isLoading || !activeTracking) {
    return (
      <ScreenContainer className="bg-background items-center justify-center">
        <Text className="text-base text-muted">Loading tracking data...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={() => router.back()}
          className="p-2 -ml-2"
        >
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Live Tracking</Text>
        <View className="w-10" />
      </View>

      {/* Map Section */}
      <View className="relative">
        <SmartMapView
          driverLocation={activeTracking.currentLocation}
          destinationLocation={activeTracking.deliveryLocation}
          driverName={activeTracking.taskerName}
          height={280}
          showRoute={true}
          interactive={true}
        />
        
        {/* ETA Badge */}
        <View className="absolute top-4 left-4 bg-background rounded-xl px-4 py-3 shadow-lg border border-border">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-success/20 items-center justify-center mr-3">
              <Feather name="clock" size={20} color={colors.success} />
            </View>
            <View>
              <Text className="text-xl font-bold text-foreground">
                {formatETA(activeTracking.estimatedArrival)}
              </Text>
              <Text className="text-xs text-muted">
                {activeTracking.distanceRemaining.toFixed(1)} km away
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View 
          className="absolute top-4 right-4 px-3 py-2 rounded-full"
          style={{ backgroundColor: `${getStatusColor(activeTracking.status)}20` }}
        >
          <Text 
            className="text-xs font-semibold capitalize"
            style={{ color: getStatusColor(activeTracking.status) }}
          >
            {activeTracking.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Driver Info Card */}
      <View className="mx-4 mt-4 bg-surface rounded-2xl p-5 border border-border">
        <View className="flex-row items-center mb-4">
          <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
            <Text className="text-xl font-bold text-primary">
              {activeTracking.taskerName.charAt(0)}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-lg font-semibold text-foreground">
              {activeTracking.taskerName}
            </Text>
            <View className="flex-row items-center mt-1">
              <Feather name="star" size={14} color="#F59E0B" />
              <Text className="text-sm text-muted ml-1">
                {activeTracking.taskerRating.toFixed(1)}
              </Text>
              <Text className="text-muted mx-2">•</Text>
              <Feather name={getVehicleIcon(activeTracking.vehicleType)} size={14} color={colors.muted} />
              <Text className="text-sm text-muted ml-1 capitalize">
                {activeTracking.vehicleType}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            onPress={handleCall}
            className="flex-1 flex-row items-center justify-center py-3 rounded-xl bg-primary"
          >
            <Feather name="phone" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Call</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            onPress={handleMessage}
            className="flex-1 flex-row items-center justify-center py-3 rounded-xl bg-surface border border-border"
          >
            <Feather name="message-circle" size={18} color={colors.foreground} />
            <Text className="text-foreground font-semibold ml-2">Message</Text>
          </Pressable>
        </View>
      </View>

      {/* Delivery Details */}
      <ScrollView className="flex-1 px-4 mt-4">
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-base font-semibold text-foreground mb-4">Delivery Details</Text>
          
          {/* Pickup */}
          <View className="flex-row mb-4">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
              <Feather name="package" size={16} color={colors.primary} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-muted">Pickup</Text>
              <Text className="text-sm text-foreground mt-1">
                {activeTracking.pickupAddress || 'Restaurant Location'}
              </Text>
            </View>
          </View>

          {/* Dotted Line */}
          <View className="ml-4 h-6 border-l-2 border-dashed border-border" />

          {/* Delivery */}
          <View className="flex-row">
            <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center">
              <Feather name="map-pin" size={16} color={colors.success} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-muted">Delivery</Text>
              <Text className="text-sm text-foreground mt-1">
                {activeTracking.deliveryAddress || 'Your Location'}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">Order Summary</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-muted">Order ID</Text>
            <Text className="text-sm text-foreground font-medium">#{orderId?.slice(-8) || 'N/A'}</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

