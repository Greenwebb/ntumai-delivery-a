// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { useEffect, useState } from 'react';

import { View, ScrollView, FlatList, Pressable, RefreshControl } from 'react-native';

import { useRouter } from 'expo-router';

import { useAuthStore, useTaskerStore } from '@/src/store';

import { Feather } from '@expo/vector-icons';

type Period = 'today' | 'week' | 'month';

export default function EarningsScreen() { const router = useRouter();
  const colors = useColors();
  const { user } = useAuthStore();
  const { earnings, fetchEarnings, isLoading } = useTaskerStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchEarnings(user.id);
    }
    setRefreshing(false);
  };
  const [transactions, setTransactions] = useState<any[]>([

    { id: '1',

      type: 'earning',

      amount: 45,

      description: 'Food delivery - Order #1234',

      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),

      status: 'completed'},

    { id: '2',

      type: 'earning',

      amount: 30,

      description: 'Package delivery',

      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),

      status: 'completed'},

    { id: '3',

      type: 'earning',

      amount: 25,

      description: 'Shopping task',

      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),

      status: 'completed'},

  ]);

  useEffect(() =>  {
    if (user?.id) { fetchEarnings(user.id, selectedPeriod); } }, [user, selectedPeriod]);
  const currentEarning = earnings[selectedPeriod];

  return (

    <View className="flex-1 bg-background">

      {/* Header */}

      <View className="px-6 py-4 border-b border-border flex-row items-center">

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mr-4">

          <Feather name="chevron-left" size={24} color="#1F2937" />

        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Earnings</Text>

      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >

        {/* Period Selector */}

        <View className="px-6 py-6">

          <View className="flex-row gap-3">

            {[

              { id: 'today', label: 'Today' },

              { id: 'week', label: 'This Week' },

              { id: 'month', label: 'This Month' },

            ].map(period => (

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={period.id}

                onPress={() => setSelectedPeriod(period.id as Period)}

                className={`flex-1 rounded-lg py-3 ${ selectedPeriod === period.id

                    ? 'bg-primary'

                    : 'bg-surface' }`}

              >

                <Text className={`text-center font-bold ${ selectedPeriod === period.id ? 'text-white' : 'text-gray-700' }`}>

                  {period.label}

                </Text>

              </Pressable>

            ))}

          </View>

        </View>

        {/* Earnings Card */}

        <View className="px-6 py-6">

          <View className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8">

            <Text className="text-green-100 text-sm mb-2">Total Earnings</Text>

            <Text className="text-5xl font-bold text-white mb-6">{currentEarning}K</Text>

            <View className="flex-row items-center justify-between pt-6 border-t border-green-500">

              <View>

                <Text className="text-green-100 text-xs mb-1">Completed Jobs</Text>

                <Text className="text-white font-bold text-lg">12</Text>

              </View>

              <View>

                <Text className="text-green-100 text-xs mb-1">Avg per Job</Text>

                <Text className="text-white font-bold text-lg">{Math.round(currentEarning / 12)}K</Text>

              </View>

              <View>

                <Text className="text-green-100 text-xs mb-1">Rating</Text>

                <View className="flex-row items-center">

                  <Feather name="star" size={16} color="#FCD34D" fill="#FCD34D" />

                  <Text className="text-white font-bold text-lg ml-1">4.8</Text>

                </View>

              </View>

            </View>

          </View>

        </View>

        {/* Breakdown */}

        <View className="px-6 py-6 border-b border-border">

          <Text className="text-lg font-bold text-foreground mb-4">Breakdown</Text>

          <View className="gap-3">

            <View className="flex-row items-center justify-between">

              <View className="flex-row items-center">

                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">

                  <Feather name="package" size={16} color="#2563EB" />

                </View>

                <View>

                  <Text className="text-foreground font-semibold">Deliveries</Text>

                  <Text className="text-muted text-xs">8 completed</Text>

                </View>

              </View>

              <Text className="text-2xl font-bold text-foreground">280K</Text>

            </View>

            <View className="flex-row items-center justify-between">

              <View className="flex-row items-center">

                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">

                  <Feather name="check-square" size={16} color="#7C3AED" />

                </View>

                <View>

                  <Text className="text-foreground font-semibold">Tasks</Text>

                  <Text className="text-muted text-xs">4 completed</Text>

                </View>

              </View>

              <Text className="text-2xl font-bold text-foreground">80K</Text>

            </View>

          </View>

        </View>

        {/* Recent Transactions */}

        <View className="px-6 py-6">

          <Text className="text-lg font-bold text-foreground mb-4">Recent Transactions</Text>

          {isLoading ? (

            <ActivityIndicator color="#16A34A" />

          ) : (

            <FlatList

              data={transactions}

              keyExtractor={(item) => item.id}

              scrollEnabled={false}

              renderItem={({ item }) => (

                <View className="flex-row items-center justify-between py-4 border-b border-gray-100">

                  <View className="flex-row items-center flex-1">

                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${ item.type === 'earning' ? 'bg-green-100' : 'bg-red-100' }`}>

                      <Feather

                        name={item.type === 'earning' ? 'arrow-down-left' : 'arrow-up-right'}

                        size={16}

                        color={item.type === 'earning' ? '#16A34A' : '#EF4444'}

                      />

                    </View>

                    <View className="flex-1">

                      <Text className="text-foreground font-semibold">{item.description}</Text>

                      <Text className="text-muted text-xs">

                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                      </Text>

                    </View>

                  </View>

                  <Text className={`text-lg font-bold ${ item.type === 'earning' ? 'text-primary' : 'text-error' }`}>

                    {item.type === 'earning' ? '+' : '-'}{item.amount}K

                  </Text>

                </View>

              )}

            />

          )}

        </View>

      </ScrollView>

      {/* Withdrawal Button */}

      <View className="px-6 py-6 border-t border-border">

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-primary rounded-lg py-4">

          <Text className="text-white text-center font-bold text-lg">Withdraw Earnings</Text>

        </Pressable>

      </View>

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

