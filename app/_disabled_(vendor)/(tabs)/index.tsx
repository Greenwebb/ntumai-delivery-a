// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Clock,
  Star,
  Package,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/stores/auth-store';
import { isDemoMode } from '@/lib/config/demo-mode';

const { width } = Dimensions.get('window');

export default function VendorAnalyticsDashboard() {
  const router = useRouter();
  const colors = useColors();
  const user = useAuthStore((state) => state.user);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    if (isDemoMode()) {
      // Mock analytics data
      const mockData = {
        day: {
          revenue: 1250,
          revenueChange: 12.5,
          orders: 28,
          ordersChange: 8.3,
          avgOrderValue: 44.64,
          avgOrderValueChange: 3.8,
          acceptanceRate: 96.4,
          acceptanceRateChange: 2.1,
          avgPrepTime: 18,
          avgPrepTimeChange: -5.3,
          rating: 4.8,
          ratingChange: 0.2,
          popularItems: [
            { id: '1', name: 'Nshima with Chicken', orders: 45, revenue: 2025 },
            { id: '2', name: 'Grilled Fish', orders: 32, revenue: 1920 },
            { id: '3', name: 'Beef Stew', orders: 28, revenue: 1400 },
            { id: '4', name: 'Vegetable Rice', orders: 24, revenue: 720 },
            { id: '5', name: 'Chips', orders: 20, revenue: 300 },
          ],
          hourlyOrders: [2, 3, 1, 4, 6, 8, 12, 15, 10, 8, 6, 4],
        },
        week: {
          revenue: 8750,
          revenueChange: 15.2,
          orders: 196,
          ordersChange: 10.5,
          avgOrderValue: 44.64,
          avgOrderValueChange: 4.2,
          acceptanceRate: 94.2,
          acceptanceRateChange: 1.8,
          avgPrepTime: 19,
          avgPrepTimeChange: -3.1,
          rating: 4.7,
          ratingChange: 0.1,
          popularItems: [
            { id: '1', name: 'Nshima with Chicken', orders: 315, revenue: 14175 },
            { id: '2', name: 'Grilled Fish', orders: 224, revenue: 13440 },
            { id: '3', name: 'Beef Stew', orders: 196, revenue: 9800 },
            { id: '4', name: 'Vegetable Rice', orders: 168, revenue: 5040 },
            { id: '5', name: 'Chips', orders: 140, revenue: 2100 },
          ],
          dailyOrders: [25, 28, 32, 26, 30, 28, 27],
        },
        month: {
          revenue: 37500,
          revenueChange: 18.7,
          orders: 840,
          ordersChange: 12.3,
          avgOrderValue: 44.64,
          avgOrderValueChange: 5.7,
          acceptanceRate: 93.8,
          acceptanceRateChange: 1.2,
          avgPrepTime: 20,
          avgPrepTimeChange: -2.5,
          rating: 4.7,
          ratingChange: 0.15,
          popularItems: [
            { id: '1', name: 'Nshima with Chicken', orders: 1350, revenue: 60750 },
            { id: '2', name: 'Grilled Fish', orders: 960, revenue: 57600 },
            { id: '3', name: 'Beef Stew', orders: 840, revenue: 42000 },
            { id: '4', name: 'Vegetable Rice', orders: 720, revenue: 21600 },
            { id: '5', name: 'Chips', orders: 600, revenue: 9000 },
          ],
          weeklyOrders: [180, 195, 210, 205, 220],
        },
      };

      setAnalytics(mockData[timeRange]);
    }
  };

  const renderMetricCard = (
    icon: any,
    label: string,
    value: string,
    change: number,
    iconColor: string,
    iconBg: string
  ) => {
    const Icon = icon;
    const isPositive = change > 0;
    const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <Card className="p-4 flex-1">
        <View className="flex-row items-center justify-between mb-3">
          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
            <Icon size={20} color={iconColor} />
          </View>
          <View className="flex-row items-center">
            <ChangeIcon size={14} color={isPositive ? colors.success : colors.error} />
            <Text
              variant="bodySmall"
              weight="bold"
              className="ml-1"
              style={{ color: isPositive ? colors.success : colors.error }}
            >
              {Math.abs(change)}%
            </Text>
          </View>
        </View>
        <Text variant="h3" weight="bold" className="mb-1">{value}</Text>
        <Text variant="bodySmall" color="muted">{label}</Text>
      </Card>
    );
  };

  if (!analytics) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text variant="body" color="muted">Loading analytics...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <Text variant="h1" weight="bold">Dashboard</Text>
        <Text variant="body" color="muted" className="mt-1">
          Track your business performance
        </Text>
      </View>

      {/* Time Range Selector */}
      <View className="px-4 mb-4">
        <View className="flex-row gap-2">
          {[
            { id: 'day', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
          ].map((range) => (
            <TouchableOpacity
              key={range.id}
              onPress={() => setTimeRange(range.id as any)}
              className={`flex-1 py-3 rounded-xl ${
                timeRange === range.id ? 'bg-primary' : 'bg-surface border border-border'
              }`}
            >
              <Text
                variant="bodySmall"
                weight="bold"
                className={`text-center ${timeRange === range.id ? 'text-white' : 'text-muted'}`}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Revenue & Orders */}
        <View className="flex-row gap-3 mb-4">
          {renderMetricCard(
            DollarSign,
            'Revenue',
            `K ${analytics.revenue.toLocaleString()}`,
            analytics.revenueChange,
            colors.success,
            `${colors.success}20`
          )}
          {renderMetricCard(
            ShoppingBag,
            'Orders',
            analytics.orders.toString(),
            analytics.ordersChange,
            colors.primary,
            `${colors.primary}20`
          )}
        </View>

        {/* Avg Order Value & Acceptance Rate */}
        <View className="flex-row gap-3 mb-4">
          {renderMetricCard(
            Package,
            'Avg Order',
            `K ${analytics.avgOrderValue.toFixed(2)}`,
            analytics.avgOrderValueChange,
            '#f59e0b',
            '#fef3c720'
          )}
          {renderMetricCard(
            Users,
            'Acceptance',
            `${analytics.acceptanceRate}%`,
            analytics.acceptanceRateChange,
            '#8b5cf6',
            '#ede9fe20'
          )}
        </View>

        {/* Avg Prep Time & Rating */}
        <View className="flex-row gap-3 mb-4">
          {renderMetricCard(
            Clock,
            'Avg Prep Time',
            `${analytics.avgPrepTime} min`,
            analytics.avgPrepTimeChange,
            colors.primary,
            `${colors.primary}20`
          )}
          {renderMetricCard(
            Star,
            'Rating',
            analytics.rating.toFixed(1),
            analytics.ratingChange,
            '#fbbf24',
            '#fef3c720'
          )}
        </View>

        {/* Popular Items */}
        <Card className="p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="h4" weight="bold">Popular Items</Text>
            <TouchableOpacity onPress={() => router.push('/(vendor)/(tabs)/products')}>
              <Text variant="bodySmall" weight="bold" className="text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          {analytics.popularItems.map((item, index) => (
            <View
              key={item.id}
              className={`flex-row items-center py-3 ${
                index < analytics.popularItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Text variant="bodySmall" weight="bold" className="text-primary">
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="body" weight="medium">{item.name}</Text>
                <Text variant="bodySmall" color="muted">{item.orders} orders</Text>
              </View>
              <Text variant="body" weight="bold" className="text-success">
                K {item.revenue.toLocaleString()}
              </Text>
            </View>
          ))}
        </Card>

        {/* Order Volume Chart */}
        <Card className="p-4 mb-4">
          <Text variant="h4" weight="bold" className="mb-4">
            Order Volume
          </Text>
          <View className="flex-row items-end justify-between h-40">
            {(timeRange === 'day' ? analytics.hourlyOrders : 
              timeRange === 'week' ? analytics.dailyOrders : 
              analytics.weeklyOrders).map((value, index) => {
              const maxValue = Math.max(...(timeRange === 'day' ? analytics.hourlyOrders : 
                timeRange === 'week' ? analytics.dailyOrders : analytics.weeklyOrders));
              const height = (value / maxValue) * 100;
              
              return (
                <View key={index} className="flex-1 items-center">
                  <View
                    className="w-full mx-1 bg-primary rounded-t-lg"
                    style={{ height: `${height}%`, minHeight: 4 }}
                  />
                  <Text variant="bodySmall" color="muted" className="mt-2">
                    {timeRange === 'day' 
                      ? `${index * 2}h`
                      : timeRange === 'week'
                      ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]
                      : `W${index + 1}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 mb-6">
          <Text variant="h4" weight="bold" className="mb-3">Quick Actions</Text>
          
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-border"
            onPress={() => router.push('/(vendor)/(tabs)/orders')}
          >
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
              <ShoppingBag size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text variant="body" weight="medium">View All Orders</Text>
              <Text variant="bodySmall" color="muted">Manage incoming orders</Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => router.push('/(vendor)/(tabs)/products')}
          >
            <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center mr-3">
              <Package size={20} color={colors.success} />
            </View>
            <View className="flex-1">
              <Text variant="body" weight="medium">Manage Products</Text>
              <Text variant="bodySmall" color="muted">Add or edit menu items</Text>
            </View>
            <ChevronRight size={20} color={colors.muted} />
          </TouchableOpacity>
        </Card>

        <View className="h-24" />
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

