// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Platform, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useLoyaltyStore, Reward, PointsTransaction } from '@/stores/loyalty-store';
import { useToast } from '@/lib/toast-provider';

export default function LoyaltyScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');
  const { totalPoints,
    availablePoints,
    currentTier,
    nextTier,
    pointsToNextTier,
    transactions,
    rewards,
    isLoading,
    loadLoyaltyData,
    redeemReward,
    getTierProgress} = useLoyaltyStore();

  useEffect(() => { loadLoyaltyData(); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    await loadLoyaltyData();
    setRefreshing(false); };
  const handleRedeemReward = (reward: Reward) =>  {
    if (availablePoints < reward.pointsCost) { toast.info('Insufficient Points', `You need ${reward.pointsCost - availablePoints} more points to redeem this reward.`);
      return; }

    toast.info(
      'Redeem Reward',
      `Redeem "${reward.title}" for ${reward.pointsCost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeem',
          onPress: async () => { await redeemReward(reward.id);
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
            toast.success('Reward redeemed successfully. Check your wallet for the voucher.'); }},
      ]
    ); };
  const tierProgress = getTierProgress();
  const renderRewardCard = (reward: Reward) => { const canAfford = availablePoints >= reward.pointsCost;

    return (
      <View key={reward.id} className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-start flex-1">
            <View className={`w-12 h-12 rounded-full items-center justify-center ${canAfford ? 'bg-primary/10' : 'bg-muted/10'}`}>
              <Feather name={reward.icon as any} size={24} color={canAfford ? '#009688' : '#9CA3AF'} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-foreground">{reward.title}</Text>
              <Text className="text-sm text-muted mt-1">{reward.description}</Text>
              <View className="flex-row items-center mt-2">
                <Feather name="clock" size={14} color="#6B7280" />
                <Text className="text-xs text-muted ml-1">Valid for {reward.expiryDays} days</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-border">
          <View className="flex-row items-center">
            <Feather name="star" size={16} color="#F59E0B" />
            <Text className="text-base font-bold text-foreground ml-1">{reward.pointsCost} points</Text>
          </View>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleRedeemReward(reward)}
            disabled={!canAfford}
            className={`px-4 py-2 rounded-lg ${canAfford ? 'bg-primary' : 'bg-muted/20'}`}
          >
            <Text className={`text-sm font-medium ${canAfford ? 'text-white' : 'text-muted'}`}>
              {canAfford ? 'Redeem' : 'Locked'}
            </Text>
          </Pressable>
        </View>
      </View>
    ); };
  const renderTransaction = (transaction: PointsTransaction) => { const isEarned = transaction.type === 'earned';
  const isRedeemed = transaction.type === 'redeemed';

    return (
      <View key={transaction.id} className="flex-row items-center justify-between py-3 border-b border-border">
        <View className="flex-row items-center flex-1">
          <View className={`w-10 h-10 rounded-full items-center justify-center ${ isEarned ? 'bg-success/10' : isRedeemed ? 'bg-primary/10' : 'bg-muted/10' }`}>
            <Feather
              name={isEarned ? 'plus' : isRedeemed ? 'minus' : 'x'}
              size={20}
              color={isEarned ? '#22C55E' : isRedeemed ? '#009688' : '#9CA3AF'}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-medium text-foreground">{transaction.description}</Text>
            <Text className="text-xs text-muted mt-1">
              {new Date(transaction.timestamp).toLocaleDateString('en-GB', { day: 'numeric',
                month: 'short',
                year: 'numeric'})}
            </Text>
          </View>
        </View>
        <Text className={`text-base font-bold ${isEarned ? 'text-success' : 'text-error'}`}>
          {isEarned ? '+' : ''}{transaction.amount}
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
        <Text className="text-lg font-semibold text-foreground">Loyalty Rewards</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="p-2 -mr-2">
          <Feather name="info" size={24} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#009688" /> }
      >
        {/* Points Card */}
        <View className="mx-4 mt-4 rounded-2xl p-6" style={{ backgroundColor: currentTier.color }}>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-sm text-white/80">Available Points</Text>
              <Text className="text-4xl font-bold text-white mt-1">{availablePoints}</Text>
            </View>
            <View className="w-16 h-16 rounded-full bg-background/20 items-center justify-center">
              <Feather name="award" size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Tier Badge */}
          <View className="bg-background/20 rounded-xl p-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-white">{currentTier.name} Member</Text>
              {nextTier && (
                <Text className="text-xs text-white/80">{pointsToNextTier} to {nextTier.name}</Text>
              )}
            </View>
            {nextTier && (
              <View className="h-2 bg-background/20 rounded-full overflow-hidden">
                <View className="h-full bg-background rounded-full" style={{ width: `${tierProgress}%` }} />
              </View>
            )}
          </View>
        </View>

        {/* Tier Benefits */}
        <View className="px-4 mt-4">
          <Text className="text-base font-semibold text-foreground mb-3">{currentTier.name} Benefits</Text>
          <View className="bg-surface rounded-xl p-4 border border-border">
            {currentTier.benefits.map((benefit, index) => (
              <View key={index} className={`flex-row items-center ${index < currentTier.benefits.length - 1 ? 'mb-3' : ''}`}>
                <Feather name="check-circle" size={18} color="#22C55E" />
                <Text className="text-sm text-foreground ml-2 flex-1">{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 mt-6 gap-2">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setActiveTab('rewards')}
            className={`flex-1 py-3 rounded-xl ${activeTab === 'rewards' ? 'bg-primary' : 'bg-surface border border-border'}`}
          >
            <Text className={`text-center text-sm font-medium ${activeTab === 'rewards' ? 'text-white' : 'text-muted'}`}>
              Rewards ({rewards.length})
            </Text>
          </Pressable>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl ${activeTab === 'history' ? 'bg-primary' : 'bg-surface border border-border'}`}
          >
            <Text className={`text-center text-sm font-medium ${activeTab === 'history' ? 'text-white' : 'text-muted'}`}>
              History ({transactions.length})
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-4 mt-4 mb-6">
          {activeTab === 'rewards' ? (
            <>
              <Text className="text-sm text-muted mb-3">Redeem your points for exclusive rewards</Text>
              {rewards.map(renderRewardCard)}
            </>
          ) : (
            <>
              <Text className="text-sm text-muted mb-3">Your points transaction history</Text>
              <View className="bg-surface rounded-xl p-4 border border-border">
                {transactions.length > 0 ? (
                  transactions.map(renderTransaction)
                ) : (
                  <View className="py-8 items-center">
                    <Feather name="inbox" size={40} color="#9CA3AF" />
                    <Text className="text-base font-medium text-muted mt-3">No transactions yet</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* How to Earn */}
        <View className="px-4 mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">How to Earn Points</Text>
          <View className="bg-primary/5 rounded-xl p-4">
            {[
              { icon: 'shopping-bag', text: 'Complete orders to earn points' },
              { icon: 'users', text: 'Refer friends and get bonus points' },
              { icon: 'star', text: 'Leave reviews after delivery' },
              { icon: 'gift', text: 'Special promotions and events' },
            ].map((item, index) => (
              <View key={index} className={`flex-row items-center ${index < 3 ? 'mb-3' : ''}`}>
                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                  <Feather name={item.icon as any} size={16} color="#009688" />
                </View>
                <Text className="text-sm text-foreground ml-3">{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

