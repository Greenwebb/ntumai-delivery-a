// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { OrderStatus, STATUS_CONFIGS } from '@/services/order-status-notifications';

interface OrderStatusBannerProps {
  orderId: string;
  status: OrderStatus;
  message?: string;
  visible: boolean;
  onDismiss: () => void;
  onPress?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  'clock': 'clock',
  'check-circle': 'check-circle',
  'package': 'package',
  'shopping-bag': 'shopping-bag',
  'truck': 'truck',
  'navigation': 'navigation',
  'map-pin': 'map-pin',
  'check': 'check',
  'x-circle': 'x-circle',
};

export function OrderStatusBanner({
  orderId,
  status,
  message,
  visible,
  onDismiss,
  onPress,
  autoDismiss = true,
  autoDismissDelay = 5000,
}: OrderStatusBannerProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = STATUS_CONFIGS[status];

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (Platform.OS !== 'web' && config?.vibrate) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoDismissDelay);
        return () => clearTimeout(timer);
      }
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  if (!config) return null;

  const iconName = ICON_MAP[config.icon] || 'bell';

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="mx-4 mt-12"
      >
        <View
          className="rounded-2xl p-4 shadow-lg"
          style={{ backgroundColor: config.color }}
        >
          <View className="flex-row items-center">
            {/* Icon */}
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Feather name={iconName} size={20} color="#FFFFFF" />
            </View>

            {/* Content */}
            <View className="flex-1 ml-3">
              <Text className="text-white font-semibold text-base">
                {config.title}
              </Text>
              <Text className="text-white/90 text-sm mt-0.5" numberOfLines={2}>
                {message || config.body}
              </Text>
            </View>

            {/* Dismiss Button */}
            <TouchableOpacity
              onPress={handleDismiss}
              className="p-2 -mr-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar (for auto-dismiss) */}
          {autoDismiss && (
            <View className="h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
              <Animated.View
                className="h-full bg-white/50 rounded-full"
                style={{
                  width: '100%',
                }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Compact version for notification list
export function OrderStatusNotificationItem({
  orderId,
  status,
  message,
  timestamp,
  isRead,
  onPress,
}: {
  orderId: string;
  status: OrderStatus;
  message?: string;
  timestamp: Date;
  isRead: boolean;
  onPress?: () => void;
}) {
  const config = STATUS_CONFIGS[status];
  if (!config) return null;

  const iconName = ICON_MAP[config.icon] || 'bell';
  const timeAgo = getTimeAgo(timestamp);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-start p-4 border-b border-border ${!isRead ? 'bg-primary/5' : 'bg-background'}`}
    >
      {/* Icon */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Feather name={iconName} size={20} color={config.color} />
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className={`text-base ${!isRead ? 'font-semibold' : 'font-medium'} text-foreground`}>
            {config.title}
          </Text>
          <Text className="text-xs text-muted">{timeAgo}</Text>
        </View>
        <Text className="text-sm text-muted mt-1" numberOfLines={2}>
          {message || config.body}
        </Text>
        <Text className="text-xs text-primary mt-1">Order #{orderId.slice(-6)}</Text>
      </View>

      {/* Unread indicator */}
      {!isRead && (
        <View className="w-2 h-2 rounded-full bg-primary ml-2 mt-2" />
      )}
    </TouchableOpacity>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
