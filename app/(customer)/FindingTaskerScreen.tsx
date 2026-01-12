// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { useState, useEffect } from 'react';

import { View, Animated, Dimensions, Pressable } from 'react-native';

import { useMatchingStore } from '@/lib/stores/matching-store';

import { useRouter } from 'expo-router';
  const { width, height } = Dimensions.get('window');

export default function FindingTaskerScreen({ route }: any) { const { jobData, pickupLocation } = route.params;
  const router = useRouter();
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { isMatching,

    matchedTasker,

    availableTaskers,

    estimatedWaitTime,

    matchingProgress,

    startMatching,

    cancelMatching,

    getAvailableTaskers} = useMatchingStore();

  useEffect(() => { // Start matching

    startMatching(jobData);

    getAvailableTaskers(pickupLocation);

    // Timer

    const timer = setInterval(() => { setElapsedTime((prev) => prev + 1); }, 1000);

    return () => clearInterval(timer); }, []);

  useEffect(() => { // Simulate map markers

    const markers = availableTaskers.map((tasker, index) => ({ id: tasker.id,

      name: tasker.name,

      latitude: tasker.latitude,

      longitude: tasker.longitude,

      rating: tasker.rating,

      distance: tasker.distance,

      isMatched: matchedTasker?.taskerId === tasker.id}));

    setMapMarkers(markers); }, [availableTaskers, matchedTasker]);

  // When tasker is matched

  useEffect(() =>  {
    if (matchedTasker && !isMatching) { // Navigate to active order screen after 2 seconds

      setTimeout(() => { router.push({ pathname: '/(customer)/OrderTrackingScreen',

          params: { orderId: jobData.id,

            taskerId: matchedTasker.taskerId,

            taskerName: matchedTasker.taskerName,

            taskerPhoto: matchedTasker.taskerPhoto}}); }, 2000); } }, [matchedTasker, isMatching]);
  const handleCancel = () => { cancelMatching();

    router.back(); };

  return (

    <View className="flex-1 bg-background">

      {/* Map Area (Placeholder) */}

      <Map>

        <View className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 relative">

          {/* Simulated Map */}

          <View className="flex-1 items-center justify-center">

            <View className="w-64 h-64 rounded-full border-4 border-blue-300 items-center justify-center">

              {/* Pickup Location */}

              <View className="w-4 h-4 bg-green-500 rounded-full absolute" />

              {/* Available Taskers */}

              {mapMarkers.map((marker, index) => (

                <View

                  key={marker.id}

                  className={`w-8 h-8 rounded-full absolute items-center justify-center ${ marker.isMatched ? 'bg-blue-600' : 'bg-orange-500' }`}

                  style={{ transform: [

                      { rotate: `${(index * 360) / mapMarkers.length}deg`},

                    ],

                    marginTop: -80}}

                >

                  <Text className="text-white text-xs font-bold">

                    {marker.name?.charAt(0)?.toUpperCase() || 'T'}

                  </Text>

                </View>

              ))}

            </View>

            {/* Matching Status */}

            <View className="mt-8 items-center">

              <Text className="text-lg font-bold text-foreground mb-2">

                Finding the Right Tasker...

              </Text>

              <View className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">

                <Animated.View

                  className="h-full bg-blue-500"

                  style={{ width: `${matchingProgress}%`}}

                />

              </View>

              <Text className="text-sm text-muted mt-2">

                {matchingProgress}% complete

              </Text>

            </View>

          </View>

        </View>

      </Map>

      {/* Info Panel */}

      <View className="bg-background border-t border-border p-4">

        {/* Estimated Wait Time */}

        <View className="mb-4">

          <Text className="text-sm text-muted mb-1">Estimated Wait Time</Text>

          <Text className="text-2xl font-bold text-foreground">

            {estimatedWaitTime}

          </Text>

        </View>

        {/* Available Taskers Count */}

        <View className="mb-4 p-3 bg-blue-50 rounded-lg">

          <Text className="text-sm text-gray-700">

            {availableTaskers.length} taskers available nearby

          </Text>

        </View>

        {/* Matched Tasker Info */}

        {matchedTasker && (

          <View className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">

            <Text className="text-sm font-semibold text-green-900 mb-1">

              Tasker Found!

            </Text>

            <Text className="text-base font-bold text-green-900">

              {matchedTasker.taskerName}

            </Text>

            <Text className="text-sm text-green-700">

              Rating: {matchedTasker.rating} stars - ETA: {matchedTasker.estimatedArrival} min

            </Text>

          </View>

        )}

        {/* Elapsed Time */}

        <View className="mb-4 text-center">

          <Text className="text-xs text-muted">

            Searching for {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}

          </Text>

        </View>

        {/* Cancel Button */}

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCancel}

          className="bg-surface py-3 rounded-lg"

        >

          <Text className="text-center text-foreground font-semibold">

            Cancel

          </Text>

        </Pressable>

      </View>

    </View>

  ); }

// Placeholder Map component

function Map({ children }: any) { return <View className="flex-1">{children}</View>; }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

