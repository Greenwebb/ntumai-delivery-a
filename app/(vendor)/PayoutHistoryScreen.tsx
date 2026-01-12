// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, OutlineButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Pressable, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank' | 'mobile_money';
  accountNumber: string;
  date: string;
  completedDate?: string;
  failureReason?: string;
}

const MOCK_PAYOUTS: Payout[] = [
  {
    id: '1',
    amount: 2500,
    status: 'completed',
    method: 'mobile_money',
    accountNumber: '+260 97 123 4567',
    date: '2026-01-01',
    completedDate: '2026-01-02',
  },
  {
    id: '2',
    amount: 1850,
    status: 'processing',
    method: 'bank',
    accountNumber: '****5678',
    date: '2026-01-03',
  },
  {
    id: '3',
    amount: 3200,
    status: 'pending',
    method: 'mobile_money',
    accountNumber: '+260 97 123 4567',
    date: '2026-01-04',
  },
];

export default function PayoutHistoryScreen() {
  const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [availableBalance, setAvailableBalance] = useState(4250);
  const [pendingBalance, setPendingBalance] = useState(1850);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'mobile_money'>('mobile_money');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPayouts(MOCK_PAYOUTS);
    } catch (error) {
      toast.error('Failed to load payout history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPayouts();
  };

  const handleWithdrawPress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowWithdrawModal(true);
  };

  const handleSubmitWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.info('Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (amount < 50) {
      toast.info('Minimum withdrawal amount is K50');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      toast.success('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadPayouts();
    } catch (error) {
      toast.error('Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'processing': return colors.warning;
      case 'pending': return colors.muted;
      case 'failed': return colors.error;
      default: return colors.muted;
    }
  };

  const getStatusIcon = (status: Payout['status']) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'processing': return 'clock';
      case 'pending': return 'alert-circle';
      case 'failed': return 'x-circle';
      default: return 'circle';
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading payout history..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
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
            <Text className="text-2xl font-bold">Payout History</Text>
            <Text className="text-sm text-muted">Manage your earnings</Text>
          </View>
        </View>

        {/* Balance Cards */}
        <View className="gap-4 mb-6">
          <View className="rounded-2xl p-6" style={{ backgroundColor: colors.primary }}>
            <Text className="text-sm mb-2" style={{ color: '#FFF', opacity: 0.9 }}>
              Available Balance
            </Text>
            <Text className="text-4xl font-bold mb-4" style={{ color: '#FFF' }}>
              K{availableBalance.toFixed(2)}
            </Text>
            <PrimaryButton
              onPress={handleWithdrawPress}
              style={{ backgroundColor: '#FFF' }}
            >
              <Text className="font-semibold" style={{ color: colors.primary }}>
                Withdraw Funds
              </Text>
            </PrimaryButton>
          </View>

          <View className="rounded-2xl p-4 flex-row items-center justify-between" style={{ backgroundColor: colors.surface }}>
            <View>
              <Text className="text-sm text-muted mb-1">Pending Balance</Text>
              <Text className="text-2xl font-bold">K{pendingBalance.toFixed(2)}</Text>
            </View>
            <Feather name="clock" size={32} color={colors.warning} />
          </View>
        </View>

        {/* Payout History */}
        <Text className="text-lg font-semibold mb-4">Transaction History</Text>

        {payouts.length === 0 ? (
          <EmptyStateView
            icon="dollar-sign"
            title="No Payouts Yet"
            message="Your payout history will appear here once you request a withdrawal."
          />
        ) : (
          <View className="gap-4 mb-6">
            {payouts.map((payout) => (
              <View
                key={payout.id}
                className="rounded-2xl p-4"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-start gap-3 mb-3">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: getStatusColor(payout.status) + '20' }}
                  >
                    <Feather
                      name={getStatusIcon(payout.status)}
                      size={24}
                      color={getStatusColor(payout.status)}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-2xl font-bold">K{payout.amount.toFixed(2)}</Text>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: getStatusColor(payout.status) + '20' }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: getStatusColor(payout.status) }}
                        >
                          {payout.status}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2 mb-1">
                      <Feather
                        name={payout.method === 'bank' ? 'credit-card' : 'smartphone'}
                        size={14}
                        color={colors.muted}
                      />
                      <Text className="text-sm text-muted capitalize">
                        {payout.method.replace('_', ' ')}
                      </Text>
                      <Text className="text-sm text-muted">• {payout.accountNumber}</Text>
                    </View>
                    <Text className="text-xs text-muted">
                      Requested: {new Date(payout.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    {payout.completedDate && (
                      <Text className="text-xs text-muted">
                        Completed: {new Date(payout.completedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    )}
                    {payout.failureReason && (
                      <Text className="text-xs mt-2" style={{ color: colors.error }}>
                        {payout.failureReason}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Withdraw Modal */}
      <BottomSheet
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Funds"
      >
        <View className="gap-4">
          <View className="p-4 rounded-xl" style={{ backgroundColor: colors.primary + '10' }}>
            <Text className="text-sm text-muted mb-1">Available Balance</Text>
            <Text className="text-2xl font-bold">K{availableBalance.toFixed(2)}</Text>
          </View>

          <View>
            <Text className="font-medium mb-2">Withdrawal Amount</Text>
            <Input
              placeholder="Enter amount (min. K50)"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <View>
            <Text className="font-medium mb-2">Withdrawal Method</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setWithdrawMethod('mobile_money')}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="flex-1"
              >
                <View
                  className="p-4 rounded-xl items-center"
                  style={{
                    backgroundColor: withdrawMethod === 'mobile_money' ? colors.primary : colors.surface,
                  }}
                >
                  <Feather
                    name="smartphone"
                    size={24}
                    color={withdrawMethod === 'mobile_money' ? '#FFF' : colors.foreground}
                  />
                  <Text
                    className="text-sm font-medium mt-2"
                    style={{ color: withdrawMethod === 'mobile_money' ? '#FFF' : colors.foreground }}
                  >
                    Mobile Money
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setWithdrawMethod('bank')}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="flex-1"
              >
                <View
                  className="p-4 rounded-xl items-center"
                  style={{
                    backgroundColor: withdrawMethod === 'bank' ? colors.primary : colors.surface,
                  }}
                >
                  <Feather
                    name="credit-card"
                    size={24}
                    color={withdrawMethod === 'bank' ? '#FFF' : colors.foreground}
                  />
                  <Text
                    className="text-sm font-medium mt-2"
                    style={{ color: withdrawMethod === 'bank' ? '#FFF' : colors.foreground }}
                  >
                    Bank Transfer
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View className="p-3 rounded-xl" style={{ backgroundColor: colors.warning + '20' }}>
            <View className="flex-row gap-2">
              <Feather name="info" size={16} color={colors.warning} />
              <Text className="flex-1 text-xs text-muted">
                Processing time: 1-3 business days. Minimum withdrawal: K50.
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <SecondaryButton
                onPress={() => setShowWithdrawModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </SecondaryButton>
            </View>
            <View className="flex-1">
              <PrimaryButton
                onPress={handleSubmitWithdrawal}
                loading={isSubmitting}
              >
                Withdraw
              </PrimaryButton>
            </View>
          </View>
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

