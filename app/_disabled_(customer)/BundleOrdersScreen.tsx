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
import { useBundlingStore, OrderBundle, BundleStatus } from '@/stores/bundling-store';
import { useToast } from '@/lib/toast-provider';

type TabType = 'my' | 'available';

export default function BundleOrdersScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<OrderBundle | null>(null);
  const [searchArea, setSearchArea] = useState('Kabulonga');
  const { myBundles,
    availableBundles,
    loadMyBundles,
    loadAvailableBundles,
    joinBundle,
    leaveBundle,
    markAsPaid,
    cancelBundle,
    calculateSavings,
    isLoading} = useBundlingStore();

  useEffect(() => { loadMyBundles();
    loadAvailableBundles('Kabulonga'); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    if (selectedTab === 'my') { await loadMyBundles(); } else { await loadAvailableBundles(searchArea); }
    setRefreshing(false); };
  const getStatusColor = (status: BundleStatus) => { const colors: Record<BundleStatus, string> = { open: '#3B82F6',
      ready: '#22C55E',
      in_transit: '#F59E0B',
      delivered: '#10B981',
      cancelled: '#6B7280'};
    return colors[status]; };
  const handleJoinBundle = (bundle: OrderBundle) => { toast.info(
      'Join Bundle',
      `Join this bundle to save K${calculateSavings(50, bundle.participants.length + 1)} on delivery?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join',
          onPress: async () => { try { await joinBundle(bundle.id, 'Current User', '+260977000000', [
                { name: 'Sample Item', quantity: 1, price: 100 },
              ]);
              if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
              toast.success('You have joined the bundle!'); } catch (error) { toast.error('Failed to join bundle. Please try again.'); } }},
      ]
    ); };
  const handleLeaveBundle = (bundle: OrderBundle, participantId: string) => { toast.info(
      'Leave Bundle',
      'Are you sure you want to leave this bundle?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave',
          style: 'destructive',
          onPress: async () => { await leaveBundle(bundle.id, participantId);
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }},
      ]
    ); };
  const handleCancelBundle = (bundle: OrderBundle) => { toast.info(
      'Cancel Bundle',
      'Are you sure you want to cancel this bundle? All participants will be notified.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => { await cancelBundle(bundle.id);
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }},
      ]
    ); };
  const renderBundle = (bundle: OrderBundle, isMine: boolean) => (
    <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={bundle.id}
      onPress={() => setSelectedBundle(bundle)}
      className="bg-surface rounded-xl p-4 mb-3 border border-border"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground mb-1">{bundle.deliveryArea}</Text>
          <Text className="text-sm text-muted">{bundle.deliveryAddress}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(bundle.status)}20` }}
        >
          <Text
            className="text-xs font-medium capitalize"
            style={{ color: getStatusColor(bundle.status) }}
          >
            {bundle.status}
          </Text>
        </View>
      </View>

      {/* Participants */}
      <View className="bg-primary/5 rounded-xl p-3 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Feather name="users" size={16} color="#009688" />
            <Text className="text-sm font-medium text-foreground ml-2">
              {bundle.participants.length}/{bundle.maxParticipants} Participants
            </Text>
          </View>
          <Text className="text-xs text-muted">
            {bundle.maxParticipants - bundle.participants.length} spots left
          </Text>
        </View>
      </View>

      {/* Delivery Info */}
      <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
        <View>
          <Text className="text-xs text-muted">Delivery Date</Text>
          <Text className="text-sm font-medium text-foreground">
            {new Date(bundle.deliveryDate).toLocaleDateString('en-GB', { weekday: 'short',
              day: 'numeric',
              month: 'short'})}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-muted text-right">Delivery Fee</Text>
          <View className="flex-row items-center">
            <Text className="text-sm text-muted line-through mr-2">K50</Text>
            <Text className="text-base font-bold text-success">K{bundle.deliveryFeePerPerson}</Text>
          </View>
        </View>
      </View>

      {/* Savings */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="trending-down" size={16} color="#22C55E" />
          <Text className="text-sm text-success ml-2">
            Save K{calculateSavings(50, bundle.participants.length)} per person
          </Text>
        </View>
        {!isMine && bundle.status === 'open' && (
          <View className="bg-primary px-4 py-1.5 rounded-xl">
            <Text className="text-white font-semibold text-xs">Join</Text>
          </View>
        )}
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
        <Text className="text-lg font-semibold text-foreground">Bundle Orders</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowCreateModal(true)} className="p-2 -mr-2">
          <Feather name="plus" size={24} color="#009688" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mt-4 mb-4">
        {(['my', 'available'] as TabType[]).map(tab => (
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
              {tab === 'my' ? 'My Bundles' : 'Available'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search Bar (for available bundles) */}
      {selectedTab === 'available' && (
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
            <Feather name="search" size={20} color="#6B7280" />
            <TextInput
              value={searchArea}
              onChangeText={setSearchArea}
              placeholder="Search by area..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-foreground"
              onSubmitEditing={() => loadAvailableBundles(searchArea)}
            />
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#009688" /> }
      >
        {selectedTab === 'my' ? (
          myBundles.length > 0 ? (
            myBundles.map(bundle => renderBundle(bundle, true))
          ) : (
            <View className="items-center justify-center py-16">
              <View className="w-20 h-20 rounded-full bg-muted/10 items-center justify-center mb-4">
                <Feather name="package" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-base font-medium text-foreground mb-2">No Bundles Yet</Text>
              <Text className="text-sm text-muted text-center px-8">
                Create or join a bundle to share delivery costs with others in your area
              </Text>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowCreateModal(true)}
                className="mt-6 bg-primary px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Create Bundle</Text>
              </Pressable>
            </View>
          )
        ) : (
          availableBundles.length > 0 ? (
            availableBundles.map(bundle => renderBundle(bundle, false))
          ) : (
            <View className="items-center justify-center py-16">
              <View className="w-20 h-20 rounded-full bg-muted/10 items-center justify-center mb-4">
                <Feather name="search" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-base font-medium text-foreground mb-2">No Bundles Found</Text>
              <Text className="text-sm text-muted text-center px-8">
                No open bundles in your area. Create one to get started!
              </Text>
            </View>
          )
        )}

        {/* Info Card */}
        <View className="bg-primary/5 rounded-xl p-4 mb-6 mt-4">
          <View className="flex-row items-start">
            <Feather name="info" size={18} color="#009688" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-foreground">How Bundling Works</Text>
              <Text className="text-xs text-muted mt-1">
                Join or create bundles with people in your area to split delivery costs. The more people join, the less everyone pays!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bundle Details Modal */}
      {selectedBundle && (
        <Modal visible animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-3xl p-6 max-h-[85%]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-foreground">Bundle Details</Text>
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setSelectedBundle(null)}>
                  <Feather name="x" size={24} color="#6B7280" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="bg-surface rounded-xl p-4 mb-4">
                  <Text className="text-sm text-muted mb-1">Delivery To</Text>
                  <Text className="text-base font-medium text-foreground">{selectedBundle.deliveryAddress}</Text>
                  <Text className="text-sm text-muted mt-2">
                    {new Date(selectedBundle.deliveryDate).toLocaleDateString('en-GB', { weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'})}
                  </Text>
                </View>

                <Text className="text-base font-semibold text-foreground mb-3">
                  Participants ({selectedBundle.participants.length}/{selectedBundle.maxParticipants})
                </Text>

                {selectedBundle.participants.map(participant => (
                  <View key={participant.id} className="bg-surface rounded-xl p-4 mb-2">
                    <View className="flex-row items-center justify-between mb-2">
                      <View>
                        <Text className="text-sm font-medium text-foreground">{participant.name}</Text>
                        <Text className="text-xs text-muted">{participant.phoneNumber}</Text>
                      </View>
                      {participant.hasPaid ? (
                        <View className="bg-success/10 px-2 py-1 rounded-full">
                          <Text className="text-xs font-medium text-success">Paid</Text>
                        </View>
                      ) : (
                        <View className="bg-warning/10 px-2 py-1 rounded-full">
                          <Text className="text-xs font-medium text-warning">Pending</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-muted">K{participant.totalAmount.toFixed(2)}</Text>
                  </View>
                ))}

                <View className="bg-primary/5 rounded-xl p-4 mt-4 mb-6">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-muted">Delivery Fee (Split)</Text>
                    <Text className="text-lg font-bold text-primary">K{selectedBundle.deliveryFeePerPerson}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">You Save</Text>
                    <Text className="text-lg font-bold text-success">
                      K{calculateSavings(50, selectedBundle.participants.length)}
                    </Text>
                  </View>
                </View>

                {selectedBundle.status === 'open' && (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleJoinBundle(selectedBundle)}
                    disabled={isLoading}
                    className="bg-primary py-4 rounded-xl mb-3"
                  >
                    <Text className="text-center text-white font-semibold text-base">
                      {isLoading ? 'Joining...' : 'Join Bundle'}
                    </Text>
                  </Pressable>
                )}

                {selectedBundle.creatorId === 'current-user-id' && selectedBundle.status === 'open' && (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleCancelBundle(selectedBundle)}
                    className="bg-error/10 py-4 rounded-xl"
                  >
                    <Text className="text-center text-error font-semibold text-base">Cancel Bundle</Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Create Bundle Modal */}
      {showCreateModal && (
        <Modal visible animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-foreground">Create Bundle</Text>
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowCreateModal(false)}>
                  <Feather name="x" size={24} color="#6B7280" />
                </Pressable>
              </View>

              <Text className="text-sm text-muted text-center mb-6">
                Create a bundle feature coming soon! You'll be able to invite others in your area to share delivery costs.
              </Text>

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowCreateModal(false)}
                className="bg-primary py-4 rounded-xl"
              >
                <Text className="text-center text-white font-semibold text-base">Got It</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

