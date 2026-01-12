// @ts-nocheck
import React, { useEffect } from 'react';
import { View, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  style?: ViewStyle;
  className?: string;
}

const radiusClasses: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 'sm', 
  style,
  className 
}: SkeletonProps) {
  const colors = useColors();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[{ width }, style]} className={className}>
      <Animated.View
        className={`overflow-hidden bg-border ${radiusClasses[borderRadius]}`}
        style={[{ height }, animatedStyle]}
      />
    </View>
  );
}

// Skeleton variants for common use cases
export function SkeletonText({ lines = 3, style, className }: { lines?: number; style?: ViewStyle; className?: string }) {
  return (
    <View style={style} className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '70%' : '100%'}
          className="mb-2"
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ style, className }: { style?: ViewStyle; className?: string }) {
  return (
    <View className={`p-4 ${className || ''}`} style={style}>
      <Skeleton width="100%" height={150} borderRadius="md" className="mb-3" />
      <Skeleton width="80%" height={20} className="mb-2" />
      <Skeleton width="60%" height={16} />
    </View>
  );
}


export function SkeletonList({ items = 5, style, className }: { items?: number; style?: ViewStyle; className?: string }) {
  return (
    <View style={style} className={className}>
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} className="flex-row items-center p-4 border-b border-border">
          <Skeleton width={48} height={48} borderRadius="full" className="mr-3" />
          <View className="flex-1">
            <Skeleton width="70%" height={16} className="mb-2" />
            <Skeleton width="50%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonProfile({ style, className }: { style?: ViewStyle; className?: string }) {
  return (
    <View className={`p-6 items-center ${className || ''}`} style={style}>
      <Skeleton width={100} height={100} borderRadius="full" className="mb-4" />
      <Skeleton width="60%" height={24} className="mb-2" />
      <Skeleton width="40%" height={16} className="mb-4" />
      <View className="flex-row gap-3 w-full">
        <Skeleton width="48%" height={44} borderRadius="md" />
        <Skeleton width="48%" height={44} borderRadius="md" />
      </View>
    </View>
  );
}

export function SkeletonProductGrid({ items = 6, style, className }: { items?: number; style?: ViewStyle; className?: string }) {
  return (
    <View className={`flex-row flex-wrap ${className || ''}`} style={style}>
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} className="w-1/2 p-2">
          <Skeleton width="100%" height={150} borderRadius="md" className="mb-2" />
          <Skeleton width="80%" height={16} className="mb-1" />
          <Skeleton width="50%" height={20} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonOrderCard({ style, className }: { style?: ViewStyle; className?: string }) {
  return (
    <View className={`p-4 border border-border rounded-xl mb-3 ${className || ''}`} style={style}>
      <View className="flex-row justify-between mb-3">
        <Skeleton width="40%" height={18} />
        <Skeleton width="30%" height={24} borderRadius="full" />
      </View>
      <Skeleton width="100%" height={14} className="mb-2" />
      <Skeleton width="80%" height={14} className="mb-3" />
      <View className="flex-row justify-between pt-3 border-t border-border">
        <Skeleton width="30%" height={16} />
        <Skeleton width="25%" height={20} />
      </View>
    </View>
  );
}
