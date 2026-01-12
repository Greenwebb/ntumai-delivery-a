// @ts-nocheck
import { Stack } from 'expo-router';

export default function LaunchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="role-selection" />
    </Stack>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

