// @ts-nocheck
import { Stack } from 'expo-router';

export default function SharedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddressesScreen" />
      <Stack.Screen name="ChatScreen" />
      <Stack.Screen name="EditProfileScreen" />
      <Stack.Screen name="HelpSupportScreen" />
      <Stack.Screen name="PaymentMethodsScreen" />
      <Stack.Screen name="ProfileScreen" />
      <Stack.Screen name="ReferralScreen" />
      <Stack.Screen name="WalletScreen" />
    </Stack>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

