// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { OrderStatusNotificationItem } from '@/components/order-status-banner';
import { OrderStatus } from '@/services/order-status-notifications';

interface Notification { id: string;
  orderId: string;
  status: OrderStatus;
  message?: string;
  timestamp: Date;
  isRead: boolean; }

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001',
    orderId: 'order-abc123',
    status: 'delivered',
    message: 'Your order from Mama Tina Kitchen has been delivered!',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 mins ago
    isRead: false},
  { id: 'notif-002',
    orderId: 'order-abc123',
    status: 'arriving',
    message: 'Your tasker John is arriving in 2 minutes.',
    timestamp: new Date(Date.now() - 35 * 60000),
    isRead: true},
  { id: 'notif-003',
    orderId: 'order-abc123',
    status: 'picked_up',
    message: 'John has picked up your order and is on the way.',
    timestamp: new Date(Date.now() - 50 * 60000),
    isRead: true},
  { id: 'notif-004',
    orderId: 'order-abc123',
    status: 'confirmed',
    message: 'Your order has been confirmed by Mama Tina Kitchen.',
    timestamp: new Date(Date.now() - 70 * 60000),
    isRead: true},
  { id: 'notif-005',
    orderId: 'order-def456',
    status: 'delivered',
    message: 'Your parcel has been delivered to Mary.',
    timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
    isRead: true},
  { id: 'notif-006',
    orderId: 'order-ghi789',
    status: 'cancelled',
    message: 'Your order was cancelled. Refund will be processed.',
    timestamp: new Date(Date.now() - 48 * 3600000), // 2 days ago
    isRead: true},
];

export default function NotificationHistoryScreen() { const router = useRouter();
  const colors = useColors();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);
  const handleRefresh = async () => { setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false); };
  const handleMarkAsRead = (notificationId: string) => { setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    ); };
  const handleMarkAllAsRead = () => { setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); };
  const handleNotificationPress = (notification: Notification) => { handleMarkAsRead(notification.id);
    // Navigate to order details
    router.push(`/(customer)/OrderDetailsScreen?orderId=${notification.orderId}`); };
  const renderNotification = ({ item }: { item: Notification }) => (
    <OrderStatusNotificationItem
      orderId={item.orderId}
      status={item.status}
      message={item.message}
      timestamp={item.timestamp}
      isRead={item.isRead}
      onPress={() => handleNotificationPress(item)}
    />
  );
  const renderHeader = () => (
    <View className="px-4 py-3 bg-surface border-b border-border">
      <View className="flex-row items-center justify-between">
        {/* Filter Tabs */}
        <View className="flex-row gap-2">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setFilter('all')}
            className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-primary' : 'bg-background border border-border'}`}
          >
            <Text className={`text-sm font-medium ${filter === 'all' ? 'text-white' : 'text-muted'}`}>
              All
            </Text>
          </Pressable>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full flex-row items-center ${filter === 'unread' ? 'bg-primary' : 'bg-background border border-border'}`}
          >
            <Text className={`text-sm font-medium ${filter === 'unread' ? 'text-white' : 'text-muted'}`}>
              Unread
            </Text>
            {unreadCount > 0 && (
              <View className={`ml-1 px-1.5 py-0.5 rounded-full ${filter === 'unread' ? 'bg-background/20' : 'bg-primary'}`}>
                <Text className={`text-xs font-bold ${filter === 'unread' ? 'text-white' : 'text-white'}`}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Mark All Read */}
        {unreadCount > 0 && (
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleMarkAllAsRead}>
            <Text className="text-sm text-primary font-medium">Mark all read</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4">
        <Feather name="bell-off" size={40} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-semibold text-foreground mb-2">
        {filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
      </Text>
      <Text className="text-sm text-muted text-center px-8">
        {filter === 'unread' 
          ? "You've read all your notifications."
          : "You don't have any notifications yet. Order something to get started!"}
      </Text>
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
        <Text className="text-lg font-semibold text-foreground">Notifications</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="p-2 -mr-2">
          <Feather name="settings" size={24} color="#6B7280" />
        </Pressable>
      </View>

      {renderHeader()}

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#009688"
          /> }
        ListEmptyComponent={renderEmpty}
      />
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

