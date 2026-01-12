// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { Package, Clock, MapPin, DollarSign, PhoneOff, Phone } from 'lucide-react-native';

import React, { useRef, useState } from 'react';
import { View, Animated, PanResponder, Dimensions, Image, Platform, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import * as Haptics from 'expo-haptics';
  const { width } = Dimensions.get('window');
  const SWIPE_THRESHOLD = width * 0.4;

export default function IncomingJobScreen() { const router = useRouter();
  const colors = useColors();
  const { jobId, jobType, customerName, amount, location, description } = useLocalSearchParams();
  const pan = useRef(new Animated.ValueXY()).current;
  const [swiping, setSwiping] = useState(false);
  const panResponder = useRef(
    PanResponder.create({ onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { setSwiping(true);
        if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } },
      onPanResponderMove: (_, gesture) => { // Only allow horizontal swipe
        pan.setValue({ x: gesture.dx, y: 0 });
        
        // Haptic feedback at threshold
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD && Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } },
      onPanResponderRelease: (_, gesture) => { setSwiping(false);
        
        if (gesture.dx > SWIPE_THRESHOLD) { // Accept job - swipe right
          handleAccept(); } else if (gesture.dx < -SWIPE_THRESHOLD) { // Reject job - swipe left
          handleReject(); } else { // Return to center
          Animated.spring(pan, { toValue: { x: 0, y: 0 },
            useNativeDriver: false}).start(); } }})
  ).current;
  const handleAccept = () =>  {
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    
    Animated.timing(pan, { toValue: { x: width, y: 0 },
      duration: 300,
      useNativeDriver: false}).start(() => { // Navigate to active job screen
      router.replace(`/(tasker)/ActiveJobScreen?jobId=${jobId}`); }); };
  const handleReject = () =>  {
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
    
    Animated.timing(pan, { toValue: { x: -width, y: 0 },
      duration: 300,
      useNativeDriver: false}).start(() => { // Go back to tasker dashboard
      router.back(); }); };
  const getJobIcon = () => { switch (jobType) { case 'delivery':
        return Package;
      case 'task':
        return Clock;
      default:
        return Package; } };
  const JobIcon = getJobIcon();

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-1 bg-background">
        {/* Background gradient effect */}
        <View className="absolute inset-0 bg-primary/5" />

        {/* Content */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Customer Avatar */}
          <View className="mb-8">
            <View className="w-32 h-32 rounded-full bg-surface items-center justify-center border-4 border-primary">
              <Text variant="h1" weight="bold" className="text-primary">
                {customerName?.charAt(0) || 'C'}
              </Text>
            </View>
            
            {/* Pulsing ring animation */}
            <View className="absolute inset-0 w-32 h-32 rounded-full border-2 border-primary opacity-30 animate-ping" />
          </View>

          {/* Job Info */}
          <Text variant="h2" weight="bold" className="text-center mb-2">
            {customerName || 'New Customer'}
          </Text>
          <Text variant="body" color="muted" className="text-center mb-6">
            {jobType === 'delivery' ? 'Delivery Request' : 'Task Request'}
          </Text>

          {/* Job Details Card */}
          <View className="w-full bg-surface rounded-2xl p-6 mb-8 border border-border">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                <JobIcon size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text variant="body" weight="medium" numberOfLines={2}>
                  {description || 'New job request'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-3">
              <MapPin size={16} color={colors.muted} />
              <Text variant="bodySmall" color="muted" className="ml-2 flex-1" numberOfLines={1}>
                {location || 'Location not specified'}
              </Text>
            </View>

            <View className="flex-row items-center">
              <DollarSign size={16} color={colors.success} />
              <Text variant="body" weight="bold" className="text-success ml-2">
                K {amount || '0'}
              </Text>
            </View>
          </View>

          {/* Swipe Instructions */}
          <Text variant="bodySmall" color="muted" className="text-center mb-4">
            Swipe right to accept • Swipe left to decline
          </Text>

          {/* Swipe Controls */}
          <View className="w-full relative">
            {/* Track */}
            <View className="h-20 bg-surface rounded-full flex-row items-center justify-between px-6 border-2 border-border">
              {/* Decline side */}
              <View className="w-12 h-12 rounded-full bg-error/10 items-center justify-center">
                <PhoneOff size={24} color={colors.error} />
              </View>

              {/* Accept side */}
              <View className="w-12 h-12 rounded-full bg-success/10 items-center justify-center">
                <Phone size={24} color={colors.success} />
              </View>
            </View>

            {/* Swipeable Button */}
            <Animated.View
              {...panResponder.panHandlers}
              style={{ position: 'absolute',
                left: 8,
                top: 8,
                transform: [{ translateX: pan.x }]}}
              className="w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg"
            >
              <Phone size={28} color="white" />
            </Animated.View>
          </View>

          {/* Timer */}
          <View className="mt-8">
            <Text variant="bodySmall" color="muted" className="text-center">
              Auto-decline in 30 seconds
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

