// @ts-nocheck

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { AuthLoadingSkeleton } from '@/components/auth-loading-skeleton';

/**
 * Vendor Layout
 * 
 * Simplified auth check that reads directly from Zustand store
 * to avoid infinite loop issues with AuthProvider context sync.
 */
export default function VendorLayout() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  // Check if user has vendor role
  const isVendor = user?.role === 'vendor';
  
  // Handle auth redirect - only once on mount or when auth changes
  useEffect(() => {
    // Wait for auth to be determined
    if (isLoading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace('/(auth)/phone-input');
      return;
    }
    
    // If authenticated but not a vendor, redirect to home
    if (isAuthenticated && !isVendor) {
      router.replace('/(vendor)/VendorDashboard');
      return;
    }
  }, [isAuthenticated, isVendor, isLoading]);
  
  // Show loading while checking auth
  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }
  
  // Show loading while redirecting
  if (!isAuthenticated || !isVendor) {
    return <AuthLoadingSkeleton />;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="VendorDashboard" options={{ headerShown: false }} />
      <Stack.Screen name="AddProductScreen" options={{ headerShown: false }} />
      <Stack.Screen name="EditProductScreen" options={{ headerShown: false }} />
      <Stack.Screen name="VendorAnalyticsScreen" options={{ headerShown: false }} />
      <Stack.Screen name="VendorProductsScreen" options={{ headerShown: false }} />
    </Stack>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

