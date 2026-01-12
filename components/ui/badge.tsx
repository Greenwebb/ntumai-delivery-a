
import React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label?: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary',
  secondary: 'bg-surface',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-primary',
};

const textVariantClasses = {
  primary: 'text-background',
  secondary: 'text-foreground',
  success: 'text-background',
  warning: 'text-foreground',
  error: 'text-background',
  info: 'text-background',
};

const sizeClasses = {
  sm: 'min-w-4 h-4 px-1',
  md: 'min-w-5 h-5 px-1.5',
  lg: 'min-w-6 h-6 px-2',
};

const dotSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

/**
 * Badge component for displaying status, labels, or categories
 * Supports both label and dot modes with multiple variants
 * 
 * Usage:
 * ```tsx
 * <Badge label="Active" variant="success" />
 * <Badge label={5} variant="error" size="sm" />
 * <Badge variant="primary" dot />
 * ```
 */
export function Badge({ 
  label, 
  variant = 'primary', 
  size = 'md', 
  dot = false,
  className 
}: BadgeProps) {
  if (dot) {
    return (
      <View
        className={cn(
          'rounded-full',
          variantClasses[variant],
          dotSizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <View
      className={cn(
        'rounded-full items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Text
        variant={size === 'sm' ? 'caption' : 'bodySmall'}
        weight="medium"
        className={textVariantClasses[variant]}
      >
        {label}
      </Text>
    </View>
  );
}
