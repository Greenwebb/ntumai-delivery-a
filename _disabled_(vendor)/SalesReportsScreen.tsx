// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, OutlineButton } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { LoadingState } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Platform, Pressable, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
}

interface ProductSales {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  profit: number;
}

const MOCK_SALES_DATA: SalesData[] = [
  { period: 'Mon', revenue: 1250, orders: 42, customers: 35, avgOrderValue: 29.76 },
  { period: 'Tue', revenue: 1580, orders: 53, customers: 44, avgOrderValue: 29.81 },
  { period: 'Wed', revenue: 1420, orders: 48, customers: 39, avgOrderValue: 29.58 },
  { period: 'Thu', revenue: 1680, orders: 56, customers: 47, avgOrderValue: 30.00 },
  { period: 'Fri', revenue: 2100, orders: 71, customers: 59, avgOrderValue: 29.58 },
  { period: 'Sat', revenue: 2450, orders: 82, customers: 68, avgOrderValue: 29.88 },
  { period: 'Sun', revenue: 1920, orders: 64, customers: 53, avgOrderValue: 30.00 },
];

const MOCK_PRODUCT_SALES: ProductSales[] = [
  { id: '1', name: 'Burger Deluxe', category: 'Fast Food', unitsSold: 245, revenue: 6125, profit: 2450 },
  { id: '2', name: 'Pizza Margherita', category: 'Italian', unitsSold: 312, revenue: 9360, profit: 3744 },
  { id: '3', name: 'Fried Chicken', category: 'Fast Food', unitsSold: 189, revenue: 3780, profit: 1512 },
  { id: '4', name: 'Pasta Carbonara', category: 'Italian', unitsSold: 156, revenue: 4680, profit: 1872 },
  { id: '5', name: 'Caesar Salad', category: 'Salads', unitsSold: 98, revenue: 1470, profit: 588 },
];

export default function SalesReportsScreen() {
  const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [salesData, setSalesData] = useState(MOCK_SALES_DATA);
  const [productSales, setProductSales] = useState(MOCK_PRODUCT_SALES);

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const totalCustomers = salesData.reduce((sum, item) => sum + item.customers, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const maxRevenue = Math.max(...salesData.map(d => d.revenue));

  const handleExportReport = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setLoading(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = () => (
    <View className="gap-3">
      {salesData.map((item, index) => {
        const barHeight = (item.revenue / maxRevenue) * 150;
        return (
          <View key={index} className="flex-row items-end gap-3">
            <Text className="text-sm font-medium w-12">{item.period}</Text>
            <View className="flex-1 flex-row items-end gap-2">
              <View
                className="rounded-t-lg"
                style={{
                  width: '100%',
                  height: barHeight,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
            <Text className="text-sm font-semibold w-16 text-right">
              K{item.revenue.toFixed(0)}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="mr-4"
          >
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-bold">Sales Reports</Text>
            <Text className="text-sm text-muted">Detailed analytics & insights</Text>
          </View>
          <OutlineButton onPress={handleExportReport} size="sm">
            <Feather name="download" size={16} color={colors.primary} />
          </OutlineButton>
        </View>

        {/* Period Selector */}
        <View className="flex-row gap-3 mb-6">
          {(['week', 'month', 'custom'] as const).map((period) => (
            <Pressable
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="flex-1"
            >
              <View
                className="py-3 rounded-xl items-center"
                style={{
                  backgroundColor: selectedPeriod === period ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="font-semibold capitalize"
                  style={{ color: selectedPeriod === period ? '#FFF' : colors.foreground }}
                >
                  {period}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Custom Date Range */}
        {selectedPeriod === 'custom' && (
          <View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: colors.surface }}>
            <Text className="font-semibold mb-3">Select Date Range</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Start Date"
                />
              </View>
              <View className="flex-1">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="End Date"
                />
              </View>
            </View>
          </View>
        )}

        {/* Summary Cards */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="flex-1 min-w-[45%] rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="dollar-sign" size={20} color={colors.success} />
              <Text className="text-sm text-muted">Total Revenue</Text>
            </View>
            <Text className="text-2xl font-bold">K{totalRevenue.toFixed(2)}</Text>
          </View>

          <View className="flex-1 min-w-[45%] rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="shopping-bag" size={20} color={colors.primary} />
              <Text className="text-sm text-muted">Total Orders</Text>
            </View>
            <Text className="text-2xl font-bold">{totalOrders}</Text>
          </View>

          <View className="flex-1 min-w-[45%] rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="users" size={20} color={colors.warning} />
              <Text className="text-sm text-muted">Customers</Text>
            </View>
            <Text className="text-2xl font-bold">{totalCustomers}</Text>
          </View>

          <View className="flex-1 min-w-[45%] rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="trending-up" size={20} color={colors.primary} />
              <Text className="text-sm text-muted">Avg Order Value</Text>
            </View>
            <Text className="text-2xl font-bold">K{avgOrderValue.toFixed(2)}</Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-semibold mb-4">Revenue Trend</Text>
          {renderBarChart()}
        </View>

        {/* Top Products */}
        <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-semibold mb-4">Top Products</Text>
          <View className="gap-4">
            {productSales.map((product, index) => (
              <View key={product.id} className="flex-row items-center gap-3">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <Text className="font-bold text-sm" style={{ color: colors.primary }}>
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold">{product.name}</Text>
                  <Text className="text-xs text-muted">{product.category}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-semibold">K{product.revenue.toFixed(0)}</Text>
                  <Text className="text-xs text-muted">{product.unitsSold} sold</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Product Performance Table */}
        <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-semibold mb-4">Product Performance</Text>
          <View className="gap-3">
            {/* Table Header */}
            <View className="flex-row pb-2 border-b" style={{ borderBottomColor: colors.border }}>
              <Text className="flex-1 text-xs font-semibold text-muted">Product</Text>
              <Text className="w-16 text-xs font-semibold text-muted text-right">Units</Text>
              <Text className="w-20 text-xs font-semibold text-muted text-right">Revenue</Text>
              <Text className="w-16 text-xs font-semibold text-muted text-right">Profit</Text>
            </View>

            {/* Table Rows */}
            {productSales.map((product) => (
              <View key={product.id} className="flex-row py-2">
                <View className="flex-1">
                  <Text className="font-medium">{product.name}</Text>
                  <Text className="text-xs text-muted">{product.category}</Text>
                </View>
                <Text className="w-16 text-sm text-right">{product.unitsSold}</Text>
                <Text className="w-20 text-sm text-right">K{product.revenue.toFixed(0)}</Text>
                <Text className="w-16 text-sm text-right" style={{ color: colors.success }}>
                  K{product.profit.toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

