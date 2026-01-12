// @ts-nocheck
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast-provider';
import { useColors } from '@/hooks/use-colors';
import { Store, Package, CheckSquare } from 'lucide-react-native';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function GuestDashboardScreen() {
  const router = useRouter();
  const toast = useToast();
  const colors = useColors();

  const handleSignIn = () => {
    router.push('/(auth)/phone-input');
  };

  const handleServicePress = (service: string) => {
    toast.info('Please sign in to use this feature');
    setTimeout(() => {
      router.push('/(auth)/phone-input');
    }, 1500);
  };

  return (
    <View className="flex-1">
      {/* Theme Toggle - Top Right */}
      <View className="absolute top-12 right-4 z-10">
        <ThemeToggle />
      </View>

      <ScreenContainer className="p-0">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 64 }}>
          {/* Guest Banner */}
          <View className="flex-row items-center justify-between px-4 py-3 gap-3 bg-primary/10">
            <View className="flex-1 gap-1">
              <Text variant="body" color="foreground" weight="medium">
                Browsing as Guest
              </Text>
              <Text variant="bodySmall" color="muted">
                Sign in to place orders and track deliveries
              </Text>
            </View>
            <Button title="Sign In" onPress={handleSignIn} variant="primary" size="small" />
          </View>

          {/* Header */}
          <View className="px-4 pt-6 pb-4 gap-2">
            <Text variant="h1" weight="bold">
              Welcome to Ntumai
            </Text>
            <Text variant="body" color="muted">
              Choose a service to get started
            </Text>
          </View>

          {/* Service Cards */}
          <View className="px-4 gap-3">
            <ServiceCard
              icon={<Store size={32} color={colors.primary} strokeWidth={1.5} />}
              title="Marketplace"
              description="Browse and order from local vendors"
              badge="Popular"
              onPress={() => handleServicePress('marketplace')}
            />
            <ServiceCard
              icon={<Package size={32} color={colors.primary} strokeWidth={1.5} />}
              title="Send a Parcel"
              description="Peer-to-peer delivery service"
              onPress={() => handleServicePress('parcel')}
            />
            <ServiceCard
              icon={<CheckSquare size={32} color={colors.primary} strokeWidth={1.5} />}
              title="Do a Task"
              description="Get errands and tasks done for you"
              onPress={() => handleServicePress('task')}
            />
          </View>

          {/* Info Section */}
          <View className="px-4 pt-8">
            <Text variant="h3" weight="medium" className="mb-3">
              Why choose Ntumai?
            </Text>
            <View className="gap-3">
              <FeatureItem icon="⚡" text="Fast and reliable delivery" />
              <FeatureItem icon="💰" text="Affordable pricing" />
              <FeatureItem icon="📍" text="Real-time tracking" />
              <FeatureItem icon="🔒" text="Secure payments" />
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  badge,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} variant="elevated" padding="lg">
      <View className="flex-row gap-3">
        <View className="w-14 h-14 rounded-full items-center justify-center bg-primary/10">
          {icon}
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text variant="h3" weight="medium">
              {title}
            </Text>
            {badge && <Badge label={badge} variant="secondary" size="sm" />}
          </View>
          <Text variant="body" color="muted">
            {description}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-2xl">{icon}</Text>
      <Text variant="body" color="foreground">
        {text}
      </Text>
    </View>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

