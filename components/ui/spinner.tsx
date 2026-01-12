// @ts-nocheck
import React from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/use-colors';

type SpinnerSize = 'small' | 'large';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  style?: ViewStyle;
  className?: string;
}

export function Spinner({ size = 'small', color, style, className }: SpinnerProps) {
  const colors = useColors();
  const spinnerColor = color || colors.primary;

  return (
    <View className={`items-center justify-center ${className || ''}`} style={style}>
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
}
