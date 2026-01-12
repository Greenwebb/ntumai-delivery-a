// @ts-nocheck
/**
 * Shared UI Components - NativeWind Only
 * 
 * Industry-standard design patterns:
 * - All styling via NativeWind/Tailwind classes
 * - Proper touch targets (min h-11)
 * - Consistent spacing with gap-* tokens
 * - Loading, empty, error states
 * - Responsive design (no fixed widths)
 */

import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Text } from './text';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react-native';

// ============================================
// STATUS BADGE - For dynamic status colors
// ============================================
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'neutral';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<StatusType, { bg: string; text: string }> = {
  success: { bg: 'bg-success/20', text: 'text-success' },
  warning: { bg: 'bg-warning/20', text: 'text-warning' },
  error: { bg: 'bg-error/20', text: 'text-error' },
  info: { bg: 'bg-primary/20', text: 'text-primary' },
  pending: { bg: 'bg-warning/20', text: 'text-warning' },
  neutral: { bg: 'bg-muted/20', text: 'text-muted' },
};

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const styles = statusStyles[status] || statusStyles.neutral;
  
  return (
    <View className={cn(
      'rounded-full self-start',
      size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5',
      styles.bg
    )}>
      <Text 
        className={cn(
          'font-medium capitalize',
          size === 'sm' ? 'text-xs' : 'text-sm',
          styles.text
        )}
      >
        {label}
      </Text>
    </View>
  );
}

// ============================================
// SECTION HEADER - Consistent section titles
// ============================================
interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text variant="h4" weight="semibold" className="text-foreground">
        {title}
      </Text>
      {action && (
        <TouchableOpacity 
          onPress={action.onPress}
          className="py-1 px-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text variant="body" className="text-primary">
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// LIST ITEM - Consistent list item styling
// ============================================
interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

export function ListItem({ 
  title, 
  subtitle, 
  leftIcon, 
  rightElement, 
  onPress,
  disabled 
}: ListItemProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const content = (
    <>
      {leftIcon && (
        <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-3">
          {leftIcon}
        </View>
      )}
      <View className="flex-1">
        <Text variant="body" weight="medium" className="text-foreground">
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" className="text-muted mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        className={cn(
          'flex-row items-center py-3 px-4 min-h-[56px]',
          disabled && 'opacity-50'
        )}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-center py-3 px-4 min-h-[56px]">
      {content}
    </View>
  );
}

// ============================================
// LOADING STATE - Consistent loading indicator
// ============================================
interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', fullScreen = true }: LoadingStateProps) {
  const colors = useColors();
  
  return (
    <View className={cn(
      'items-center justify-center',
      fullScreen ? 'flex-1' : 'py-12'
    )}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="body" className="text-muted mt-4">
        {message}
      </Text>
    </View>
  );
}

// ============================================
// EMPTY STATE - Consistent empty state
// ============================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyStateView({ icon, title, description, action }: EmptyStateProps) {
  const colors = useColors();
  
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-4">
        {icon || <Inbox size={32} color={colors.muted} />}
      </View>
      <Text variant="h4" weight="semibold" className="text-foreground text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text variant="body" className="text-muted text-center mb-6 max-w-[280px]">
          {description}
        </Text>
      )}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          className="bg-primary px-6 py-3 rounded-xl min-h-[44px] items-center justify-center"
          activeOpacity={0.8}
        >
          <Text variant="body" weight="semibold" className="text-white">
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// ERROR STATE - Consistent error display
// ============================================
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry 
}: ErrorStateProps) {
  const colors = useColors();
  
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-4">
        <AlertCircle size={32} color={colors.error} />
      </View>
      <Text variant="h4" weight="semibold" className="text-foreground text-center mb-2">
        {title}
      </Text>
      <Text variant="body" className="text-muted text-center mb-6 max-w-[280px]">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="flex-row items-center gap-2 bg-surface px-6 py-3 rounded-xl min-h-[44px]"
          activeOpacity={0.8}
        >
          <RefreshCw size={18} color={colors.primary} />
          <Text variant="body" weight="semibold" className="text-primary">
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// DIVIDER - Consistent divider
// ============================================
interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <View className={cn('h-px bg-border', className)} />;
}

// ============================================
// ICON BUTTON - Consistent icon button
// ============================================
interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function IconButton({ 
  icon, 
  onPress, 
  variant = 'default',
  size = 'md',
  disabled,
  className 
}: IconButtonProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variantClasses = {
    default: 'bg-surface',
    primary: 'bg-primary',
    ghost: 'bg-transparent',
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        'rounded-full items-center justify-center',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50',
        className
      )}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
}

// ============================================
// METRIC CARD - For dashboard stats
// ============================================
interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ label, value, icon, trend, className }: MetricCardProps) {
  return (
    <View className={cn(
      'bg-surface rounded-xl p-4 min-w-[140px]',
      className
    )}>
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="caption" className="text-muted">
          {label}
        </Text>
        {icon}
      </View>
      <Text variant="h3" weight="bold" className="text-foreground">
        {value}
      </Text>
      {trend && (
        <Text 
          variant="caption" 
          className={cn(
            'mt-1',
            trend.isPositive ? 'text-success' : 'text-error'
          )}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </Text>
      )}
    </View>
  );
}

// ============================================
// BOTTOM ACTION BAR - For fixed bottom CTAs
// ============================================
interface BottomActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function BottomActionBar({ children, className }: BottomActionBarProps) {
  return (
    <View className={cn(
      'absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 pt-4 pb-8',
      className
    )}>
      {children}
    </View>
  );
}

// ============================================
// PROGRESS BAR - Consistent progress indicator
// ============================================
interface ProgressBarProps {
  progress: number; // 0-100
  height?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

export function ProgressBar({ 
  progress, 
  height = 'md',
  color = 'primary',
  showLabel 
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View className="w-full">
      <View className={cn('w-full bg-surface rounded-full overflow-hidden', heightClasses[height])}>
        <View 
          className={cn('h-full rounded-full', colorClasses[color])}
          // Dynamic width requires style prop - this is acceptable for calculated values
          style={{ width: `${clampedProgress}%` } as any}
        />
      </View>
      {showLabel && (
        <Text variant="caption" className="text-muted mt-1 text-right">
          {clampedProgress}%
        </Text>
      )}
    </View>
  );
}
