// @ts-nocheck

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { AuthLoadingSkeleton } from '@/components/auth-loading-skeleton';

/**
 * Customer Layout
 * 
 * Simplified auth check that reads directly from Zustand store
 * to avoid infinite loop issues with AuthProvider context sync.
 */
export default function CustomerLayout() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  // Check if user has customer role
  const isCustomer = user?.role === 'customer';
  
  // Handle auth redirect - only once on mount or when auth changes
  useEffect(() => {
    // Wait for auth to be determined
    if (isLoading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace('/(auth)/phone-input');
      return;
    }
    
    // If authenticated but not a customer, redirect to home
    if (isAuthenticated && !isCustomer) {
      router.replace('/(customer)/Home');
      return;
    }
  }, [isAuthenticated, isCustomer, isLoading]);
  
  // Show loading while checking auth
  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }
  
  // Show loading while redirecting
  if (!isAuthenticated || !isCustomer) {
    return <AuthLoadingSkeleton />;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="Home" options={{ headerShown: false }} />
      <Stack.Screen name="Marketplace" options={{ headerShown: false }} />
      <Stack.Screen name="Cart" options={{ headerShown: false }} />
      <Stack.Screen name="VendorDetail" options={{ headerShown: false }} />
      <Stack.Screen name="CheckoutScreen" options={{ headerShown: false }} />
      <Stack.Screen name="OrderHistoryScreen" options={{ headerShown: false }} />
      <Stack.Screen name="OrderTrackingScreen" options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryTrackingScreen" options={{ headerShown: false }} />
    </Stack>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

