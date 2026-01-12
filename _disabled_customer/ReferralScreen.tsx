// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Share, Platform, FlatList, RefreshControl, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useReferralStore, Referral } from '@/stores/referral-store';

export default function ReferralScreen() { const router = useRouter();
  const colors = useColors();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');
  const { referralCode,
    referrals,
    stats,
    isLoading,
    loadReferralData,
    getShareMessage,
    claimReward} = useReferralStore();

  useEffect(() => { loadReferralData('user-001'); // Mock user ID 
      }, []);
  const handleCopyCode = async () => { await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    setTimeout(() => setCopied(false), 2000); };
  const handleShare = async () => { try { const message = getShareMessage();
      await Share.share({ message,
        title: 'Join Ntumai!'});
      if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } } catch (error) { console.error('Error sharing:', error); } };
  const handleRefresh = async () => { setRefreshing(true);
    await loadReferralData('user-001');
    setRefreshing(false); };
  const handleClaimReward = async (referralId: string) => { await claimReward(referralId);
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } };
  const filteredReferrals = referrals.filter(ref =>  {
    if (activeTab === 'all') return true;
    return ref.status === activeTab; });
  const renderReferralItem = ({ item }: { item: Referral }) => { const isCompleted = item.status === 'completed';
  const canClaim = isCompleted && !item.rewardClaimed;

    return (
      <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
              <Text className="text-lg font-bold text-primary">
                {item.referredUserName.charAt(0)}
              </Text>
            </View>

            {/* Info */}
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-foreground">
                {item.referredUserName}
              </Text>
              <Text className="text-sm text-muted">{item.referredUserPhone}</Text>
              <Text className="text-xs text-muted mt-1">
                Joined {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Status / Action */}
          <View className="items-end">
            {item.status === 'pending' ? (
              <View className="px-3 py-1 bg-warning/10 rounded-full">
                <Text className="text-xs font-medium text-warning">Pending</Text>
              </View>
            ) : item.rewardClaimed ? (
              <View className="px-3 py-1 bg-success/10 rounded-full">
                <Text className="text-xs font-medium text-success">Claimed</Text>
              </View>
            ) : (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleClaimReward(item.id)}
                className="px-3 py-1 bg-primary rounded-full"
              >
                <Text className="text-xs font-medium text-white">Claim K{item.rewardAmount}</Text>
              </Pressable>
            )}
            {isCompleted && (
              <Text className="text-xs text-success mt-1">+K{item.rewardAmount}</Text>
            )}
          </View>
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
        <Text className="text-lg font-semibold text-foreground">Refer & Earn</Text>
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
        {/* Hero Section */}
        <View className="bg-primary mx-4 mt-4 rounded-2xl p-6">
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-background/20 items-center justify-center mb-3">
              <Feather name="gift" size={32} color="#FFFFFF" />
            </View>
            <Text className="text-2xl font-bold text-white text-center">
              Give K20, Get K20
            </Text>
            <Text className="text-sm text-white/80 text-center mt-2">
              Invite friends to Ntumai. When they complete their first order, you both get K20!
            </Text>
          </View>

          {/* Referral Code */}
          <View className="bg-background/10 rounded-xl p-4 mt-4">
            <Text className="text-xs text-white/70 text-center mb-2">Your Referral Code</Text>
            <View className="flex-row items-center justify-center">
              <Text className="text-2xl font-bold text-white tracking-widest">
                {referralCode || 'Loading...'}
              </Text>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCopyCode} className="ml-3 p-2">
                <Feather name={copied ? 'check' : 'copy'} size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            {copied && (
              <Text className="text-xs text-white/80 text-center mt-1">Copied!</Text>
            )}
          </View>

          {/* Share Button */}
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleShare}
            className="bg-background mt-4 py-3 rounded-xl flex-row items-center justify-center"
          >
            <Feather name="share-2" size={20} color="#009688" />
            <Text className="text-primary font-semibold ml-2">Share with Friends</Text>
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View className="flex-row px-4 mt-4 gap-3">
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-foreground">{stats.totalReferrals}</Text>
            <Text className="text-xs text-muted">Total Referrals</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-success">K{stats.totalEarnings}</Text>
            <Text className="text-xs text-muted">Total Earned</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-primary">K{stats.availableBalance}</Text>
            <Text className="text-xs text-muted">To Claim</Text>
          </View>
        </View>

        {/* How It Works */}
        <View className="px-4 mt-6">
          <Text className="text-base font-semibold text-foreground mb-3">How It Works</Text>
          <View className="bg-surface rounded-xl p-4 border border-border">
            {[
              { icon: 'share-2', title: 'Share your code', desc: 'Send your unique code to friends' },
              { icon: 'user-plus', title: 'Friend signs up', desc: 'They register using your code' },
              { icon: 'shopping-bag', title: 'First order', desc: 'They complete their first order' },
              { icon: 'gift', title: 'Both get K20!', desc: 'Rewards added to your wallets' },
            ].map((step, index) => (
              <View key={index} className={`flex-row items-center ${index < 3 ? 'mb-4 pb-4 border-b border-border' : ''}`}>
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Feather name={step.icon} size={18} color="#009688" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-foreground">{step.title}</Text>
                  <Text className="text-xs text-muted">{step.desc}</Text>
                </View>
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                  <Text className="text-xs font-bold text-white">{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Referral History */}
        <View className="px-4 mt-6 mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">Your Referrals</Text>

          {/* Tabs */}
          <View className="flex-row gap-2 mb-3">
            {(['all', 'completed', 'pending'] as const).map((tab) => (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full ${activeTab === tab ? 'bg-primary' : 'bg-surface border border-border'}`}
              >
                <Text className={`text-sm font-medium capitalize ${activeTab === tab ? 'text-white' : 'text-muted'}`}>
                  {tab} {tab === 'all' ? `(${referrals.length})` : tab === 'completed' ? `(${stats.completedReferrals})` : `(${stats.pendingReferrals})`}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Referral List */}
          {filteredReferrals.length > 0 ? (
            filteredReferrals.map((referral) => (
              <View key={referral.id}>
                {renderReferralItem({ item: referral })}
              </View>
            ))
          ) : (
            <View className="bg-surface rounded-xl p-8 items-center border border-border">
              <Feather name="users" size={40} color="#9CA3AF" />
              <Text className="text-base font-medium text-foreground mt-3">No referrals yet</Text>
              <Text className="text-sm text-muted text-center mt-1">
                Share your code with friends to start earning!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

