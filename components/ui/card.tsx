// @ts-nocheck
import React from 'react';
import { Pressable, View, ViewStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingClasses: Record<string, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  onPress,
  style,
  variant = 'elevated',
  padding = 'md',
  className,
}: CardProps) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-background shadow-md';
      case 'outlined':
        return 'bg-background border border-border';
      case 'flat':
        return 'bg-surface';
      default:
        return 'bg-background shadow-md';
    }
  };

  const baseClasses = `overflow-hidden rounded-xl ${paddingClasses[padding]} ${getVariantClasses()} ${className || ''}`;

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        className={baseClasses}
        style={({ pressed }) => [
          { opacity: pressed ? 0.9 : 1 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={baseClasses} style={style}>
      {children}
    </View>
  );
}
