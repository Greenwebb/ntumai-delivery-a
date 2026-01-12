// @ts-nocheck

import React from 'react';
import { Image, type ImageProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/utils';

// Import both logos statically for web compatibility
import logoDark from '@/assets/images/ntumai-logo-dark.png';
import logoLight from '@/assets/images/ntumai-logo-light.png';

interface LogoProps {
  /**
   * Size variant for the logo
   * - 'xs': Extra small (h-12, ~48px)
   * - 'sm': Small (h-16, ~64px)
   * - 'md': Medium (h-24, ~96px)
   * - 'lg': Large (h-32, ~128px)
   * - 'xl': Extra large (h-40, ~160px)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Additional className for custom styling
   */
  className?: string;
  /**
   * ResizeMode for the image
   */
  resizeMode?: ImageProps['resizeMode'];
}

const sizeClasses = {
  xs: 'h-12',
  sm: 'h-16',
  md: 'h-24',
  lg: 'h-32',
  xl: 'h-40',
};

/**
 * Logo component that automatically switches between dark and light versions
 * based on the current theme. Uses NativeWind for responsive sizing.
 *
 * Usage:
 * ```tsx
 * <Logo size="lg" className="mb-4" />
 * ```
 */
export function Logo({ 
  size = 'md', 
  className,
  resizeMode = 'contain',
}: LogoProps) {
  const colorScheme = useColorScheme();
  
  // Choose logo based on theme
  const logoSource = colorScheme === 'dark' ? logoLight : logoDark;

  return (
    <Image 
      source={logoSource}
      className={cn(
        'w-full',
        sizeClasses[size],
        className
      )}
      resizeMode={resizeMode}
    />
  );
}
