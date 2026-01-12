// @ts-nocheck
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from './text';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
  className,
}: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center px-8 ${className || ''}`} style={style}>
      {icon && (
        <View className="w-20 h-20 rounded-full bg-muted/10 items-center justify-center mb-6">
          {icon}
        </View>
      )}
      
      <Text variant="h3" weight="medium" center className="mb-2">
        {title}
      </Text>
      
      {description && (
        <Text variant="body" color="muted" center className="mb-8">
          {description}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="medium"
          className="min-w-[160px]"
        />
      )}
    </View>
  );
}
