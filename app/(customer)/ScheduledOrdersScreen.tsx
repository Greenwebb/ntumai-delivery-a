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
import { useScheduledOrdersStore, ScheduledOrder } from '@/stores/scheduled-orders-store';
import { useToast } from '@/lib/toast-provider';

export default function ScheduledOrdersScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { scheduledOrders,
    isLoading,
    loadScheduledOrders,
    cancelScheduledOrder,
    getUpcomingOrders,
    getPastOrders} = useScheduledOrdersStore();

  useEffect(() => { loadScheduledOrders(); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    await loadScheduledOrders();
    setRefreshing(false); };
  const handleCancelOrder = (orderId: string) => { toast.info(
      'Cancel Scheduled Order',
      'Are you sure you want to cancel this scheduled order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => { await cancelScheduledOrder(orderId);
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } }},
      ]
    ); };
  const upcomingOrders = getUpcomingOrders();
  const pastOrders = getPastOrders();
  const displayOrders = activeTab === 'upcoming' ? upcomingOrders : pastOrders;
  const formatDate = (date: Date) => { const today = new Date();
  const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  const orderDate = new Date(date);
    
    if (orderDate.toDateString() === today.toDateString()) { return 'Today'; } else if (orderDate.toDateString() === tomorrow.toDateString()) { return 'Tomorrow'; } else { return orderDate.toLocaleDateString('en-GB', { weekday: 'short', 
        month: 'short', 
        day: 'numeric' }); } };
  const getRecurringLabel = (order: ScheduledOrder) =>  {
    if (!order.recurring) return null;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (order.recurringFrequency === 'daily') { return 'Daily'; } else if (order.recurringFrequency === 'weekly' && order.recurringDays) { const days = order.recurringDays.map(d => dayNames[d]).join(', ');
      return `Weekly: ${days}`; } else if (order.recurringFrequency === 'monthly') { return 'Monthly'; }
    return 'Recurring'; };
  const renderOrderCard = (order: ScheduledOrder) => { const isUpcoming = order.status === 'scheduled';
  const recurringLabel = getRecurringLabel(order);

    return (
      <View key={order.id} className="bg-surface rounded-xl p-4 mb-3 border border-border">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className={`w-10 h-10 rounded-full items-center justify-center ${ order.status === 'scheduled' ? 'bg-primary/10' :
              order.status === 'completed' ? 'bg-success/10' :
              'bg-muted/10' }`}>
              <Feather 
                name={order.orderType === 'marketplace' ? 'shopping-bag' : 'package'} 
                size={20} 
                color={ order.status === 'scheduled' ? '#009688' :
                  order.status === 'completed' ? '#22C55E' :
                  '#9CA3AF' }
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-foreground">
                {order.orderType === 'marketplace' ? 'Marketplace Order' : 'Delivery Task'}
              </Text>
              <Text className="text-sm text-muted">Order #{order.id.slice(-6)}</Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${ order.status === 'scheduled' ? 'bg-primary/10' :
            order.status === 'completed' ? 'bg-success/10' :
            'bg-muted/10' }`}>
            <Text className={`text-xs font-medium capitalize ${ order.status === 'scheduled' ? 'text-primary' :
              order.status === 'completed' ? 'text-success' :
              'text-muted' }`}>
              {order.status}
            </Text>
          </View>
        </View>

        {/* Date & Time */}
        <View className="flex-row items-center mb-2">
          <Feather name="calendar" size={16} color="#6B7280" />
          <Text className="text-sm text-foreground ml-2">
            {formatDate(order.scheduledDate)} at {order.scheduledTime}
          </Text>
        </View>

        {/* Recurring Badge */}
        {recurringLabel && (
          <View className="flex-row items-center mb-2">
            <Feather name="repeat" size={16} color="#009688" />
            <Text className="text-sm text-primary ml-2">{recurringLabel}</Text>
          </View>
        )}

        {/* Delivery Address */}
        <View className="flex-row items-start mb-2">
          <Feather name="map-pin" size={16} color="#6B7280" className="mt-0.5" />
          <Text className="text-sm text-muted ml-2 flex-1">{order.deliveryAddress}</Text>
        </View>

        {/* Items Count */}
        {order.items && order.items.length > 0 && (
          <View className="flex-row items-center mb-3">
            <Feather name="shopping-cart" size={16} color="#6B7280" />
            <Text className="text-sm text-muted ml-2">
              {order.items.length} item{order.items.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Notes */}
        {order.notes && (
          <View className="bg-warning/5 rounded-lg p-2 mb-3">
            <Text className="text-xs text-muted">{order.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-3 border-t border-border">
          <Text className="text-lg font-bold text-foreground">K{order.totalAmount.toFixed(2)}</Text>
          {isUpcoming ? (
            <View className="flex-row gap-2">
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push(`/(customer)/EditScheduledOrderScreen?orderId=${order.id}`)}
                className="px-4 py-2 bg-primary/10 rounded-lg"
              >
                <Text className="text-sm font-medium text-primary">Edit</Text>
              </Pressable>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleCancelOrder(order.id)}
                className="px-4 py-2 bg-error/10 rounded-lg"
              >
                <Text className="text-sm font-medium text-error">Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => {/* Reorder logic */}}
              className="px-4 py-2 bg-primary rounded-lg"
            >
              <Text className="text-sm font-medium text-white">Reorder</Text>
            </Pressable>
          )}
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
        <Text className="text-lg font-semibold text-foreground">Scheduled Orders</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(customer)/ScheduleDeliveryScreen')}
          className="p-2 -mr-2"
        >
          <Feather name="plus" size={24} color="#009688" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#009688" /> }
      >
        {/* Info Banner */}
        <View className="bg-primary/10 mx-4 mt-4 rounded-xl p-4">
          <View className="flex-row items-start">
            <Feather name="clock" size={20} color="#009688" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-primary">Schedule Your Orders</Text>
              <Text className="text-xs text-primary/80 mt-1">
                Plan ahead and schedule deliveries for specific dates and times. Perfect for meal planning!
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-4 mt-4 gap-3">
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-primary">{upcomingOrders.length}</Text>
            <Text className="text-xs text-muted">Upcoming</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-success">{pastOrders.filter(o => o.status === 'completed').length}</Text>
            <Text className="text-xs text-muted">Completed</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-foreground">
              {scheduledOrders.filter(o => o.recurring).length}
            </Text>
            <Text className="text-xs text-muted">Recurring</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 mt-4 gap-2">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 rounded-xl ${activeTab === 'upcoming' ? 'bg-primary' : 'bg-surface border border-border'}`}
          >
            <Text className={`text-center text-sm font-medium ${activeTab === 'upcoming' ? 'text-white' : 'text-muted'}`}>
              Upcoming ({upcomingOrders.length})
            </Text>
          </Pressable>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setActiveTab('past')}
            className={`flex-1 py-3 rounded-xl ${activeTab === 'past' ? 'bg-primary' : 'bg-surface border border-border'}`}
          >
            <Text className={`text-center text-sm font-medium ${activeTab === 'past' ? 'text-white' : 'text-muted'}`}>
              Past ({pastOrders.length})
            </Text>
          </Pressable>
        </View>

        {/* Orders List */}
        <View className="px-4 mt-4 mb-6">
          {displayOrders.length > 0 ? (
            displayOrders.map(renderOrderCard)
          ) : (
            <View className="bg-surface rounded-xl p-8 items-center border border-border">
              <View className="w-20 h-20 rounded-full bg-muted/10 items-center justify-center mb-4">
                <Feather name="calendar" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-semibold text-foreground mb-2">
                {activeTab === 'upcoming' ? 'No Upcoming Orders' : 'No Past Orders'}
              </Text>
              <Text className="text-sm text-muted text-center mb-6">
                {activeTab === 'upcoming' 
                  ? 'Schedule your first order to see it here.'
                  : 'Your completed orders will appear here.'}
              </Text>
              {activeTab === 'upcoming' && (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(customer)/ScheduleDeliveryScreen')}
                  className="bg-primary px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-semibold">Schedule Order</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

