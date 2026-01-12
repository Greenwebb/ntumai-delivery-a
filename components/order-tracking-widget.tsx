// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOrderWidgetStore, WidgetOrder } from '@/stores/order-widget-store';
import { useRouter } from 'expo-router';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#6B7280', icon: 'clock' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', icon: 'check-circle' },
  preparing: { label: 'Preparing', color: '#F59E0B', icon: 'package' },
  picked_up: { label: 'Picked Up', color: '#8B5CF6', icon: 'shopping-bag' },
  en_route: { label: 'On the Way', color: '#10B981', icon: 'truck' },
  arriving: { label: 'Arriving Soon', color: '#EF4444', icon: 'map-pin' },
  delivered: { label: 'Delivered', color: '#22C55E', icon: 'check' },
};

export function OrderTrackingWidget() {
  const router = useRouter();
  const { isVisible, isExpanded, activeOrder, hideWidget, toggleExpanded } = useOrderWidgetStore();

  const translateY = useSharedValue(200);
  const height = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(200, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  useEffect(() => {
    if (isExpanded) {
      height.value = withSpring(200, { damping: 20, stiffness: 90 });
    } else {
      height.value = withSpring(80, { damping: 20, stiffness: 90 });
    }
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: height.value,
    opacity: opacity.value,
  }));

  if (!isVisible || !activeOrder) return null;

  const statusConfig = STATUS_CONFIG[activeOrder.status];
  const minutesUntilArrival = Math.ceil((activeOrder.estimatedArrival.getTime() - Date.now()) / 60000);

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Linking.openURL(`tel:${activeOrder.taskerPhone}`);
  };

  const handleViewMap = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(customer)/LiveTrackingScreen');
  };

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleExpanded();
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          zIndex: 999,
        },
        animatedStyle,
      ]}
    >
      {/* Compact View */}
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.9}
        className="p-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${statusConfig.color}20` }}
            >
              <Feather name={statusConfig.icon} size={20} color={statusConfig.color} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-foreground">{statusConfig.label}</Text>
              <Text className="text-xs text-muted">
                {minutesUntilArrival > 0 ? `${minutesUntilArrival} min away` : 'Arriving now'}
              </Text>
            </View>
          </View>
          <Feather
            name={isExpanded ? 'chevron-down' : 'chevron-up'}
            size={20}
            color="#6B7280"
          />
        </View>
      </TouchableOpacity>

      {/* Expanded View */}
      {isExpanded && (
        <View className="px-4 pb-4 border-t border-border">
          {/* Tasker Info */}
          <View className="flex-row items-center justify-between py-3">
            <View>
              <Text className="text-xs text-muted mb-1">Your Tasker</Text>
              <Text className="text-sm font-semibold text-foreground">{activeOrder.taskerName}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCall}
              className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
            >
              <Feather name="phone" size={18} color="#009688" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleViewMap}
              className="flex-1 bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold text-sm">View Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={hideWidget}
              className="flex-1 bg-surface rounded-lg py-3 items-center border border-border"
            >
              <Text className="text-foreground font-semibold text-sm">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}
