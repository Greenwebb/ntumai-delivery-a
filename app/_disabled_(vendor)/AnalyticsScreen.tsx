// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { useState } from 'react';

import { View, ScrollView, FlatList, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { Feather } from '@expo/vector-icons';

export default function AnalyticsScreen() { const router = useRouter();
  const colors = useColors();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const analyticsData = { day: { revenue: 450,

      orders: 12,

      customers: 8,

      avgOrderValue: 37.5},

    week: { revenue: 2850,

      orders: 95,

      customers: 62,

      avgOrderValue: 30},

    month: { revenue: 12500,

      orders: 420,

      customers: 280,

      avgOrderValue: 29.8}};
  const topProducts = [

    { id: '1', name: 'Burger Deluxe', sales: 245, revenue: 6125 },

    { id: '2', name: 'Fried Chicken', sales: 189, revenue: 3780 },

    { id: '3', name: 'Pizza Margherita', sales: 312, revenue: 9360 },

  ];
  const data = analyticsData[selectedPeriod];

  return (

    <View className="flex-1 bg-background">

      {/* Header */}

      <View className="px-6 py-4 border-b border-border flex-row items-center">

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mr-4">

          <Feather name="chevron-left" size={24} color="#1F2937" />

        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Analytics</Text>

      </View>

      <ScrollView className="flex-1">

        {/* Period Selector */}

        <View className="px-6 py-6">

          <View className="flex-row gap-3">

            {['day', 'week', 'month'].map(period => (

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={period}

                onPress={() => setSelectedPeriod(period as any)}

                className={`flex-1 rounded-lg py-3 ${ selectedPeriod === period ? 'bg-primary' : 'bg-surface' }`}

              >

                <Text className={`text-center font-bold capitalize ${ selectedPeriod === period ? 'text-white' : 'text-gray-700' }`}>

                  {period}

                </Text>

              </Pressable>

            ))}

          </View>

        </View>

        {/* Key Metrics */}

        <View className="px-6 py-6">

          <Text className="text-lg font-bold text-foreground mb-4">Key Metrics</Text>

          <View className="gap-3">

            {/* Revenue */}

            <View className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4">

              <View className="flex-row items-center justify-between">

                <View>

                  <Text className="text-green-100 text-sm mb-1">Revenue</Text>

                  <Text className="text-3xl font-bold text-white">{data.revenue}K</Text>

                </View>

                <View className="w-12 h-12 bg-background/20 rounded-full items-center justify-center">

                  <Feather name="trending-up" size={24} color="white" />

                </View>

              </View>

            </View>

            {/* Orders */}

            <View className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4">

              <View className="flex-row items-center justify-between">

                <View>

                  <Text className="text-blue-100 text-sm mb-1">Orders</Text>

                  <Text className="text-3xl font-bold text-white">{data.orders}</Text>

                </View>

                <View className="w-12 h-12 bg-background/20 rounded-full items-center justify-center">

                  <Feather name="shopping-bag" size={24} color="white" />

                </View>

              </View>

            </View>

            {/* Customers */}

            <View className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4">

              <View className="flex-row items-center justify-between">

                <View>

                  <Text className="text-purple-100 text-sm mb-1">Customers</Text>

                  <Text className="text-3xl font-bold text-white">{data.customers}</Text>

                </View>

                <View className="w-12 h-12 bg-background/20 rounded-full items-center justify-center">

                  <Feather name="users" size={24} color="white" />

                </View>

              </View>

            </View>

            {/* Avg Order Value */}

            <View className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-4">

              <View className="flex-row items-center justify-between">

                <View>

                  <Text className="text-orange-100 text-sm mb-1">Avg Order Value</Text>

                  <Text className="text-3xl font-bold text-white">{data.avgOrderValue}K</Text>

                </View>

                <View className="w-12 h-12 bg-background/20 rounded-full items-center justify-center">

                  <Feather name="dollar-sign" size={24} color="white" />

                </View>

              </View>

            </View>

          </View>

        </View>

        {/* Top Products */}

        <View className="px-6 py-6">

          <Text className="text-lg font-bold text-foreground mb-4">Top Products</Text>

          <FlatList

            data={topProducts}

            keyExtractor={(item) => item.id}

            scrollEnabled={false}

            renderItem={({ item, index }) => (

              <View className="flex-row items-center justify-between py-4 border-b border-gray-100">

                <View className="flex-row items-center flex-1">

                  <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">

                    <Text className="text-green-700 font-bold text-sm">{index + 1}</Text>

                  </View>

                  <View className="flex-1">

                    <Text className="text-foreground font-semibold">{item.name}</Text>

                    <Text className="text-muted text-xs">{item.sales} sales</Text>

                  </View>

                </View>

                <View className="items-end">

                  <Text className="text-lg font-bold text-primary">{item.revenue}K</Text>

                  <Text className="text-muted text-xs">revenue</Text>

                </View>

              </View>

            )}

          />

        </View>

        {/* Performance Insights */}

        <View className="px-6 py-6">

          <Text className="text-lg font-bold text-foreground mb-4">Insights</Text>

          <View className="gap-3">

            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-row items-start">

              <Feather name="info" size={20} color="#2563EB" className="mr-3 mt-1" />

              <View className="flex-1">

                <Text className="text-blue-900 font-bold">Peak Hours</Text>

                <Text className="text-blue-800 text-sm mt-1">

                  Most orders come between 12-2 PM and 6-8 PM

                </Text>

              </View>

            </View>

            <View className="bg-green-50 border border-green-200 rounded-lg p-4 flex-row items-start">

              <Feather name="trending-up" size={20} color="#16A34A" className="mr-3 mt-1" />

              <View className="flex-1">

                <Text className="text-green-900 font-bold">Growth</Text>

                <Text className="text-green-800 text-sm mt-1">

                  Revenue increased by 15% compared to last week

                </Text>

              </View>

            </View>

            <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex-row items-start">

              <Feather name="alert-circle" size={20} color="#EA580C" className="mr-3 mt-1" />

              <View className="flex-1">

                <Text className="text-orange-900 font-bold">Recommendation</Text>

                <Text className="text-orange-800 text-sm mt-1">

                  Increase stock for Pizza Margherita - highest demand item

                </Text>

              </View>

            </View>

          </View>

        </View>

      </ScrollView>

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

