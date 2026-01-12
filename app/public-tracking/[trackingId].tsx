// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/shared-components';
import { TrackingMap, TrackingData } from '@/components/tracking-map';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalSearchParams } from 'expo-router';

const MOCK_TRACKING_DATA: TrackingData = {
  orderId: 'ORD-12345',
  status: 'in_transit',
  estimatedArrival: '15 mins',
  currentLocation: {
    latitude: -15.4167,
    longitude: 28.2833,
  },
  pickupLocation: {
    latitude: -15.3875,
    longitude: 28.3228,
    address: 'Cairo Road, Lusaka',
  },
  dropoffLocation: {
    latitude: -15.4167,
    longitude: 28.2833,
    address: 'Manda Hill, Lusaka',
  },
  taskerName: 'John M.',
  taskerPhone: '+260 97 123 4567',
  taskerRating: 4.8,
};

const DELIVERY_STEPS = [
  { id: 1, label: 'Order Placed', icon: 'check-circle' },
  { id: 2, label: 'Tasker Assigned', icon: 'user' },
  { id: 3, label: 'Picked Up', icon: 'package' },
  { id: 4, label: 'In Transit', icon: 'truck' },
  { id: 5, label: 'Delivered', icon: 'check' },
];

export default function PublicTrackingPage() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const { trackingId } = params;
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [currentStep, setCurrentStep] = useState(3);

  useEffect(() => {
    loadTrackingData();
  }, [trackingId]);

  const loadTrackingData = async () => {
    try {
      // Simulate API call to fetch tracking data by tracking ID
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTrackingData(MOCK_TRACKING_DATA);
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallTasker = () => {
    if (trackingData?.taskerPhone) {
      Linking.openURL(`tel:${trackingData.taskerPhone}`);
    }
  };

  const handleDownloadApp = () => {
    // Link to app store/play store
    const url = Platform.select({
      ios: 'https://apps.apple.com/app/ntumai',
      android: 'https://play.google.com/store/apps/details?id=com.ntumai',
      default: 'https://ntumai.com/download',
    });
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading tracking information..." />
      </ScreenContainer>
    );
  }

  if (!trackingData) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-6">
          <Feather name="alert-circle" size={64} color={colors.muted} />
          <Text className="text-xl font-bold mt-4 mb-2">Tracking Not Found</Text>
          <Text className="text-center text-muted mb-6">
            We couldn't find any delivery with this tracking ID. Please check the link and try again.
          </Text>
          <PrimaryButton onPress={handleDownloadApp}>
            Download Ntumai App
          </PrimaryButton>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-2">Track Your Delivery</Text>
          <Text className="text-sm text-muted">Order #{trackingData.orderId}</Text>
        </View>

        {/* Live Tracking Map */}
        <View className="rounded-2xl overflow-hidden mb-6" style={{ height: 300 }}>
          <TrackingMap
            currentLocation={trackingData.currentLocation}
            pickupLocation={trackingData.pickupLocation}
            dropoffLocation={trackingData.dropoffLocation}
            estimatedArrival={trackingData.estimatedArrival}
          />
        </View>

        {/* Status Card */}
        <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Feather name="truck" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold">In Transit</Text>
              <Text className="text-sm text-muted">
                Estimated arrival: {trackingData.estimatedArrival}
              </Text>
            </View>
          </View>

          {/* Tasker Info */}
          <View className="flex-row items-center justify-between pt-4 border-t" style={{ borderTopColor: colors.border }}>
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Text className="font-semibold" style={{ color: colors.primary }}>
                  {trackingData.taskerName.charAt(0)}
                </Text>
              </View>
              <View>
                <Text className="font-medium">{trackingData.taskerName}</Text>
                <View className="flex-row items-center gap-1">
                  <Feather name="star" size={14} color="#FFD700" />
                  <Text className="text-sm text-muted">{trackingData.taskerRating}</Text>
                </View>
              </View>
            </View>
            <SecondaryButton onPress={handleCallTasker} size="sm">
              <Feather name="phone" size={16} color={colors.primary} />
            </SecondaryButton>
          </View>
        </View>

        {/* Delivery Progress */}
        <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-semibold mb-4">Delivery Progress</Text>
          <View className="gap-4">
            {DELIVERY_STEPS.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              return (
                <View key={step.id} className="flex-row items-center gap-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: isCompleted ? colors.primary : colors.border,
                    }}
                  >
                    <Feather
                      name={step.icon as any}
                      size={20}
                      color={isCompleted ? '#FFF' : colors.muted}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={cn('font-medium', isCurrent && 'font-semibold')}
                      style={{ color: isCompleted ? colors.foreground : colors.muted }}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {isCompleted && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Addresses */}
        <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-semibold mb-4">Delivery Details</Text>
          <View className="gap-4">
            <View className="flex-row gap-3">
              <Feather name="map-pin" size={20} color={colors.success} />
              <View className="flex-1">
                <Text className="font-medium mb-1">Pickup</Text>
                <Text className="text-sm text-muted">{trackingData.pickupLocation.address}</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <Feather name="map-pin" size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="font-medium mb-1">Drop-off</Text>
                <Text className="text-sm text-muted">{trackingData.dropoffLocation.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Download App CTA */}
        <View
          className="rounded-2xl p-6 mb-6 items-center"
          style={{ backgroundColor: colors.primary + '10' }}
        >
          <Feather name="smartphone" size={48} color={colors.primary} />
          <Text className="text-lg font-semibold mt-4 mb-2">Get the Ntumai App</Text>
          <Text className="text-center text-sm text-muted mb-4">
            Download our app to place orders, track deliveries in real-time, and get exclusive deals.
          </Text>
          <PrimaryButton onPress={handleDownloadApp}>
            Download Now
          </PrimaryButton>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

