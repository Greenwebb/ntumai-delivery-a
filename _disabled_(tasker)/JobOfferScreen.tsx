// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';


import { useState, useEffect } from 'react';

import { View, Animated, Dimensions, Vibration, Pressable } from 'react-native';

import { useRouter, useRoute } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
  const { width, height } = Dimensions.get('window');

export default function JobOfferScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const route = useRoute();
  const [timeLeft, setTimeLeft] = useState(30);
  const [swipeProgress] = useState(new Animated.Value(0));
  const [isAccepting, setIsAccepting] = useState(false);
  const jobData = { jobId: 'job_123',

    pickupLocation: 'Downtown Market',

    dropoffLocation: 'Residential Area',

    estimatedEarnings: 2.5,

    distance: 3.2,

    type: 'delivery'};

  // Timer

  useEffect(() => { const timer = setInterval(() => { setTimeLeft((prev) =>  {
    if (prev <= 1) { handleReject();

          return 0; }

        return prev - 1; }); }, 1000);

    return () => clearInterval(timer); }, []);

  // Vibration on mount

  useEffect(() => { Vibration.vibrate([0, 500, 200, 500]); }, []);
  const handleAccept = async () => { setIsAccepting(true);

    Vibration.vibrate(200);

    // Simulate API call

    setTimeout(() => { toast.info('Job accepted! Navigate to pickup location.'); }, 500); };
  const handleReject = () => { Vibration.vibrate(100);

    router.back(); };

  return (

    <View className="flex-1 bg-gradient-to-b from-orange-500 to-orange-600">

      {/* Header with Timer */}

      <View className="pt-8 pb-4 px-4">

        <View className="flex-row justify-between items-center">

          <Text className="text-white text-lg font-bold">New Job Offer</Text>

          <View className={`px-3 py-1 rounded-full ${ timeLeft <= 10 ? 'bg-red-500' : 'bg-background' }`}>

            <Text className={`font-bold ${ timeLeft <= 10 ? 'text-white' : 'text-orange-600' }`}>

              {timeLeft}s

            </Text>

          </View>

        </View>

      </View>

      {/* Main Content */}

      <View className="flex-1 justify-center items-center px-4">

        {/* Job Icon */}

        <View className="mb-6">

          <View className="w-20 h-20 bg-background rounded-full items-center justify-center">

            <Ionicons name="car" size={40} color="#FF6B35" />

          </View>

        </View>

        {/* Job Details */}

        <View className="bg-background rounded-2xl p-6 w-full mb-6">

          {/* Earnings */}

          <View className="mb-6 items-center">

            <Text className="text-muted text-sm mb-1">Estimated Earnings</Text>

            <Text className="text-4xl font-bold text-orange-600">

              â­{jobData.estimatedEarnings}

            </Text>

          </View>

          {/* Route */}

          <View className="mb-6">

            {/* Pickup */}

            <View className="flex-row items-start mb-4">

              <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-3 mt-1">

                <Text className="text-white text-xs">ð</Text>

              </View>

              <View className="flex-1">

                <Text className="text-muted text-xs">Pickup</Text>

                <Text className="text-foreground font-semibold">

                  {jobData.pickupLocation}

                </Text>

              </View>

            </View>

            {/* Divider */}

            <View className="ml-3 mb-4 border-l-2 border-border h-4" />

            {/* Dropoff */}

            <View className="flex-row items-start">

              <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-3 mt-1">

                <Text className="text-white text-xs">ð</Text>

              </View>

              <View className="flex-1">

                <Text className="text-muted text-xs">Dropoff</Text>

                <Text className="text-foreground font-semibold">

                  {jobData.dropoffLocation}

                </Text>

              </View>

            </View>

          </View>

          {/* Distance */}

          <View className="flex-row justify-between items-center p-3 bg-surface rounded-lg">

            <Text className="text-muted">Distance</Text>

            <Text className="text-foreground font-semibold">{jobData.distance} km</Text>

          </View>

        </View>

      </View>

      {/* Action Buttons */}

      <View className="px-4 pb-8">

        {/* Accept Button */}

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleAccept}

          disabled={isAccepting}

          className="bg-background py-4 rounded-full mb-3 active:opacity-80"

        >

          <Text className="text-center text-orange-600 font-bold text-lg">

            {isAccepting ? 'Accepting...' : 'â Swipe to Accept'}

          </Text>

        </Pressable>

        {/* Reject Button */}

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleReject}

          className="bg-orange-700 py-3 rounded-full active:opacity-80"

        >

          <Text className="text-center text-white font-semibold">â Decline</Text>

        </Pressable>

      </View>

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

