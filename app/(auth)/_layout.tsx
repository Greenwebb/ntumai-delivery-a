// @ts-nocheck

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="phone-input" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="role-confirmation" />
    </Stack>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

