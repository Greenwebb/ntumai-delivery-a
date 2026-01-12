// @ts-nocheck
import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useColors } from '@/hooks/use-colors';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'bodyLarge' | 'body' | 'bodySmall' | 'caption';
type TextColor = 'foreground' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type TextWeight = 'light' | 'regular' | 'medium' | 'bold';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  center?: boolean;
  className?: string;
}

const variantClasses: Record<TextVariant, string> = {
  h1: 'text-4xl leading-tight',
  h2: 'text-3xl leading-tight',
  h3: 'text-2xl leading-snug',
  h4: 'text-xl leading-snug',
  bodyLarge: 'text-lg leading-relaxed',
  body: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
};

const colorClasses: Record<TextColor, string> = {
  foreground: 'text-foreground',
  muted: 'text-muted',
  primary: 'text-primary',
  secondary: 'text-muted',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-primary',
};

const weightClasses: Record<TextWeight, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  bold: 'font-bold',
};

export function Text({
  variant = 'body',
  color = 'foreground',
  weight,
  center = false,
  className,
  style,
  ...props
}: TextProps) {
  const colors = useColors();

  // Determine default weight based on variant
  const getDefaultWeight = (): TextWeight => {
    switch (variant) {
      case 'h1':
      case 'h2':
        return 'bold';
      case 'h3':
      case 'h4':
        return 'medium';
      case 'caption':
        return 'light';
      default:
        return 'regular';
    }
  };

  const effectiveWeight = weight || getDefaultWeight();

  const combinedClasses = [
    variantClasses[variant],
    colorClasses[color],
    weightClasses[effectiveWeight],
    center && 'text-center',
    className,
  ].filter(Boolean).join(' ');

  return (
    <RNText
      {...props}
      className={combinedClasses}
      style={style}
    />
  );
}
