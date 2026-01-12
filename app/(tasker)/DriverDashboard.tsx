// @ts-nocheck
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import { Package, DollarSign, Clock, TrendingUp, MapPin, User } from 'lucide-react-native';

export default function DriverDashboard() {
  const router = useRouter();
  const colors = useColors();

  const stats = [
    { label: 'Today\'s Deliveries', value: '8', icon: Package, color: '#10B981' },
    { label: 'Today\'s Earnings', value: 'K 240', icon: DollarSign, color: '#3B82F6' },
    { label: 'Hours Online', value: '6.5h', icon: Clock, color: '#F59E0B' },
    { label: 'Acceptance Rate', value: '92%', icon: TrendingUp, color: '#8B5CF6' },
  ];

  const recentDeliveries = [
    { id: 1, customer: 'John Mwale', amount: 'K 35', status: 'completed', time: '2 hours ago' },
    { id: 2, customer: 'Mary Banda', amount: 'K 28', status: 'completed', time: '3 hours ago' },
    { id: 3, customer: 'Peter Phiri', amount: 'K 42', status: 'completed', time: '4 hours ago' },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text variant="h2" weight="bold">Driver Dashboard</Text>
            <Text variant="bodySmall" color="muted">Welcome back, Driver!</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(shared)/ProfileScreen')}>
            <User size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Status Card */}
        <Card className="p-4 mb-4 bg-success/10 border-success">
          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="h4" weight="bold" className="text-success">Online</Text>
              <Text variant="bodySmall" color="muted">Ready to accept deliveries</Text>
            </View>
            <TouchableOpacity className="bg-success px-4 py-2 rounded-lg">
              <Text variant="bodySmall" weight="bold" className="text-white">Go Offline</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="flex-1 min-w-[45%] p-4">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon size={20} color={stat.color} />
                </View>
                <Text variant="h3" weight="bold">{stat.value}</Text>
                <Text variant="caption" color="muted">{stat.label}</Text>
              </Card>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View className="mb-4">
          <Text variant="h4" weight="bold" className="mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-primary p-4 rounded-xl items-center"
              onPress={() => router.push('/(tasker)/AvailableJobsScreen')}
            >
              <MapPin size={24} color="white" />
              <Text variant="bodySmall" weight="bold" className="text-white mt-2">
                Find Jobs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-surface p-4 rounded-xl items-center border border-border"
              onPress={() => router.push('/(tasker)/EarningsScreen')}
            >
              <DollarSign size={24} color={colors.primary} />
              <Text variant="bodySmall" weight="bold" className="text-primary mt-2">
                Earnings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Deliveries */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text variant="h4" weight="bold">Recent Deliveries</Text>
            <TouchableOpacity onPress={() => router.push('/(tasker)/DeliveryHistory')}>
              <Text variant="bodySmall" className="text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          {recentDeliveries.map((delivery) => (
            <Card key={delivery.id} className="p-4 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text variant="body" weight="medium">{delivery.customer}</Text>
                  <Text variant="bodySmall" color="muted">{delivery.time}</Text>
                </View>
                <View className="items-end">
                  <Text variant="body" weight="bold" className="text-success">
                    {delivery.amount}
                  </Text>
                  <View className="bg-success/10 px-2 py-1 rounded">
                    <Text variant="caption" className="text-success capitalize">
                      {delivery.status}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

