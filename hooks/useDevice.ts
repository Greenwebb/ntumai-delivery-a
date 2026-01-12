// @ts-nocheck

// Device information and capabilities hook
import { useState, useEffect, useCallback } from 'react';
import { Dimensions, Platform, StatusBar } from 'react-native';
import { DeviceState } from './types';
import { DeviceService, deviceDetection, screenUtils } from '@/src/utils/device';

export interface UseDeviceOptions {
  trackOrientation?: boolean;
  trackNetwork?: boolean;
  trackBattery?: boolean;
  trackStorage?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseDeviceResult {
  // Device state
  device: DeviceState;
  
  // Device detection
  isIOS: boolean;
  isAndroid: boolean;
  isTablet: boolean;
  isPhone: boolean;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  
  // Screen utilities
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
  isPortrait: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Responsive helpers
  wp: (percentage: number) => number; // Width percentage
  hp: (percentage: number) => number; // Height percentage
  moderateScale: (size: number, factor?: number) => number;
  
  // Actions
  refresh: () => Promise<void>;
  getDeviceInfo: () => Promise<DeviceState>;
}

export const useDevice = (options: UseDeviceOptions = {}): UseDeviceResult => {
  const {
    trackOrientation = true,
    trackNetwork = true,
    trackBattery = false,
    trackStorage = false,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [device, setDevice] = useState<DeviceState>({
    platform: Platform.OS,
    version: Platform.Version.toString(),
    model: '',
    brand: '',
    deviceId: '',
    systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
    systemVersion: Platform.Version.toString(),
    bundleId: '',
    buildNumber: '',
    version: '',
    readableVersion: '',
    deviceName: '',
    userAgent: '',
    deviceCountry: '',
    deviceLocale: '',
    timezone: '',
    isEmulator: false,
    isTablet: deviceDetection.isTablet(),
    hasNotch: deviceDetection.hasNotch(),
    hasDynamicIsland: deviceDetection.hasDynamicIsland(),
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height,
    screenScale: Dimensions.get('window').scale,
    fontScale: Dimensions.get('window').fontScale,
    isLandscape: screenUtils.isLandscape(),
    statusBarHeight: StatusBar.currentHeight || 0,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    networkType: 'unknown',
    isConnected: true,
    isInternetReachable: true,
    batteryLevel: 1,
    batteryState: 'unknown',
    isLowPowerMode: false,
    availableStorage: 0,
    totalStorage: 0,
    usedStorage: 0,
    freeMemory: 0,
    totalMemory: 0,
    usedMemory: 0,
  });

  const [refreshing, setRefreshing] = useState(false);

  // Device detection helpers
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isTablet = device.isTablet;
  const isPhone = !device.isTablet;
  const hasNotch = device.hasNotch;
  const hasDynamicIsland = device.hasDynamicIsland;

  // Screen properties
  const screenWidth = device.screenWidth;
  const screenHeight = device.screenHeight;
  const isLandscape = device.isLandscape;
  const isPortrait = !device.isLandscape;
  const safeAreaInsets = device.safeAreaInsets;

  // Responsive helpers
  const wp = useCallback((percentage: number): number => {
    return screenUtils.wp(percentage);
  }, []);

  const hp = useCallback((percentage: number): number => {
    return screenUtils.hp(percentage);
  }, []);

  const moderateScale = useCallback((size: number, factor: number = 0.5): number => {
    return screenUtils.moderateScale(size, factor);
  }, []);

  // Load device information
  const loadDeviceInfo = useCallback(async (): Promise<DeviceState> => {
    try {
      const deviceService = new DeviceService();
      await deviceService.initialize();
      
      const deviceInfo = deviceService.getDeviceInfo();
      const screenInfo = screenUtils.getScreenDimensions();
      const safeArea = screenUtils.getSafeAreaInsets();
      
      let networkInfo = null;
      let batteryInfo = null;
      let storageInfo = null;
      
      if (trackNetwork) {
        networkInfo = deviceService.getNetworkInfo();
      }
      
      if (trackBattery) {
        batteryInfo = deviceService.getBatteryInfo();
      }
      
      if (trackStorage) {
        storageInfo = deviceService.getStorageInfo();
      }
      
      const newDeviceState: DeviceState = {
        ...deviceInfo,
        ...screenInfo,
        safeAreaInsets: safeArea,
        isLandscape: screenUtils.isLandscape(),
        statusBarHeight: StatusBar.currentHeight || (isIOS ? (hasNotch ? 44 : 20) : 0),
        ...(networkInfo && {
          networkType: networkInfo.type,
          isConnected: networkInfo.isConnected,
          isInternetReachable: networkInfo.isInternetReachable,
        }),
        ...(batteryInfo && {
          batteryLevel: batteryInfo.level,
          batteryState: batteryInfo.state,
          isLowPowerMode: batteryInfo.lowPowerMode,
        }),
        ...(storageInfo && {
          availableStorage: storageInfo.available,
          totalStorage: storageInfo.total,
          usedStorage: storageInfo.used,
          freeMemory: storageInfo.freeMemory,
          totalMemory: storageInfo.totalMemory,
          usedMemory: storageInfo.usedMemory,
        }),
      };
      
      return newDeviceState;
    } catch (error) {
      console.error('Error loading device info:', error);
      return device; // Return current state on error
    }
  }, [device, trackNetwork, trackBattery, trackStorage, isIOS, hasNotch]);

  // Refresh device information
  const refresh = useCallback(async (): Promise<void> => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
      const newDeviceState = await loadDeviceInfo();
      setDevice(newDeviceState);
    } catch (error) {
      console.error('Error refreshing device info:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loadDeviceInfo]);

  // Get device info (alias for loadDeviceInfo)
  const getDeviceInfo = useCallback(async (): Promise<DeviceState> => {
    return await loadDeviceInfo();
  }, [loadDeviceInfo]);

  // Initialize device information
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        const deviceState = await loadDeviceInfo();
        if (mounted) {
          setDevice(deviceState);
        }
      } catch (error) {
        console.error('Error initializing device info:', error);
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
    };
  }, [loadDeviceInfo]);

  // Handle orientation changes
  useEffect(() => {
    if (!trackOrientation) return;

    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDevice(prev => ({
        ...prev,
        screenWidth: window.width,
        screenHeight: window.height,
        screenScale: window.scale,
        fontScale: window.fontScale,
        isLandscape: window.width > window.height,
      }));
    });

    return () => subscription?.remove();
  }, [trackOrientation]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    // Device state
    device,
    
    // Device detection
    isIOS,
    isAndroid,
    isTablet,
    isPhone,
    hasNotch,
    hasDynamicIsland,
    
    // Screen utilities
    screenWidth,
    screenHeight,
    isLandscape,
    isPortrait,
    safeAreaInsets,
    
    // Responsive helpers
    wp,
    hp,
    moderateScale,
    
    // Actions
    refresh,
    getDeviceInfo,
  };
};

// Specialized device hooks
export const useOrientation = () => {
  const { isLandscape, isPortrait, screenWidth, screenHeight } = useDevice({
    trackOrientation: true,
  });
  
  return {
    isLandscape,
    isPortrait,
    screenWidth,
    screenHeight,
    orientation: isLandscape ? 'landscape' : 'portrait',
  };
};

export const useScreenDimensions = () => {
  const { screenWidth, screenHeight, screenScale, fontScale, safeAreaInsets } = useDevice();
  
  return {
    width: screenWidth,
    height: screenHeight,
    scale: screenScale,
    fontScale,
    safeAreaInsets,
  };
};

export const useNetworkStatus = () => {
  const { device, refresh } = useDevice({
    trackNetwork: true,
    autoRefresh: true,
    refreshInterval: 5000, // Check every 5 seconds
  });
  
  return {
    networkType: device.networkType,
    isConnected: device.isConnected,
    isInternetReachable: device.isInternetReachable,
    isOnline: device.isConnected && device.isInternetReachable,
    isOffline: !device.isConnected || !device.isInternetReachable,
    refresh,
  };
};

export const useBatteryStatus = () => {
  const { device, refresh } = useDevice({
    trackBattery: true,
    autoRefresh: true,
    refreshInterval: 60000, // Check every minute
  });
  
  return {
    batteryLevel: device.batteryLevel,
    batteryState: device.batteryState,
    isLowPowerMode: device.isLowPowerMode,
    isCharging: device.batteryState === 'charging',
    isCriticallyLow: device.batteryLevel < 0.1,
    isLow: device.batteryLevel < 0.2,
    refresh,
  };
};

export const useStorageStatus = () => {
  const { device, refresh } = useDevice({
    trackStorage: true,
  });
  
  const storageUsagePercentage = device.totalStorage > 0 
    ? (device.usedStorage / device.totalStorage) * 100 
    : 0;
    
  const memoryUsagePercentage = device.totalMemory > 0 
    ? (device.usedMemory / device.totalMemory) * 100 
    : 0;
  
  return {
    availableStorage: device.availableStorage,
    totalStorage: device.totalStorage,
    usedStorage: device.usedStorage,
    storageUsagePercentage,
    isStorageLow: storageUsagePercentage > 90,
    isStorageCritical: storageUsagePercentage > 95,
    
    freeMemory: device.freeMemory,
    totalMemory: device.totalMemory,
    usedMemory: device.usedMemory,
    memoryUsagePercentage,
    isMemoryLow: memoryUsagePercentage > 80,
    isMemoryCritical: memoryUsagePercentage > 90,
    
    refresh,
  };
};

// Platform-specific hooks
export const useIOSFeatures = () => {
  const { isIOS, hasNotch, hasDynamicIsland, device } = useDevice();
  
  if (!isIOS) {
    return {
      isSupported: false,
      hasNotch: false,
      hasDynamicIsland: false,
      supportsHaptics: false,
      supportsWidgets: false,
    };
  }
  
  const iosVersion = parseFloat(device.systemVersion);
  
  return {
    isSupported: true,
    hasNotch,
    hasDynamicIsland,
    supportsHaptics: iosVersion >= 10.0,
    supportsWidgets: iosVersion >= 14.0,
    supportsAppClips: iosVersion >= 14.0,
    supportsShortcuts: iosVersion >= 12.0,
  };
};

export const useAndroidFeatures = () => {
  const { isAndroid, device } = useDevice();
  
  if (!isAndroid) {
    return {
      isSupported: false,
      apiLevel: 0,
      supportsNotificationChannels: false,
      supportsBiometrics: false,
    };
  }
  
  const apiLevel = typeof device.version === 'number' ? device.version : parseInt(device.version);
  
  return {
    isSupported: true,
    apiLevel,
    supportsNotificationChannels: apiLevel >= 26, // Android 8.0
    supportsBiometrics: apiLevel >= 23, // Android 6.0
    supportsAdaptiveIcons: apiLevel >= 26, // Android 8.0
    supportsAppBundles: apiLevel >= 21, // Android 5.0
  };
};
