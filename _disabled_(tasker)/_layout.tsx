// @ts-nocheck

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { AuthLoadingSkeleton } from '@/components/auth-loading-skeleton';

/**
 * Tasker Layout
 * 
 * Simplified auth check that reads directly from Zustand store
 * to avoid infinite loop issues with AuthProvider context sync.
 */
export default function TaskerLayout() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  // Check if user has tasker role
  const isTasker = user?.role === 'tasker';
  
  // Handle auth redirect - only once on mount or when auth changes
  useEffect(() => {
    // Wait for auth to be determined
    if (isLoading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace('/(auth)/phone-input');
      return;
    }
    
    // If authenticated but not a tasker, redirect to home
    if (isAuthenticated && !isTasker) {
      router.replace('/(tasker)/TaskerDashboard');
      return;
    }
  }, [isAuthenticated, isTasker, isLoading]);
  
  // Show loading while checking auth
  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }
  
  // Show loading while redirecting
  if (!isAuthenticated || !isTasker) {
    return <AuthLoadingSkeleton />;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="TaskerDashboard" options={{ headerShown: false }} />
      <Stack.Screen name="EarningsScreen" options={{ headerShown: false }} />
      <Stack.Screen name="AvailableJobsScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ActiveJobScreen" options={{ headerShown: false }} />
      <Stack.Screen name="TaskerOrders" options={{ headerShown: false }} />
    </Stack>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

