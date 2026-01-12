import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;
const COUNTDOWN_SECONDS = 30;

export interface JobOffer {
  id: string;
  type: 'delivery' | 'errand' | 'marketplace';
  title: string;
  description: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedEarnings: number;
  estimatedDistance: string;
  estimatedDuration: string;
  customerName: string;
  customerRating?: number;
  items?: string[];
  urgency?: 'normal' | 'express';
}

interface JobOfferModalProps {
  visible: boolean;
  offer: JobOffer | null;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  onTimeout: (offerId: string) => void;
}

/**
 * Full-screen job offer modal for Taskers
 * Blueprint requirement: "A full-screen, call-like notification with swipe-to-accept"
 */
export function JobOfferModal({
  visible,
  offer,
  onAccept,
  onDecline,
  onTimeout,
}: JobOfferModalProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const translateX = useSharedValue(0);
  const acceptProgress = useSharedValue(0);
  const declineProgress = useSharedValue(0);

  // Reset countdown when modal becomes visible
  useEffect(() => {
    if (visible && offer) {
      setCountdown(COUNTDOWN_SECONDS);
      translateX.value = 0;
      acceptProgress.value = 0;
      declineProgress.value = 0;

      // Vibrate to alert tasker
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 500, 200, 500]);
      }
    }
  }, [visible, offer]);

  // Countdown timer
  useEffect(() => {
    if (!visible || !offer) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout(offer.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, offer, onTimeout]);

  const handleAccept = useCallback(() => {
    if (offer) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onAccept(offer.id);
    }
  }, [offer, onAccept]);

  const handleDecline = useCallback(() => {
    if (offer) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      onDecline(offer.id);
    }
  }, [offer, onDecline]);

  // Swipe gesture for accept/decline
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      
      // Calculate progress for visual feedback
      if (event.translationX > 0) {
        acceptProgress.value = Math.min(event.translationX / SWIPE_THRESHOLD, 1);
        declineProgress.value = 0;
      } else {
        declineProgress.value = Math.min(Math.abs(event.translationX) / SWIPE_THRESHOLD, 1);
        acceptProgress.value = 0;
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right - Accept
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 });
        runOnJS(handleAccept)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left - Decline
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        runOnJS(handleDecline)();
      } else {
        // Return to center
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        acceptProgress.value = withTiming(0);
        declineProgress.value = withTiming(0);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const acceptIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(acceptProgress.value, [0, 0.5, 1], [0, 0.5, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(acceptProgress.value, [0, 1], [0.8, 1], Extrapolation.CLAMP) }],
  }));

  const declineIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(declineProgress.value, [0, 0.5, 1], [0, 0.5, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(declineProgress.value, [0, 1], [0.8, 1], Extrapolation.CLAMP) }],
  }));

  if (!offer) return null;

  const countdownColor = countdown <= 10 ? '#EF4444' : countdown <= 20 ? '#F59E0B' : '#009688';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View className="flex-1 bg-gray-900">
        {/* Background gradient overlay */}
        <View className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />

        {/* Countdown Timer */}
        <View className="absolute top-16 left-0 right-0 items-center z-10">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: countdownColor + '20', borderWidth: 3, borderColor: countdownColor }}
          >
            <Text style={{ color: countdownColor, fontSize: 28, fontWeight: 'bold' }}>
              {countdown}
            </Text>
          </View>
          <Text className="text-gray-400 mt-2 text-sm">seconds to respond</Text>
        </View>

        {/* Accept/Decline Indicators */}
        <View className="absolute top-1/2 left-8 -translate-y-1/2">
          <Animated.View
            style={[acceptIndicatorStyle]}
            className="w-16 h-16 rounded-full bg-green-500 items-center justify-center"
          >
            <Feather name="check" size={32} color="white" />
          </Animated.View>
        </View>
        <View className="absolute top-1/2 right-8 -translate-y-1/2">
          <Animated.View
            style={[declineIndicatorStyle]}
            className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
          >
            <Feather name="x" size={32} color="white" />
          </Animated.View>
        </View>

        {/* Job Offer Card */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[cardAnimatedStyle]}
            className="flex-1 justify-center px-6 pt-32"
          >
            <View className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              {/* Header with earnings */}
              <View className="bg-primary p-6 items-center" style={{ backgroundColor: '#009688' }}>
                <Text className="text-white text-sm uppercase tracking-wide mb-1">
                  {offer.urgency === 'express' ? '⚡ EXPRESS' : 'NEW JOB'}
                </Text>
                <Text className="text-white text-4xl font-bold">
                  K{offer.estimatedEarnings.toFixed(2)}
                </Text>
                <Text className="text-white/80 text-sm mt-1">Estimated Earnings</Text>
              </View>

              {/* Job Details */}
              <View className="p-6">
                <Text className="text-gray-900 text-xl font-bold mb-2">
                  {offer.title}
                </Text>
                <Text className="text-gray-600 mb-4">
                  {offer.description}
                </Text>

                {/* Distance & Duration */}
                <View className="flex-row mb-4">
                  <View className="flex-1 flex-row items-center">
                    <Feather name="map-pin" size={16} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">{offer.estimatedDistance}</Text>
                  </View>
                  <View className="flex-1 flex-row items-center">
                    <Feather name="clock" size={16} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">{offer.estimatedDuration}</Text>
                  </View>
                </View>

                {/* Pickup & Dropoff */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <View className="flex-row items-start mb-3">
                    <View className="w-3 h-3 rounded-full bg-green-500 mt-1 mr-3" />
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 uppercase">Pickup</Text>
                      <Text className="text-gray-900 font-medium">{offer.pickupAddress}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-3 h-3 rounded-full bg-red-500 mt-1 mr-3" />
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 uppercase">Drop-off</Text>
                      <Text className="text-gray-900 font-medium">{offer.dropoffAddress}</Text>
                    </View>
                  </View>
                </View>

                {/* Customer Info */}
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                    <Feather name="user" size={20} color="#6B7280" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-medium">{offer.customerName}</Text>
                    {offer.customerRating && (
                      <View className="flex-row items-center">
                        <Feather name="star" size={12} color="#F59E0B" />
                        <Text className="text-gray-600 text-sm ml-1">
                          {offer.customerRating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Swipe Instructions */}
              <View className="bg-gray-100 py-4 px-6">
                <View className="flex-row items-center justify-center">
                  <Feather name="chevrons-left" size={20} color="#EF4444" />
                  <Text className="text-gray-500 mx-4 text-sm">
                    Swipe to respond
                  </Text>
                  <Feather name="chevrons-right" size={20} color="#22C55E" />
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-red-500 text-xs font-medium">DECLINE</Text>
                  <Text className="text-green-500 text-xs font-medium">ACCEPT</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

export default JobOfferModal;
