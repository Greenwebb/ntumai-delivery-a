// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

/**
 * VendorWalletScreen - Blueprint Compliant
 * 
 * Shows:
 * - Total Sales (gross amount before commission)
 * - Available Balance (net after commission deduction)
 * - Commission deducted silently in background
 * - Vendors never see delivery fees (tasker handles that)
 */

import { useState } from 'react';
import { View, ScrollView, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';

// Mock wallet data - will be replaced with real API
const MOCK_WALLET = { totalSales: 2450, // Gross sales
  availableBalance: 2082.50, // Net after 15% commission
  pendingBalance: 320,
  withdrawnThisMonth: 1500,
  commissionRate: 0.15, // 15% - hidden from vendor 
      };
  const MOCK_TRANSACTIONS = [
  { id: '1',
    type: 'sale',
    orderNumber: 'NTM-2026-001234',
    amount: 150, // Gross sale amount shown
    date: '2026-01-01',
    time: '10:30 AM',
    items: 3,
    customer: 'John D.'},
  { id: '2',
    type: 'sale',
    orderNumber: 'NTM-2026-001233',
    amount: 85,
    date: '2026-01-01',
    time: '09:15 AM',
    items: 2,
    customer: 'Sarah M.'},
  { id: '3',
    type: 'withdrawal',
    amount: 500,
    date: '2025-12-31',
    time: '02:00 PM',
    method: 'MTN Mobile Money'},
  { id: '4',
    type: 'sale',
    orderNumber: 'NTM-2026-001230',
    amount: 220,
    date: '2025-12-31',
    time: '11:45 AM',
    items: 5,
    customer: 'Mike K.'},
  { id: '5',
    type: 'sale',
    orderNumber: 'NTM-2026-001228',
    amount: 95,
    date: '2025-12-30',
    time: '04:20 PM',
    items: 2,
    customer: 'Grace N.'},
];

export default function VendorWalletScreen() { const router = useRouter();
  const colors = useColors();
  const [wallet] = useState(MOCK_WALLET);
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [filter, setFilter] = useState<'all' | 'sales' | 'withdrawals'>('all');
  const filteredTransactions = transactions.filter(t =>  {
    if (filter === 'all') return true;
    if (filter === 'sales') return t.type === 'sale';
    if (filter === 'withdrawals') return t.type === 'withdrawal';
    return true; });
  const handleWithdraw = () => { // Navigate to withdrawal screen
    router.push('/(vendor)/WithdrawScreen'); };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 bg-surface">
        {/* Header */}
        <View className="bg-background px-6 py-4 border-b border-border flex-row items-center">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mr-4">
            <Feather name="chevron-left" size={24} color="#1F2937" />
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">Wallet</Text>
        </View>

        {/* Balance Cards */}
        <View className="px-6 py-6">
          {/* Available Balance - Primary Card */}
          <View className="bg-primary rounded-2xl p-6 mb-4">
            <Text className="text-white/80 text-sm mb-1">Available Balance</Text>
            <Text className="text-white text-4xl font-bold mb-4">
              K{wallet.availableBalance.toLocaleString()}
            </Text>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleWithdraw}
              className="bg-background rounded-lg py-3 px-6 self-start"
            >
              <Text className="text-primary font-bold">Withdraw Funds</Text>
            </Pressable>
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-3">
            {/* Total Sales - Gross */}
            <View className="flex-1 bg-background rounded-xl p-4 border border-border">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-2">
                  <Feather name="trending-up" size={16} color="#16A34A" />
                </View>
                <Text className="text-muted text-sm">Total Sales</Text>
              </View>
              <Text className="text-foreground text-xl font-bold">
                K{wallet.totalSales.toLocaleString()}
              </Text>
            </View>

            {/* Pending */}
            <View className="flex-1 bg-background rounded-xl p-4 border border-border">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-yellow-100 rounded-full items-center justify-center mr-2">
                  <Feather name="clock" size={16} color="#CA8A04" />
                </View>
                <Text className="text-muted text-sm">Pending</Text>
              </View>
              <Text className="text-foreground text-xl font-bold">
                K{wallet.pendingBalance.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Withdrawn This Month */}
          <View className="bg-background rounded-xl p-4 border border-border mt-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Feather name="download" size={16} color="#2563EB" />
                </View>
                <View>
                  <Text className="text-muted text-sm">Withdrawn This Month</Text>
                  <Text className="text-foreground text-lg font-bold">
                    K{wallet.withdrawnThisMonth.toLocaleString()}
                  </Text>
                </View>
              </View>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(vendor)/WithdrawalHistory')}>
                <Text className="text-primary font-semibold">History</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-foreground">Recent Activity</Text>
          </View>

          {/* Filter Tabs */}
          <View className="flex-row bg-surface rounded-lg p-1 mb-4">
            {(['all', 'sales', 'withdrawals'] as const).map((tab) => (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={tab}
                onPress={() => setFilter(tab)}
                className={`flex-1 py-2 rounded-md ${filter === tab ? 'bg-background' : ''}`}
              >
                <Text
                  className={`text-center font-semibold capitalize ${ filter === tab ? 'text-foreground' : 'text-muted' }`}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Transactions List */}
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="bg-background rounded-xl p-4 mb-3 border border-border">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${ item.type === 'sale' ? 'bg-green-100' : 'bg-blue-100' }`}
                    >
                      <Feather
                        name={item.type === 'sale' ? 'shopping-bag' : 'arrow-down-circle'}
                        size={20}
                        color={item.type === 'sale' ? '#16A34A' : '#2563EB'}
                      />
                    </View>
                    <View className="flex-1">
                      {item.type === 'sale' ? (
                        <>
                          <Text className="text-foreground font-semibold">
                            {item.orderNumber}
                          </Text>
                          <Text className="text-muted text-sm">
                            {item.items} items • {item.customer}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text className="text-foreground font-semibold">Withdrawal</Text>
                          <Text className="text-muted text-sm">{item.method}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`font-bold text-lg ${ item.type === 'sale' ? 'text-primary' : 'text-blue-600' }`}
                    >
                      {item.type === 'sale' ? '+' : '-'}K{item.amount}
                    </Text>
                    <Text className="text-muted text-xs">{item.time}</Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={ <View className="py-8 items-center">
                <Feather name="inbox" size={48} color="#D1D5DB" />
                <Text className="text-muted mt-2">No transactions yet</Text>
              </View> }
          />
        </View>

        {/* Info Note - Blueprint compliant */}
        <View className="px-6 pb-8">
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <View className="flex-row items-start">
              <Feather name="info" size={20} color="#2563EB" />
              <View className="ml-3 flex-1">
                <Text className="text-blue-900 font-semibold mb-1">How it works</Text>
                <Text className="text-blue-800 text-sm">
                  Your available balance is updated after each completed order. 
                  Funds are typically available for withdrawal within 24 hours.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

