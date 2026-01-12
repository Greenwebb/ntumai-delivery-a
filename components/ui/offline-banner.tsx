
import React from 'react';
import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/use-network-status';

/**
 * OfflineBanner - Displays a persistent banner when the device is offline
 * 
 * Features:
 * - Automatically shows/hides based on network status
 * - Uses NativeWind for styling
 * - Positioned at the top of the screen (use in root layout)
 * - Warning color scheme to grab attention
 * 
 * Usage in app/_layout.tsx:
 * OfflineBanner component followed by Stack with your screens
 */
export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  // Don't show banner if we're still checking or if connected
  if (isConnected === null || isConnected === true) {
    return null;
  }

  // Show banner if definitely offline or if connected but internet not reachable
  const isOffline = isConnected === false || isInternetReachable === false;

  if (!isOffline) {
    return null;
  }

  return (
    <View className="bg-warning px-4 py-3 flex-row items-center justify-center">
      <WifiOff size={16} color="#000000" className="mr-2" />
      <Text className="text-sm font-medium text-black">
        No internet connection. Some features may be unavailable.
      </Text>
    </View>
  );
}
