// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Dimensions, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
  const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeRange = 'today' | 'week' | 'month' | 'year';

interface SalesData { label: string;
  value: number;
  percentage: number; }

interface ProductStat { id: string;
  name: string;
  sold: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable'; }

// Mock analytics data
const MOCK_STATS = { today: { revenue: 2450,
    orders: 18,
    avgOrderValue: 136,
    newCustomers: 5,
    revenueChange: 12,
    ordersChange: 8},
  week: { revenue: 15680,
    orders: 124,
    avgOrderValue: 126,
    newCustomers: 32,
    revenueChange: 15,
    ordersChange: 10},
  month: { revenue: 58420,
    orders: 478,
    avgOrderValue: 122,
    newCustomers: 145,
    revenueChange: 22,
    ordersChange: 18},
  year: { revenue: 684500,
    orders: 5420,
    avgOrderValue: 126,
    newCustomers: 1850,
    revenueChange: 35,
    ordersChange: 28}};
  const MOCK_CHART_DATA: Record<TimeRange, SalesData[]> = { today: [
    { label: '6AM', value: 120, percentage: 8 },
    { label: '9AM', value: 350, percentage: 23 },
    { label: '12PM', value: 580, percentage: 38 },
    { label: '3PM', value: 420, percentage: 28 },
    { label: '6PM', value: 680, percentage: 45 },
    { label: '9PM', value: 300, percentage: 20 },
  ],
  week: [
    { label: 'Mon', value: 1850, percentage: 65 },
    { label: 'Tue', value: 2100, percentage: 74 },
    { label: 'Wed', value: 1950, percentage: 69 },
    { label: 'Thu', value: 2450, percentage: 86 },
    { label: 'Fri', value: 2850, percentage: 100 },
    { label: 'Sat', value: 2680, percentage: 94 },
    { label: 'Sun', value: 1800, percentage: 63 },
  ],
  month: [
    { label: 'W1', value: 12500, percentage: 72 },
    { label: 'W2', value: 14200, percentage: 82 },
    { label: 'W3', value: 15800, percentage: 91 },
    { label: 'W4', value: 15920, percentage: 92 },
  ],
  year: [
    { label: 'Jan', value: 48000, percentage: 70 },
    { label: 'Feb', value: 52000, percentage: 76 },
    { label: 'Mar', value: 58000, percentage: 85 },
    { label: 'Apr', value: 55000, percentage: 80 },
    { label: 'May', value: 62000, percentage: 91 },
    { label: 'Jun', value: 68500, percentage: 100 },
  ]};
  const MOCK_TOP_PRODUCTS: ProductStat[] = [
  { id: 'prod-001', name: 'Nshima with Chicken', sold: 156, revenue: 10140, trend: 'up' },
  { id: 'prod-002', name: 'Beef Stew', sold: 124, revenue: 6820, trend: 'up' },
  { id: 'prod-003', name: 'Kapenta with Rice', sold: 98, revenue: 4410, trend: 'stable' },
  { id: 'prod-004', name: 'Vitumbuwa', sold: 245, revenue: 3675, trend: 'up' },
  { id: 'prod-005', name: 'Maheu', sold: 312, revenue: 3120, trend: 'down' },
];

export default function VendorAnalyticsScreen() { const router = useRouter();
  const colors = useColors();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const stats = MOCK_STATS[timeRange];
  const chartData = MOCK_CHART_DATA[timeRange];
  const formatCurrency = (amount: number) =>  {
    if (amount >= 1000) { return `K${(amount / 1000).toFixed(1)}k`; }
    return `K${amount}`; };
  const renderTimeRangeTabs = () => (
    <View className="flex-row px-4 py-3 gap-2">
      {(['today', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={range}
          onPress={() => setTimeRange(range)}
          className={`flex-1 py-2 rounded-lg ${timeRange === range ? 'bg-primary' : 'bg-surface border border-border'}`}
        >
          <Text className={`text-center text-sm font-medium capitalize ${timeRange === range ? 'text-white' : 'text-muted'}`}>
            {range}
          </Text>
        </Pressable>
      ))}
    </View>
  );
  const renderStatCard = (
    title: string,
    value: string,
    change: number,
    icon: string,
    color: string
  ) => (
    <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
      <View className="flex-row items-center justify-between mb-2">
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Feather name={icon} size={16} color={color} />
        </View>
        <View className={`flex-row items-center px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-success/10' : 'bg-error/10'}`}>
          <Feather name={change >= 0 ? 'trending-up' : 'trending-down'} size={12} color={change >= 0 ? '#22C55E' : '#EF4444'} />
          <Text className={`text-xs font-medium ml-1 ${change >= 0 ? 'text-success' : 'text-error'}`}>
            {Math.abs(change)}%
          </Text>
        </View>
      </View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted mt-1">{title}</Text>
    </View>
  );
  const renderBarChart = () => { const maxValue = Math.max(...chartData.map(d => d.value));
  const barWidth = (SCREEN_WIDTH - 64) / chartData.length - 8;

    return (
      <View className="bg-surface rounded-xl p-4 mx-4 border border-border">
        <Text className="text-base font-semibold text-foreground mb-4">Revenue Trend</Text>
        
        {/* Chart */}
        <View className="h-40 flex-row items-end justify-between">
          {chartData.map((data, index) => (
            <View key={index} className="items-center" style={{ width: barWidth }}>
              {/* Bar */}
              <View
                className="bg-primary rounded-t-lg"
                style={{ width: barWidth - 4,
                  height: `${data.percentage}%`,
                  minHeight: 4}}
              />
              {/* Label */}
              <Text className="text-xs text-muted mt-2">{data.label}</Text>
            </View>
          ))}
        </View>

        {/* Legend */}
        <View className="flex-row items-center justify-center mt-4 pt-3 border-t border-border">
          <View className="w-3 h-3 rounded bg-primary mr-2" />
          <Text className="text-sm text-muted">Revenue (ZMW)</Text>
        </View>
      </View>
    ); };
  const renderTopProducts = () => (
    <View className="mx-4 mt-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-foreground">Top Products</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(vendor)/VendorProductsScreen')}>
          <Text className="text-sm text-primary">View All</Text>
        </Pressable>
      </View>

      <View className="bg-surface rounded-xl border border-border overflow-hidden">
        {MOCK_TOP_PRODUCTS.map((product, index) => (
          <View
            key={product.id}
            className={`flex-row items-center p-3 ${index < MOCK_TOP_PRODUCTS.length - 1 ? 'border-b border-border' : ''}`}
          >
            {/* Rank */}
            <View className={`w-6 h-6 rounded-full items-center justify-center ${index < 3 ? 'bg-primary' : 'bg-muted/20'}`}>
              <Text className={`text-xs font-bold ${index < 3 ? 'text-white' : 'text-muted'}`}>
                {index + 1}
              </Text>
            </View>

            {/* Product Info */}
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                {product.name}
              </Text>
              <Text className="text-xs text-muted">{product.sold} sold</Text>
            </View>

            {/* Revenue & Trend */}
            <View className="items-end">
              <Text className="text-sm font-semibold text-foreground">
                K{product.revenue.toLocaleString()}
              </Text>
              <Feather
                name={product.trend === 'up' ? 'trending-up' : product.trend === 'down' ? 'trending-down' : 'minus'}
                size={14}
                color={product.trend === 'up' ? '#22C55E' : product.trend === 'down' ? '#EF4444' : '#9CA3AF'}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
  const renderQuickActions = () => (
    <View className="mx-4 mt-4 mb-6">
      <Text className="text-base font-semibold text-foreground mb-3">Quick Actions</Text>
      <View className="flex-row gap-3">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="flex-1 bg-primary/10 rounded-xl p-4 items-center">
          <Feather name="download" size={24} color="#009688" />
          <Text className="text-sm font-medium text-primary mt-2">Export Report</Text>
        </Pressable>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="flex-1 bg-warning/10 rounded-xl p-4 items-center">
          <Feather name="tag" size={24} color="#F59E0B" />
          <Text className="text-sm font-medium text-warning mt-2">Create Promo</Text>
        </Pressable>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="flex-1 bg-success/10 rounded-xl p-4 items-center">
          <Feather name="plus-circle" size={24} color="#22C55E" />
          <Text className="text-sm font-medium text-success mt-2">Add Product</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Analytics</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="p-2 -mr-2">
          <Feather name="calendar" size={24} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Time Range Tabs */}
        {renderTimeRangeTabs()}

        {/* Stats Grid */}
        <View className="px-4 gap-3">
          <View className="flex-row gap-3">
            {renderStatCard('Revenue', formatCurrency(stats.revenue), stats.revenueChange, 'dollar-sign', '#009688')}
            {renderStatCard('Orders', stats.orders.toString(), stats.ordersChange, 'shopping-bag', '#F59E0B')}
          </View>
          <View className="flex-row gap-3">
            {renderStatCard('Avg Order', `K${stats.avgOrderValue}`, 5, 'bar-chart-2', '#8B5CF6')}
            {renderStatCard('New Customers', stats.newCustomers.toString(), 12, 'users', '#22C55E')}
          </View>
        </View>

        {/* Revenue Chart */}
        <View className="mt-4">
          {renderBarChart()}
        </View>

        {/* Top Products */}
        {renderTopProducts()}

        {/* Quick Actions */}
        {renderQuickActions()}
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

