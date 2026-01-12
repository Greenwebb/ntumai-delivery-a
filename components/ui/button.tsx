// @ts-nocheck
/**
 * Button Component - Global Touchable with NativeWind
 * 
 * This is THE button component for the entire app.
 * All touchable actions should use this component for consistency.
 * 
 * Design Principles:
 * - Minimum touch target: 44px (h-11)
 * - Haptic feedback on press
 * - Loading state support
 * - Icon support (left/right)
 * - Full accessibility
 * - NativeWind only (no inline styles except press feedback)
 */

import React from 'react';
import { Pressable, Text, ActivityIndicator, Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================
type ButtonVariant = 
  | 'primary'      // Teal background, white text - main CTAs
  | 'secondary'    // Surface background, foreground text - secondary actions
  | 'outline'      // Transparent with border - tertiary actions
  | 'ghost'        // Transparent, no border - subtle actions
  | 'destructive'  // Red background - dangerous actions
  | 'success'      // Green background - positive actions
  | 'white'        // White background, primary text - for dark backgrounds
  | 'black';       // Black background, white text - for light backgrounds

type ButtonSize = 
  | 'sm'   // 36px height - compact buttons
  | 'md'   // 44px height - standard (default)
  | 'lg'   // 52px height - prominent CTAs
  | 'xl';  // 56px height - hero buttons

interface ButtonProps {
  /** Button label text */
  title?: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize | 'large';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state - shows spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon on the left */
  iconLeft?: React.ReactNode;
  /** Icon on the right */
  iconRight?: React.ReactNode;
  /** Icon only (no text) - makes button square */
  iconOnly?: React.ReactNode;
  /** Additional container classes */
  className?: string;
  /** Additional text classes */
  textClassName?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Children for custom content */
  children?: React.ReactNode;
}

// ============================================
// STYLE MAPPINGS
// ============================================
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 min-h-[36px]',
  md: 'px-4 min-h-[44px]',
  lg: 'px-6 min-h-[52px]',
  xl: 'px-8 min-h-[56px]',
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-13 h-13',
  xl: 'w-14 h-14',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
  xl: 'text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-surface border border-border',
  outline: 'bg-transparent border-2 border-primary',
  ghost: 'bg-transparent',
  destructive: 'bg-error',
  success: 'bg-success',
  white: 'bg-white',
  black: 'bg-black',
};

const textColorClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-foreground',
  outline: 'text-primary',
  ghost: 'text-primary',
  destructive: 'text-white',
  success: 'text-white',
  white: 'text-primary',
  black: 'text-white',
};

const spinnerColors: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#687076',
  outline: '#009688',
  ghost: '#009688',
  destructive: '#FFFFFF',
  success: '#FFFFFF',
  white: '#009688',
  black: '#FFFFFF',
};

// ============================================
// COMPONENT
// ============================================
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  iconOnly,
  className,
  textClassName,
  accessibilityLabel,
  accessibilityHint,
  children,
}: ButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const isIconOnly = !!iconOnly;
  // Map 'large' to 'lg' for backwards compatibility
  const normalizedSize = size === 'large' ? 'lg' : size;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={cn(
        // Base styles
        'rounded-xl flex-row items-center justify-center',
        // Size
        isIconOnly ? iconOnlySizeClasses[normalizedSize] : sizeClasses[normalizedSize],
        // Variant
        variantClasses[variant],
        // Full width
        fullWidth && 'w-full',
        // Disabled state
        (disabled || loading) && 'opacity-50',
        // Custom className
        className
      )}
      style={({ pressed }) => ({
        opacity: pressed && !disabled && !loading ? 0.8 : (disabled || loading) ? 0.5 : 1,
        transform: [{ scale: pressed && !disabled && !loading ? 0.97 : 1 }],
      })}
    >
      {loading ? (
        <ActivityIndicator 
          color={spinnerColors[variant]} 
          size="small" 
        />
      ) : isIconOnly ? (
        iconOnly
      ) : children ? (
        children
      ) : (
        <View className="flex-row items-center gap-2">
          {iconLeft}
          {title && (
            <Text
              className={cn(
                'font-semibold text-center',
                textSizeClasses[normalizedSize],
                textColorClasses[variant],
                textClassName
              )}
            >
              {title}
            </Text>
          )}
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

// ============================================
// CONVENIENCE VARIANTS
// ============================================

/** Primary CTA button */
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />;
}

/** Secondary action button */
export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />;
}

/** Outline/tertiary button */
export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="outline" />;
}

/** Ghost/text button */
export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="ghost" />;
}

/** Destructive/danger button */
export function DestructiveButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="destructive" />;
}

/** Icon-only button */
export function IconButton({ 
  icon, 
  onPress, 
  variant = 'ghost',
  size = 'md',
  ...props 
}: Omit<ButtonProps, 'iconOnly' | 'title'> & { icon: React.ReactNode }) {
  return (
    <Button 
      {...props} 
      iconOnly={icon} 
      onPress={onPress} 
      variant={variant}
      size={size}
    />
  );
}
