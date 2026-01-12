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
import { useWalletStore, WalletTransaction, WalletTransactionType } from '@/stores/wallet-store';
import { useToast } from '@/lib/toast-provider';
  const TOP_UP_AMOUNTS = [50, 100, 200, 500];
  const WITHDRAWAL_METHODS = [
  { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00' },
  { id: 'airtel', name: 'Airtel Money', color: '#FF0000' },
  { id: 'zamtel', name: 'Zamtel Kwacha', color: '#00A651' },
];

export default function WalletScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const { balance,
    transactions,
    isLoading,
    loadWallet,
    topUp,
    withdraw} = useWalletStore();

  useEffect(() => { loadWallet(); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    await loadWallet();
    setRefreshing(false); };
  const handleTopUp = async () => { const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount < 10) { toast.error('Minimum top up amount is K10');
      return; }

    try { await topUp(amount, 'MTN Mobile Money');
      if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
      setShowTopUpModal(false);
      setTopUpAmount('');
      toast.success(`K${amount} has been added to your wallet`); } catch (error) { toast.error('Top up failed. Please try again.'); } };
  const handleWithdraw = async () => { const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 20) { toast.error('Minimum withdrawal amount is K20');
      return; }
    if (amount > balance) { toast.error('Insufficient balance');
      return; }
    if (!selectedWithdrawMethod || !accountNumber) { toast.error('Please select a method and enter account number');
      return; }

    try { const method = WITHDRAWAL_METHODS.find(m => m.id === selectedWithdrawMethod);
      await withdraw(amount, method?.name || '', accountNumber);
      if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setSelectedWithdrawMethod(null);
      setAccountNumber('');
      toast.success(`K${amount} withdrawal initiated. You will receive it shortly.`); } catch (error) { toast.error('Withdrawal failed. Please try again.'); } };
  const getTransactionIcon = (type: WalletTransactionType) => { const icons: Record<WalletTransactionType, string> = { top_up: 'plus-circle',
      payment: 'shopping-bag',
      refund: 'rotate-ccw',
      withdrawal: 'arrow-up-circle',
      bonus: 'gift',
      cashback: 'percent'};
    return icons[type] || 'circle'; };
  const getTransactionColor = (type: WalletTransactionType) => { const colors: Record<WalletTransactionType, string> = { top_up: '#22C55E',
      payment: '#EF4444',
      refund: '#3B82F6',
      withdrawal: '#F59E0B',
      bonus: '#8B5CF6',
      cashback: '#10B981'};
    return colors[type] || '#6B7280'; };
  const renderTransaction = (transaction: WalletTransaction) => { const isPositive = transaction.amount > 0;

    return (
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
          <Text className="text-xs text-muted mt-1">
            {new Date(transaction.timestamp).toLocaleDateString('en-GB', { day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'})}
          </Text>
        </View>
        <Text className={`text-base font-bold ${isPositive ? 'text-success' : 'text-error'}`}>
          {isPositive ? '+' : ''}K{Math.abs(transaction.amount).toFixed(2)}
        </Text>
      </View>
    ); };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Wallet</Text>
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
          <Text className="text-4xl font-bold text-white mt-2">K{balance.toFixed(2)}</Text>
          
          <View className="flex-row mt-6 gap-3">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowTopUpModal(true)}
              className="flex-1 bg-background/20 rounded-xl py-3 flex-row items-center justify-center"
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text className="text-white font-medium ml-2">Top Up</Text>
            </Pressable>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowWithdrawModal(true)}
              className="flex-1 bg-background/20 rounded-xl py-3 flex-row items-center justify-center"
            >
              <Feather name="arrow-up" size={20} color="#FFFFFF" />
              <Text className="text-white font-medium ml-2">Withdraw</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text className="text-base font-semibold text-foreground mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(customer)/PaymentMethodsScreen')}
              className="flex-1 bg-surface rounded-xl p-4 border border-border items-center"
            >
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-2">
                <Feather name="credit-card" size={24} color="#009688" />
              </View>
              <Text className="text-sm font-medium text-foreground">Payment Methods</Text>
            </Pressable>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(customer)/LoyaltyScreen')}
              className="flex-1 bg-surface rounded-xl p-4 border border-border items-center"
            >
              <View className="w-12 h-12 rounded-full bg-warning/10 items-center justify-center mb-2">
                <Feather name="award" size={24} color="#F59E0B" />
              </View>
              <Text className="text-sm font-medium text-foreground">Rewards</Text>
            </Pressable>
          </View>
        </View>

        {/* Transaction History */}
        <View className="px-4 mt-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-foreground">Transaction History</Text>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <Text className="text-sm text-primary font-medium">See All</Text>
            </Pressable>
          </View>

          <View className="bg-surface rounded-xl p-4 border border-border">
            {transactions.length > 0 ? (
              transactions.slice(0, 10).map(renderTransaction)
            ) : (
              <View className="py-8 items-center">
                <Feather name="inbox" size={40} color="#9CA3AF" />
                <Text className="text-base font-medium text-muted mt-3">No transactions yet</Text>
                <Text className="text-sm text-muted mt-1">Top up your wallet to get started</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal
        visible={showTopUpModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Top Up Wallet</Text>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowTopUpModal(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <Text className="text-sm font-medium text-muted mb-3">Select Amount</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {TOP_UP_AMOUNTS.map(amount => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={amount}
                  onPress={() => setTopUpAmount(amount.toString())}
                  className={`px-6 py-3 rounded-xl border ${ topUpAmount === amount.toString()
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border' }`}
                >
                  <Text className={`font-medium ${ topUpAmount === amount.toString() ? 'text-white' : 'text-foreground' }`}>
                    K{amount}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-medium text-muted mb-2">Or enter amount</Text>
            <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 mb-6">
              <Text className="text-lg font-medium text-muted mr-2">K</Text>
              <TextInput
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                className="flex-1 text-lg text-foreground"
              />
            </View>

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleTopUp}
              disabled={isLoading}
              className={`py-4 rounded-xl ${isLoading ? 'bg-muted' : 'bg-primary'}`}
            >
              <Text className="text-center text-white font-semibold text-base">
                {isLoading ? 'Processing...' : 'Top Up Now'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Withdraw Funds</Text>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowWithdrawModal(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-sm font-medium text-muted mb-3">Select Method</Text>
              {WITHDRAWAL_METHODS.map(method => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={method.id}
                  onPress={() => setSelectedWithdrawMethod(method.id)}
                  className={`flex-row items-center p-4 rounded-xl mb-2 border ${ selectedWithdrawMethod === method.id ? 'border-primary bg-primary/5' : 'border-border bg-surface' }`}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${method.color}20` }}
                  >
                    <Feather name="smartphone" size={20} color={method.color} />
                  </View>
                  <Text className="text-base font-medium text-foreground ml-3">{method.name}</Text>
                  {selectedWithdrawMethod === method.id && (
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
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className="flex-1 text-lg text-foreground"
                />
              </View>
              <Text className="text-xs text-muted mb-6">Available: K{balance.toFixed(2)}</Text>

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleWithdraw}
                disabled={isLoading}
                className={`py-4 rounded-xl ${isLoading ? 'bg-muted' : 'bg-primary'}`}
              >
                <Text className="text-center text-white font-semibold text-base">
                  {isLoading ? 'Processing...' : 'Withdraw'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

