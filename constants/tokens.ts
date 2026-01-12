/**
 * Design Tokens for Ntumai Delivery
 * Based on Brand Guidelines v1.0
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const FONT_SIZE = {
  h1: 32,
  h2: 24,
  h3: 18,
  h4: 14,
  bodyLarge: 16,
  body: 14,
  bodySmall: 12,
  caption: 11,
} as const;

export const LINE_HEIGHT = {
  h1: 40,
  h2: 32,
  h3: 24,
  h4: 20,
  bodyLarge: 24,
  body: 20,
  bodySmall: 16,
  caption: 16,
} as const;

export const FONT_WEIGHT = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  bold: '700' as const,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const ANIMATION = {
  duration: {
    fast: 80,
    normal: 250,
    slow: 400,
  },
  scale: {
    pressed: 0.97,
  },
  opacity: {
    pressed: 0.8,
    disabled: 0.5,
  },
} as const;

export const TOUCH_TARGET = {
  minHeight: 44,
  minWidth: 44,
} as const;
