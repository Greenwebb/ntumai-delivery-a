// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Platform, Pressable , ModalInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEarningsStore, EarningsTransaction, Payout } from '@/stores/earnings-store';
import { useToast } from '@/lib/toast-provider';

type TimeRange = 'today' | 'week' | 'month' | 'year';
  const PAYOUT_METHODS = [
  { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00' },
  { id: 'airtel', name: 'Airtel Money', color: '#FF0000' },
  { id: 'zamtel', name: 'Zamtel Kwacha', color: '#00A651' },
];

export default function TaskerEarningsScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const { transactions,
    payouts,
    summary,
    taxSummary,
    isLoading,
    loadEarnings,
    requestPayout} = useEarningsStore();

  useEffect(() => { loadEarnings(); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    await loadEarnings();
    setRefreshing(false); };
  const handleRequestPayout = async () => { const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 50) { toast.error('Minimum payout amount is K50');
      return; }
    if (amount > summary.availableBalance) { toast.error('Insufficient balance');
      return; }
    if (!selectedMethod || !accountNumber) { toast.error('Please select a method and enter account number');
      return; }

    try { const method = PAYOUT_METHODS.find(m => m.id === selectedMethod);
      await requestPayout(amount, method?.name || '', accountNumber);
      if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
      setShowPayoutModal(false);
      setPayoutAmount('');
      setSelectedMethod(null);
      setAccountNumber('');
      toast.success('Payout request submitted. You will receive it within 24 hours.'); } catch (error) { toast.error('Payout request failed. Please try again.'); } };
  const getEarningsByRange = () => { switch (selectedRange) { case 'today': return summary.today;
      case 'week': return summary.thisWeek;
      case 'month': return summary.thisMonth;
      case 'year': return summary.thisYear;
      default: return summary.thisWeek; } };
  const getTransactionIcon = (type: string) => { const icons: Record<string, string> = { delivery: 'truck',
      tip: 'heart',
      bonus: 'gift',
      sale: 'shopping-bag',
      commission: 'percent'};
    return icons[type] || 'circle'; };
  const getTransactionColor = (type: string) => { const colors: Record<string, string> = { delivery: '#009688',
      tip: '#EC4899',
      bonus: '#8B5CF6',
      sale: '#3B82F6',
      commission: '#F59E0B'};
    return colors[type] || '#6B7280'; };
  const renderTransaction = (transaction: EarningsTransaction) => (
    <View key={transaction.id} className="flex-row items-center py-3 border-b border-border">
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: `${getTransactionColor(transaction.type)}20` }}
      >
        <Feather
          name={getTransactionIcon(transaction.type) as any}
          size={20}
          color={getTransactionColor(transaction.type)}
        />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-medium text-foreground">{transaction.description}</Text>
        <Text className="text-xs text-muted mt-0.5">
          {new Date(transaction.timestamp).toLocaleDateString('en-GB', { day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'})}
        </Text>
      </View>
      <Text className="text-base font-bold text-success">+K{transaction.amount.toFixed(2)}</Text>
    </View>
  );
  const renderPayout = (payout: Payout) => (
    <View key={payout.id} className="flex-row items-center py-3 border-b border-border">
      <View className="w-10 h-10 rounded-full bg-warning/10 items-center justify-center">
        <Feather name="arrow-up-circle" size={20} color="#F59E0B" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-medium text-foreground">{payout.method}</Text>
        <Text className="text-xs text-muted mt-0.5">
          {new Date(payout.requestedAt).toLocaleDateString('en-GB', { day: 'numeric',
            month: 'short'})}
          {' · '}
          <Text className={`capitalize ${ payout.status === 'completed' ? 'text-success' :
            payout.status === 'pending' ? 'text-warning' : 'text-error' }`}>
            {payout.status}
          </Text>
        </Text>
      </View>
      <Text className="text-base font-bold text-foreground">K{payout.amount.toFixed(2)}</Text>
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
        <Text className="text-lg font-semibold text-foreground">Earnings</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="p-2 -mr-2">
          <Feather name="help-circle" size={24} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#009688" /> }
      >
        {/* Balance Card */}
        <View className="mx-4 mt-4 bg-primary rounded-2xl p-6">
          <Text className="text-sm text-white/80">Available Balance</Text>
          <Text className="text-4xl font-bold text-white mt-2">K{summary.availableBalance.toFixed(2)}</Text>
          
          {summary.pendingPayout > 0 && (
            <Text className="text-sm text-white/60 mt-1">
              K{summary.pendingPayout.toFixed(2)} pending payout
            </Text>
          )}
          
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowPayoutModal(true)}
            className="bg-background/20 rounded-xl py-3 mt-4 flex-row items-center justify-center"
          >
            <Feather name="arrow-up" size={20} color="#FFFFFF" />
            <Text className="text-white font-medium ml-2">Request Payout</Text>
          </Pressable>
        </View>

        {/* Time Range Tabs */}
        <View className="flex-row mx-4 mt-6 bg-surface rounded-xl p-1">
          {(['today', 'week', 'month', 'year'] as TimeRange[]).map(range => (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={range}
              onPress={() => { setSelectedRange(range);
                if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
              className={`flex-1 py-2 rounded-lg ${selectedRange === range ? 'bg-primary' : ''}`}
            >
              <Text className={`text-center text-sm font-medium capitalize ${ selectedRange === range ? 'text-white' : 'text-muted' }`}>
                {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : range === 'year' ? 'This Year' : 'Today'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Earnings Summary */}
        <View className="mx-4 mt-4 bg-surface rounded-xl p-4 border border-border">
          <Text className="text-2xl font-bold text-foreground">K{getEarningsByRange().toFixed(2)}</Text>
          <Text className="text-sm text-muted mt-1">Total earnings {selectedRange === 'today' ? 'today' : `this ${selectedRange}`}</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row mx-4 mt-4 gap-3">
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center mb-2">
              <Feather name="truck" size={20} color="#22C55E" />
            </View>
            <Text className="text-xl font-bold text-foreground">
              {transactions.filter(t => t.type === 'delivery').length}
            </Text>
            <Text className="text-xs text-muted">Deliveries</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <View className="w-10 h-10 rounded-full bg-pink-500/10 items-center justify-center mb-2">
              <Feather name="heart" size={20} color="#EC4899" />
            </View>
            <Text className="text-xl font-bold text-foreground">
              K{transactions.filter(t => t.type === 'tip').reduce((sum, t) => sum + t.amount, 0).toFixed(0)}
            </Text>
            <Text className="text-xs text-muted">Tips Earned</Text>
          </View>
        </View>

        {/* Tax Summary */}
        <View className="mx-4 mt-6">
          <Text className="text-base font-semibold text-foreground mb-3">Tax Summary (This Year)</Text>
          <View className="bg-surface rounded-xl p-4 border border-border">
            <View className="flex-row justify-between py-2 border-b border-border">
              <Text className="text-sm text-muted">Gross Earnings</Text>
              <Text className="text-sm font-medium text-foreground">K{taxSummary.grossEarnings.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-border">
              <Text className="text-sm text-muted">Estimated Tax ({(taxSummary.taxRate * 100).toFixed(0)}%)</Text>
              <Text className="text-sm font-medium text-error">-K{taxSummary.estimatedTax.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-sm font-medium text-foreground">Net Earnings</Text>
              <Text className="text-sm font-bold text-success">K{taxSummary.netEarnings.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Recent Earnings */}
        <View className="mx-4 mt-6">
          <Text className="text-base font-semibold text-foreground mb-3">Recent Earnings</Text>
          <View className="bg-surface rounded-xl px-4 border border-border">
            {transactions.slice(0, 5).map(renderTransaction)}
          </View>
        </View>

        {/* Payout History */}
        <View className="mx-4 mt-6 mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">Payout History</Text>
          <View className="bg-surface rounded-xl px-4 border border-border">
            {payouts.length > 0 ? (
              payouts.slice(0, 5).map(renderPayout)
            ) : (
              <View className="py-8 items-center">
                <Feather name="inbox" size={40} color="#9CA3AF" />
                <Text className="text-sm text-muted mt-2">No payouts yet</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Payout Modal */}
      <Modal
        visible={showPayoutModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Request Payout</Text>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowPayoutModal(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-sm font-medium text-muted mb-3">Select Method</Text>
              {PAYOUT_METHODS.map(method => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={method.id}
                  onPress={() => setSelectedMethod(method.id)}
                  className={`flex-row items-center p-4 rounded-xl mb-2 border ${ selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-border bg-surface' }`}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${method.color}20` }}
                  >
                    <Feather name="smartphone" size={20} color={method.color} />
                  </View>
                  <Text className="text-base font-medium text-foreground ml-3">{method.name}</Text>
                  {selectedMethod === method.id && (
                    <Feather name="check" size={20} color="#009688" style={{ marginLeft: 'auto' }} />
                  )}
                </Pressable>
              ))}

              <Text className="text-sm font-medium text-muted mt-4 mb-2">Account Number</Text>
              <TextInput
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="e.g., 0971234567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-4"
              />

              <Text className="text-sm font-medium text-muted mb-2">Amount</Text>
              <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 mb-2">
                <Text className="text-lg font-medium text-muted mr-2">K</Text>
                <TextInput
                  value={payoutAmount}
                  onChangeText={setPayoutAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className="flex-1 text-lg text-foreground"
                />
              </View>
              <Text className="text-xs text-muted mb-6">Available: K{summary.availableBalance.toFixed(2)}</Text>

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleRequestPayout}
                disabled={isLoading}
                className={`py-4 rounded-xl ${isLoading ? 'bg-muted' : 'bg-primary'}`}
              >
                <Text className="text-center text-white font-semibold text-base">
                  {isLoading ? 'Processing...' : 'Request Payout'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

