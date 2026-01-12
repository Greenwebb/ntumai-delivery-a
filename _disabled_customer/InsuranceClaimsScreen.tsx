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
import { useInsuranceStore, InsuranceClaim, ClaimStatus } from '@/stores/insurance-store';

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

export default function InsuranceClaimsScreen() { const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const { claims, loadClaims, isLoading } = useInsuranceStore();

  useEffect(() => { loadClaims(); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    await loadClaims();
    setRefreshing(false); };
  const getStatusColor = (status: ClaimStatus) => { const colors: Record<ClaimStatus, string> = { pending: '#F59E0B',
      under_review: '#3B82F6',
      approved: '#22C55E',
      rejected: '#EF4444',
      paid: '#10B981'};
    return colors[status]; };
  const getStatusIcon = (status: ClaimStatus) => { const icons: Record<ClaimStatus, string> = { pending: 'clock',
      under_review: 'search',
      approved: 'check-circle',
      rejected: 'x-circle',
      paid: 'dollar-sign'};
    return icons[status]; };
  const getClaimTypeIcon = (type: string) => { const icons: Record<string, string> = { lost: 'package',
      damaged: 'alert-triangle',
      stolen: 'shield-off',
      late_delivery: 'clock'};
    return icons[type] || 'help-circle'; };
  const getClaimTypeColor = (type: string) => { const colors: Record<string, string> = { lost: '#EF4444',
      damaged: '#F59E0B',
      stolen: '#DC2626',
      late_delivery: '#6B7280'};
    return colors[type] || '#6B7280'; };
  const filteredClaims = claims.filter(claim =>  {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return claim.status === 'pending' || claim.status === 'under_review';
    if (selectedTab === 'approved') return claim.status === 'approved' || claim.status === 'paid';
    if (selectedTab === 'rejected') return claim.status === 'rejected';
    return true; });
  const renderClaim = (claim: InsuranceClaim) => (
    <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={claim.id}
      onPress={() =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
        // Navigate to claim details 
      }}
      className="bg-surface rounded-xl p-4 mb-3 border border-border"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: `${getClaimTypeColor(claim.claimType)}20` }}
            >
              <Feather
                name={getClaimTypeIcon(claim.claimType) as any}
                size={16}
                color={getClaimTypeColor(claim.claimType)}
              />
            </View>
            <Text className="text-sm font-semibold text-foreground ml-2 capitalize">
              {claim.claimType.replace('_', ' ')}
            </Text>
          </View>
          <Text className="text-xs text-muted">Order #{claim.orderId}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(claim.status)}20` }}
        >
          <View className="flex-row items-center">
            <Feather
              name={getStatusIcon(claim.status) as any}
              size={12}
              color={getStatusColor(claim.status)}
            />
            <Text
              className="text-xs font-medium ml-1 capitalize"
              style={{ color: getStatusColor(claim.status) }}
            >
              {claim.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-sm text-foreground mb-3" numberOfLines={2}>
        {claim.description}
      </Text>

      <View className="flex-row items-center justify-between pt-3 border-t border-border">
        <View>
          <Text className="text-xs text-muted">Claim Amount</Text>
          <Text className="text-base font-bold text-foreground">K{claim.claimAmount.toFixed(2)}</Text>
        </View>
        <View>
          <Text className="text-xs text-muted text-right">Submitted</Text>
          <Text className="text-xs font-medium text-foreground">
            {new Date(claim.submittedAt).toLocaleDateString('en-GB', { day: 'numeric',
              month: 'short',
              year: 'numeric'})}
          </Text>
        </View>
      </View>

      {claim.payoutAmount && (
        <View className="mt-3 pt-3 border-t border-border bg-success/5 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
          <View className="flex-row items-center">
            <Feather name="check-circle" size={16} color="#22C55E" />
            <Text className="text-sm font-medium text-success ml-2">
              Payout: K{claim.payoutAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {claim.reviewerNotes && (
        <View className="mt-3 pt-3 border-t border-border">
          <Text className="text-xs font-medium text-muted mb-1">Review Notes</Text>
          <Text className="text-xs text-foreground">{claim.reviewerNotes}</Text>
        </View>
      )}
    </Pressable>
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
        <Text className="text-lg font-semibold text-foreground">Insurance Claims</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="p-2 -mr-2">
          <Feather name="help-circle" size={24} color="#6B7280" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mt-4 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'pending', 'approved', 'rejected'] as TabType[]).map(tab => (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={tab}
              onPress={() => { setSelectedTab(tab);
                if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
              className={`px-4 py-2 rounded-full mr-2 ${ selectedTab === tab ? 'bg-primary' : 'bg-surface border border-border' }`}
            >
              <Text
                className={`text-sm font-medium capitalize ${ selectedTab === tab ? 'text-white' : 'text-muted' }`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#009688" /> }
      >
        {filteredClaims.length > 0 ? (
          filteredClaims.map(renderClaim)
        ) : (
          <View className="items-center justify-center py-16">
            <View className="w-20 h-20 rounded-full bg-muted/10 items-center justify-center mb-4">
              <Feather name="inbox" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-base font-medium text-foreground mb-2">No Claims Found</Text>
            <Text className="text-sm text-muted text-center">
              {selectedTab === 'all'
                ? "You haven't filed any insurance claims yet"
                : `No ${selectedTab} claims`}
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View className="bg-primary/5 rounded-xl p-4 mb-6 mt-4">
          <View className="flex-row items-start">
            <Feather name="info" size={18} color="#009688" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-foreground">Need to file a claim?</Text>
              <Text className="text-xs text-muted mt-1">
                Go to your order details and tap "File Insurance Claim" if your order had protection and something went wrong.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

