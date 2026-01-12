// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';
import { useColors } from '@/hooks/use-colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastProps extends ToastConfig {
  onDismiss: (id: string) => void;
}

export function Toast({ id, type, message, duration = 4000, onDismiss }: ToastProps) {
  const colors = useColors();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(1);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 200 });

    if (Platform.OS !== 'web') {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    progress.value = withTiming(0, { duration }, () => {
      runOnJS(handleDismiss)();
    });

    return () => { progress.value = 1; };
  }, []);

  const handleDismiss = () => {
    translateY.value = withTiming(-100, { duration: 150 });
    opacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onDismiss)(id);
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY < -50) runOnJS(handleDismiss)();
      else translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const getIcon = () => {
    const iconSize = 20;
    const iconColor = getIconColor();
    switch (type) {
      case 'success': return <CheckCircle size={iconSize} color={iconColor} />;
      case 'error': return <XCircle size={iconSize} color={iconColor} />;
      case 'warning': return <AlertCircle size={iconSize} color={iconColor} />;
      case 'info': return <Info size={iconSize} color={iconColor} />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.primary;
    }
  };

  const getBorderClass = () => {
    switch (type) {
      case 'success': return 'border-l-success';
      case 'error': return 'border-l-error';
      case 'warning': return 'border-l-warning';
      case 'info': return 'border-l-primary';
    }
  };

  const getBgClass = () => {
    switch (type) {
      case 'success': return 'bg-success/10';
      case 'error': return 'bg-error/10';
      case 'warning': return 'bg-warning/10';
      case 'info': return 'bg-primary/10';
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className={`flex-row items-center mx-4 mt-4 py-4 px-4 rounded-lg border-l-4 bg-background shadow-lg overflow-hidden ${getBorderClass()}`}
        style={animatedStyle}
      >
        <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${getBgClass()}`}>
          {getIcon()}
        </View>
        <Text className="flex-1 text-foreground text-base">
          {message}
        </Text>
        <Animated.View
          className="absolute bottom-0 left-0 h-[3px]"
          style={[progressStyle, { backgroundColor: getIconColor() }]}
        />
      </Animated.View>
    </GestureDetector>
  );
}
