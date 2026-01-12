// @ts-nocheck
import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
// import { notificationEvents } from "@/lib/services/notification-events";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform, View, AppState } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { ToastProvider } from "@/lib/toast-provider";
import { AppProvider } from "@/src/providers";
import { ErrorBoundary } from "@/components/error-boundary";
// import { OfflineIndicator } from "@/components/offline-indicator";
// import { useOfflineStore } from "@/stores/offline-store";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";


import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(launch)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const [isReady, setIsReady] = useState(false);

  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    'Ubuntu-Regular': require('@/assets/fonts/Ubuntu-Regular.ttf'),
    'Ubuntu-Medium': require('@/assets/fonts/Ubuntu-Medium.ttf'),
    'Ubuntu-Bold': require('@/assets/fonts/Ubuntu-Bold.ttf'),
    'Ubuntu-Light': require('@/assets/fonts/Ubuntu-Light.ttf'),
    'Ubuntu-Italic': require('@/assets/fonts/Ubuntu-Italic.ttf'),
    'Ubuntu-BoldItalic': require('@/assets/fonts/Ubuntu-BoldItalic.ttf'),
    'Ubuntu-LightItalic': require('@/assets/fonts/Ubuntu-LightItalic.ttf'),
    'Ubuntu-MediumItalic': require('@/assets/fonts/Ubuntu-MediumItalic.ttf'),
  });

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  // Handle fonts loading and splash screen
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  // Lock app to portrait orientation globally
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, []);

  // Initialize offline store
  // useEffect(() => {
  //   useOfflineStore.getState().initialize();
  // }, []);

  // Sync pending actions when app comes to foreground
  // useEffect(() => {
  //   const subscription = AppState.addEventListener('change', (nextAppState) => {
  //     if (nextAppState === 'active') {
  //       // App came to foreground, try to sync
  //       const { isOnline, pendingActions, syncPendingActions } = useOfflineStore.getState();
  //       if (isOnline && pendingActions.length > 0) {
  //         syncPendingActions();
  //       }
  //     }
  //   });

  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);

  // Initialize push notification event handlers
  // useEffect(() => {
  //   let cleanup: (() => void) | void;
  //   
  //   const init = async () => {
  //     cleanup = await notificationEvents.initialize();
  //   };
  //   
  //   init();
  //   
  //   return () => {
  //     if (cleanup && typeof cleanup === 'function') {
  //       cleanup();
  //     }
  //   };
  // }, []);

  // Subscribe to safe area updates on web
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Don't render anything until fonts are loaded
  // This must come AFTER all hooks to maintain consistent hook order
  if (!isReady) {
    return null;
  }

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <ToastProvider>
            {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
            {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
            <Stack screenOptions={{ headerShown: false }}>
              {/* Launch flow screens */}
              <Stack.Screen name="(launch)" />
              {/* Auth screens */}
              <Stack.Screen name="(auth)" />
              {/* Customer screens */}
              {/* <Stack.Screen name="(customer)" /> */}
              {/* Tasker screens */}
              {/* <Stack.Screen name="(tasker)" /> */}
              {/* Vendor screens */}
              {/* <Stack.Screen name="(vendor)" /> */}
              {/* Guest screens */}
              {/* <Stack.Screen name="(guest)" /> */}
              {/* Shared screens */}
              {/* <Stack.Screen name="(shared)" /> */}
              {/* Tab navigation */}
              {/* <Stack.Screen name="(tabs)" /> */}
              {/* OAuth callback */}
              {/* <Stack.Screen name="oauth/callback" /> */}
              {/* Root index */}
              <Stack.Screen name="index" />
            </Stack>
            <StatusBar style="auto" />
            {/* <OfflineIndicator /> */}
          </ToastProvider>
        </AppProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

