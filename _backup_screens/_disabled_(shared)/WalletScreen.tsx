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

import { useWalletStore } from '@/src/store';

import { Feather } from '@expo/vector-icons';

export default function WalletScreen() { const router = useRouter();
  const colors = useColors();
  const { balance, transactions } = useWalletStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const filteredTransactions = transactions.filter(t =>  {
    if (selectedFilter === 'all') return true;

    return selectedFilter === 'credit' ? t.amount > 0 : t.amount < 0; });

  return (

    <View className="flex-1 bg-background">

      {/* Header */}

      <View className="px-6 py-4 border-b border-border flex-row items-center">

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mr-4">

          <Feather name="chevron-left" size={24} color="#1F2937" />

        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Wallet</Text>

      </View>

      <ScrollView className="flex-1">

        {/* Balance Card */}

        <View className="px-6 py-8">

          <View className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 mb-6">

            <Text className="text-green-100 text-sm mb-2">Available Balance</Text>

            <Text className="text-5xl font-bold text-white mb-8">{balance}K</Text>

            <View className="flex-row items-center justify-between pt-6 border-t border-green-500">

              <View>

                <Text className="text-green-100 text-xs mb-1">Pending</Text>

                <Text className="text-white font-bold">0K</Text>

              </View>

              <View>

                <Text className="text-green-100 text-xs mb-1">Total Earned</Text>

                <Text className="text-white font-bold">12,500K</Text>

              </View>

              <View>

                <Text className="text-green-100 text-xs mb-1">Total Spent</Text>

                <Text className="text-white font-bold">8,200K</Text>

              </View>

            </View>

          </View>

          {/* Action Buttons */}

          <View className="flex-row gap-3">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="flex-1 bg-primary rounded-lg py-4">

              <View className="flex-row items-center justify-center">

                <Feather name="plus-circle" size={20} color="white" />

                <Text className="text-white font-bold ml-2">Add Money</Text>

              </View>

            </Pressable>

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="flex-1 bg-blue-600 rounded-lg py-4">

              <View className="flex-row items-center justify-center">

                <Feather name="send" size={20} color="white" />

                <Text className="text-white font-bold ml-2">Send Money</Text>

              </View>

            </Pressable>

          </View>

        </View>

        {/* Transaction Filters */}

        <View className="px-6 py-4 border-t border-border">

          <View className="flex-row gap-2">

            {['all', 'credit', 'debit'].map(filter => (

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={filter}

                onPress={() => setSelectedFilter(filter as any)}

                className={`px-4 py-2 rounded-full ${ selectedFilter === filter ? 'bg-primary' : 'bg-surface' }`}

              >

                <Text className={`font-semibold capitalize ${ selectedFilter === filter ? 'text-white' : 'text-gray-700' }`}>

                  {filter}

                </Text>

              </Pressable>

            ))}

          </View>

        </View>

        {/* Transactions List */}

        <View className="px-6 py-6">

          <Text className="text-lg font-bold text-foreground mb-4">Recent Transactions</Text>

          <FlatList

            data={filteredTransactions}

            keyExtractor={(item) => item.id}

            scrollEnabled={false}

            renderItem={({ item }) => { const isCredit = item.amount > 0;

              return (

                <View className="flex-row items-center justify-between py-4 border-b border-gray-100">

                  <View className="flex-row items-center flex-1">

                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${ isCredit ? 'bg-green-100' : 'bg-red-100' }`}>

                      <Feather

                        name={isCredit ? 'arrow-down-left' : 'arrow-up-right'}

                        size={20}

                        color={isCredit ? '#16A34A' : '#EF4444'}

                      />

                    </View>

                    <View className="flex-1">

                      <Text className="text-foreground font-semibold">{item.description}</Text>

                      <Text className="text-muted text-xs mt-1">

                        {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                      </Text>

                    </View>

                  </View>

                  <View className="items-end">

                    <Text className={`text-lg font-bold ${ isCredit ? 'text-primary' : 'text-error' }`}>

                      {isCredit ? '+' : ''}{item.amount}K

                    </Text>

                    <Text className={`text-xs font-semibold ${ item.status === 'completed' ? 'text-primary' : 'text-yellow-600' }`}>

                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}

                    </Text>

                  </View>

                </View>

              ); }}

          />

        </View>

      </ScrollView>

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

