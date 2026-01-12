// @ts-nocheck
/**
 * Demo Mode Indicator
 * 
 * Shows a small badge in the UI when demo mode is active
 * Helps users understand they're using mock data
 */

import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { isDemoMode, DEMO_CONFIG } from '@/lib/config/demo-mode';

interface DemoModeIndicatorProps {
  position?: 'top' | 'bottom';
}

export function DemoModeIndicator({ position = 'top' }: DemoModeIndicatorProps) {
  // Only show if demo mode is enabled and showDemoIndicator is true
  if (!isDemoMode() || !DEMO_CONFIG.showDemoIndicator) {
    return null;
  }
  
  return (
    <View 
      className={`absolute ${position === 'top' ? 'top-2' : 'bottom-2'} right-2 z-50`}
    >
      <View className="bg-warning/90 px-3 py-1 rounded-full">
        <Text className="text-white text-xs font-semibold">
          🎭 DEMO
        </Text>
      </View>
    </View>
  );
}
