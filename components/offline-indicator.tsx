// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOfflineStore } from '@/stores/offline-store';

export function OfflineIndicator() {
  const { isOnline, pendingActions, isSyncing, syncProgress, syncPendingActions } = useOfflineStore();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isOnline || pendingActions.length > 0) {
      // Show indicator
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else {
      // Hide indicator
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOnline, pendingActions.length]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleRetry = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    syncPendingActions();
  };

  if (isOnline && pendingActions.length === 0) {
    return null;
  }

  const bgColor = !isOnline ? '#EF4444' : isSyncing ? '#F59E0B' : '#6B7280';
  const message = !isOnline
    ? 'No internet connection'
    : isSyncing
    ? `Syncing ${pendingActions.length} action${pendingActions.length > 1 ? 's' : ''}...`
    : `${pendingActions.length} action${pendingActions.length > 1 ? 's' : ''} pending`;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: bgColor,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        animatedStyle,
      ]}
    >
      <View className="flex-row items-center flex-1">
        <Feather
          name={!isOnline ? 'wifi-off' : isSyncing ? 'refresh-cw' : 'cloud-off'}
          size={18}
          color="#fff"
        />
        <Text className="text-white text-sm font-medium ml-3">{message}</Text>
      </View>

      {!isSyncing && isOnline && pendingActions.length > 0 && (
        <TouchableOpacity
          onPress={handleRetry}
          className="bg-white/20 px-3 py-1.5 rounded-full"
        >
          <Text className="text-white text-xs font-semibold">Retry</Text>
        </TouchableOpacity>
      )}

      {isSyncing && (
        <View className="w-16 h-1 bg-white/30 rounded-full overflow-hidden ml-3">
          <View
            className="h-full bg-white rounded-full"
            style={{ width: `${syncProgress}%` }}
          />
        </View>
      )}
    </Animated.View>
  );
}
