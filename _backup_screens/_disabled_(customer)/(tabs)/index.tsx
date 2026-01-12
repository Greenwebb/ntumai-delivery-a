// @ts-nocheck
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Package, Truck, ShoppingBag, MapPin, ChevronRight } from 'lucide-react-native';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useColors } from '@/hooks/use-colors';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const colors = useColors();

  const services = [
    {
      id: '1',
      title: 'Marketplace',
      subtitle: 'Order food & products',
      icon: <ShoppingBag size={32} color="#10B981" />,
      route: '/marketplace',
      bgColor: 'bg-green-100',
    },
    {
      id: '2',
      title: 'Send Parcel',
      subtitle: 'Deliver packages',
      icon: <Package size={32} color="#F59E0B" />,
      route: '/SendParcelScreen',
      bgColor: 'bg-amber-100',
    },
    {
      id: '3',
      title: 'Do Task',
      subtitle: 'Get help with errands',
      icon: <Truck size={32} color="#3B82F6" />,
      route: '/DoTaskScreen',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <View className="flex-1">
      {/* Theme Toggle */}
      <View className="absolute top-12 right-4 z-10">
        <ThemeToggle />
      </View>

      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-4 pt-6 pb-4">
            <Text variant="h1" weight="bold">
              Ntumai
            </Text>
            <Text variant="body" color="muted" className="mt-1">
              What would you like to do today?
            </Text>
          </View>

          {/* Location Banner */}
          <TouchableOpacity className="flex-row items-center mx-4 mb-4 p-4 rounded-xl bg-surface border border-border">
            <MapPin size={20} color={colors.primary} />
            <View className="flex-1 ml-3">
              <Text variant="bodySmall" color="muted">
                Deliver to
              </Text>
              <Text variant="body" weight="medium">
                Lusaka, Zambia
              </Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Services Grid */}
          <View className="px-4 mb-6">
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                className="p-4 rounded-xl mb-3 bg-background border border-border"
                onPress={() => router.push(service.route as any)}
              >
                <View className={`w-16 h-16 rounded-xl items-center justify-center ${service.bgColor}`}>
                  {service.icon}
                </View>
                <Text variant="h4" weight="bold" className="mt-4">
                  {service.title}
                </Text>
                <Text variant="bodySmall" color="muted" className="mt-1">
                  {service.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View className="px-4 mb-6">
            <Text variant="h3" weight="bold" className="mb-4">
              Quick Actions
            </Text>
            <Card className="p-4">
              <TouchableOpacity className="py-2">
                <Text variant="body" weight="medium">
                  Track Order
                </Text>
                <Text variant="bodySmall" color="muted" className="mt-1">
                  Check your active deliveries
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

