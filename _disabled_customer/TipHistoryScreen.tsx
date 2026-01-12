// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { useTippingStore, TipHistory } from '@/stores/tipping-store';

export default function TipHistoryScreen() { const router = useRouter();
  const colors = useColors();
  const { tipHistory,
    loadTipHistory,
    getTotalTipsGiven,
    getAverageTipPercentage} = useTippingStore();

  useEffect(() => { loadTipHistory(); }, []);
  const totalTips = getTotalTipsGiven();
  const avgPercentage = getAverageTipPercentage();
  const renderTipItem = (tip: TipHistory) => { return (
      <View key={tip.id} className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{tip.taskerName}</Text>
            <Text className="text-xs text-muted mt-0.5">Order #{tip.orderId}</Text>
          </View>
          <View className="items-end">
            <Text className="text-lg font-bold text-primary">K{tip.amount.toFixed(2)}</Text>
            <Text className="text-xs text-muted">{tip.percentage.toFixed(0)}% tip</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-2 border-t border-border">
          <View className="flex-row items-center">
            <Feather name="shopping-bag" size={14} color="#6B7280" />
            <Text className="text-xs text-muted ml-1">Order: K{tip.orderTotal.toFixed(2)}</Text>
          </View>
          <Text className="text-xs text-muted">
            {new Date(tip.date).toLocaleDateString('en-GB', { day: 'numeric',
              month: 'short',
              year: 'numeric'})}
          </Text>
        </View>
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
        <Text className="text-lg font-semibold text-foreground">Tip History</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="flex-row gap-3 my-4">
          <View className="flex-1 bg-primary/5 rounded-xl p-4 border border-primary/20">
            <Text className="text-xs text-muted mb-1">Total Tips Given</Text>
            <Text className="text-2xl font-bold text-primary">K{totalTips.toFixed(2)}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Average Tip</Text>
            <Text className="text-2xl font-bold text-foreground">{avgPercentage.toFixed(0)}%</Text>
          </View>
        </View>

        {/* Tip History List */}
        <Text className="text-base font-semibold text-foreground mb-3">Recent Tips</Text>
        {tipHistory.length > 0 ? (
          tipHistory.map(renderTipItem)
        ) : (
          <View className="items-center justify-center py-12">
            <Feather name="gift" size={48} color="#E5E7EB" />
            <Text className="text-muted mt-4">No tips yet</Text>
            <Text className="text-xs text-muted mt-2 text-center px-8">
              Show appreciation to your taskers by tipping them after delivery
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

