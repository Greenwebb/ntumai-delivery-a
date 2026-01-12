// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Platform, Pressable , Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSubscriptionsStore, CustomerSubscription, SubscriptionPlan, SubscriptionStatus } from '@/stores/subscriptions-store';
import { useToast } from '@/lib/toast-provider';

type TabType = 'my' | 'browse';

export default function SubscriptionsScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('my');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { availablePlans,
    mySubscriptions,
    loadAvailablePlans,
    loadMySubscriptions,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    subscribe,
    isLoading} = useSubscriptionsStore();

  useEffect(() => { loadAvailablePlans();
    loadMySubscriptions(); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    await Promise.all([loadAvailablePlans(), loadMySubscriptions()]);
    setRefreshing(false); };
  const getStatusColor = (status: SubscriptionStatus) => { const colors: Record<SubscriptionStatus, string> = { active: '#22C55E',
      paused: '#F59E0B',
      cancelled: '#6B7280',
      expired: '#EF4444'};
    return colors[status]; };
  const getFrequencyLabel = (frequency: string) => { const labels: Record<string, string> = { weekly: 'Weekly',
      biweekly: 'Every 2 Weeks',
      monthly: 'Monthly'};
    return labels[frequency] || frequency; };
  const handlePause = (subscription: CustomerSubscription) => { toast.info(
      'Pause Subscription',
      'How long would you like to pause this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '1 Week',
          onPress: async () => { const pauseUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await pauseSubscription(subscription.id, pauseUntil);
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }},
        { text: '1 Month',
          onPress: async () => { const pauseUntil = new Date();
            pauseUntil.setMonth(pauseUntil.getMonth() + 1);
            await pauseSubscription(subscription.id, pauseUntil);
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }},
      ]
    ); };
  const handleResume = async (subscription: CustomerSubscription) => { await resumeSubscription(subscription.id);
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } };
  const handleCancel = (subscription: CustomerSubscription) => { toast.info(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription? You can resubscribe anytime.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { text: 'Cancel',
          style: 'destructive',
          onPress: async () => { await cancelSubscription(subscription.id);
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }},
      ]
    ); };
  const handleSubscribe = async (plan: SubscriptionPlan) => { try { await subscribe(plan.id, '123 Kabulonga Road, Lusaka', new Date());
      setSelectedPlan(null);
      if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
      toast.success('You have successfully subscribed!'); } catch (error) { toast.error('Failed to subscribe. Please try again.'); } };
  const renderSubscription = (subscription: CustomerSubscription) => (
    <View key={subscription.id} className="bg-surface rounded-xl p-4 mb-3 border border-border">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground mb-1">
            {subscription.plan.name}
          </Text>
          <Text className="text-sm text-muted">{subscription.plan.vendorName}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(subscription.status)}20` }}
        >
          <Text
            className="text-xs font-medium capitalize"
            style={{ color: getStatusColor(subscription.status) }}
          >
            {subscription.status}
          </Text>
        </View>
      </View>

      {/* Next Delivery */}
      <View className="bg-primary/5 rounded-xl p-3 mb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-muted mb-1">Next Delivery</Text>
            <Text className="text-sm font-medium text-foreground">
              {new Date(subscription.nextDeliveryDate).toLocaleDateString('en-GB', { weekday: 'short',
                day: 'numeric',
                month: 'short'})}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted mb-1 text-right">Frequency</Text>
            <Text className="text-sm font-medium text-foreground">
              {getFrequencyLabel(subscription.plan.frequency)}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
        <View>
          <Text className="text-xs text-muted">Total Deliveries</Text>
          <Text className="text-base font-bold text-foreground">{subscription.totalDeliveries}</Text>
        </View>
        <View>
          <Text className="text-xs text-muted text-right">Total Saved</Text>
          <Text className="text-base font-bold text-success">K{subscription.totalSaved.toFixed(2)}</Text>
        </View>
        <View>
          <Text className="text-xs text-muted text-right">Price</Text>
          <Text className="text-base font-bold text-primary">K{subscription.plan.price.toFixed(2)}</Text>
        </View>
      </View>

      {/* Actions */}
      {subscription.status === 'active' && (
        <View className="flex-row gap-2">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handlePause(subscription)}
            className="flex-1 bg-warning/10 py-2.5 rounded-xl flex-row items-center justify-center"
          >
            <Feather name="pause" size={16} color="#F59E0B" />
            <Text className="text-warning font-medium ml-2">Pause</Text>
          </Pressable>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleCancel(subscription)}
            className="flex-1 bg-error/10 py-2.5 rounded-xl flex-row items-center justify-center"
          >
            <Feather name="x" size={16} color="#EF4444" />
            <Text className="text-error font-medium ml-2">Cancel</Text>
          </Pressable>
        </View>
      )}

      {subscription.status === 'paused' && (
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleResume(subscription)}
          className="bg-success/10 py-2.5 rounded-xl flex-row items-center justify-center"
        >
          <Feather name="play" size={16} color="#22C55E" />
          <Text className="text-success font-medium ml-2">Resume</Text>
        </Pressable>
      )}
    </View>
  );
  const renderPlan = (plan: SubscriptionPlan) => (
    <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={plan.id}
      onPress={() => setSelectedPlan(plan)}
      className="bg-surface rounded-xl p-4 mb-3 border border-border"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground mb-1">{plan.name}</Text>
          <Text className="text-sm text-muted">{plan.vendorName}</Text>
        </View>
        {plan.discountPercent > 0 && (
          <View className="bg-success/10 px-2 py-1 rounded-full">
            <Text className="text-xs font-bold text-success">-{plan.discountPercent}%</Text>
          </View>
        )}
      </View>

      <Text className="text-sm text-foreground mb-3">{plan.description}</Text>

      {/* Items */}
      <View className="bg-muted/5 rounded-xl p-3 mb-3">
        {plan.items.map((item, index) => (
          <View key={index} className="flex-row items-center mb-1">
            <Feather name="check" size={14} color="#22C55E" />
            <Text className="text-xs text-foreground ml-2">
              {item.quantity}x {item.name}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-muted">{getFrequencyLabel(plan.frequency)}</Text>
          <Text className="text-lg font-bold text-primary">K{plan.price.toFixed(2)}</Text>
        </View>
        <View className="bg-primary px-4 py-2 rounded-xl">
          <Text className="text-white font-semibold">Subscribe</Text>
        </View>
      </View>
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
        <Text className="text-lg font-semibold text-foreground">Subscriptions</Text>
        <View className="w-10" />
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mt-4 mb-4">
        {(['my', 'browse'] as TabType[]).map(tab => (
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={tab}
            onPress={() => { setSelectedTab(tab);
              if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
            className={`flex-1 py-2 rounded-xl mr-2 ${ selectedTab === tab ? 'bg-primary' : 'bg-surface border border-border' }`}
          >
            <Text
              className={`text-center text-sm font-medium capitalize ${ selectedTab === tab ? 'text-white' : 'text-muted' }`}
            >
              {tab === 'my' ? 'My Subscriptions' : 'Browse Plans'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#009688" /> }
      >
        {selectedTab === 'my' ? (
          mySubscriptions.length > 0 ? (
            mySubscriptions.map(renderSubscription)
          ) : (
            <View className="items-center justify-center py-16">
              <View className="w-20 h-20 rounded-full bg-muted/10 items-center justify-center mb-4">
                <Feather name="repeat" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-base font-medium text-foreground mb-2">No Subscriptions</Text>
              <Text className="text-sm text-muted text-center px-8">
                Subscribe to vendors for regular deliveries and save money
              </Text>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setSelectedTab('browse')}
                className="mt-6 bg-primary px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Browse Plans</Text>
              </Pressable>
            </View>
          )
        ) : (
          availablePlans.map(renderPlan)
        )}

        {/* Info Card */}
        <View className="bg-primary/5 rounded-xl p-4 mb-6 mt-4">
          <View className="flex-row items-start">
            <Feather name="info" size={18} color="#009688" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-foreground">Why Subscribe?</Text>
              <Text className="text-xs text-muted mt-1">
                Save up to 20% on regular orders, never run out of essentials, and enjoy hassle-free automatic deliveries.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <Modal visible animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-3xl p-6 max-h-[85%]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-foreground">{selectedPlan.name}</Text>
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setSelectedPlan(null)}>
                  <Feather name="x" size={24} color="#6B7280" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-base text-muted mb-4">{selectedPlan.description}</Text>

                <Text className="text-sm font-semibold text-foreground mb-2">What's Included</Text>
                <View className="bg-surface rounded-xl p-4 mb-4">
                  {selectedPlan.items.map((item, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <Feather name="check-circle" size={16} color="#22C55E" />
                      <Text className="text-sm text-foreground ml-2">
                        {item.quantity}x {item.name}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-center justify-between mb-6">
                  <View>
                    <Text className="text-sm text-muted">Delivery</Text>
                    <Text className="text-base font-medium text-foreground">
                      {getFrequencyLabel(selectedPlan.frequency)}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm text-muted text-right">Save</Text>
                    <Text className="text-base font-bold text-success">{selectedPlan.discountPercent}%</Text>
                  </View>
                  <View>
                    <Text className="text-sm text-muted text-right">Price</Text>
                    <Text className="text-xl font-bold text-primary">K{selectedPlan.price}</Text>
                  </View>
                </View>

                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleSubscribe(selectedPlan)}
                  disabled={isLoading}
                  className="bg-primary py-4 rounded-xl mb-4"
                >
                  <Text className="text-center text-white font-semibold text-base">
                    {isLoading ? 'Subscribing...' : 'Subscribe Now'}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

