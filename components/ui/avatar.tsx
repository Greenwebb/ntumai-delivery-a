// @ts-nocheck
import React from 'react';
import { View, Image, ViewStyle } from 'react-native';
import { Text } from './text';
import { useColors } from '@/hooks/use-colors';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const fontSizeMap: Record<AvatarSize, 'caption' | 'bodySmall' | 'body' | 'h4' | 'h3'> = {
  xs: 'caption',
  sm: 'bodySmall',
  md: 'body',
  lg: 'h4',
  xl: 'h3',
};

export function Avatar({ source, name, size = 'md', style, className }: AvatarProps) {
  const colors = useColors();
  const fontSize = fontSizeMap[size];

  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <View
      className={`items-center justify-center overflow-hidden rounded-full ${sizeClasses[size]} ${source ? 'bg-surface' : 'bg-primary'} ${className || ''}`}
      style={style}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          className={`${sizeClasses[size]} rounded-full`}
          resizeMode="cover"
        />
      ) : (
        <Text variant={fontSize} weight="medium" style={{ color: colors.background }}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
