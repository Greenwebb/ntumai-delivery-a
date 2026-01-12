// @ts-nocheck
import React, { useState } from 'react';
import { View, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/ui/empty-state';
import { Receipt, ChevronRight, Package } from 'lucide-react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  vendorName: string;
  items: number;
  total: number;
  createdAt: Date;
}

// Mock orders data
const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'NTM-2026-001234',
    status: 'in_transit',
    vendorName: "Mama's Kitchen",
    items: 3,
    total: 165.00,
    createdAt: new Date('2026-01-04T14:30:00'),
  },
  {
    id: 'ord_2',
    orderNumber: 'NTM-2026-001198',
    status: 'preparing',
    vendorName: 'Hungry Lion',
    items: 2,
    total: 95.00,
    createdAt: new Date('2026-01-03T12:00:00'),
  },
  {
    id: 'ord_3',
    orderNumber: 'NTM-2026-001156',
    status: 'delivered',
    vendorName: 'Pizza Hut',
    items: 1,
    total: 145.00,
    createdAt: new Date('2026-01-02T18:30:00'),
  },
];

/**
 * Orders Screen - Customer Tab
 * 
 * Shows list of customer orders with status tracking
 */
export default function OrdersScreen() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to refresh orders
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real app, you would fetch fresh data here
    setRefreshing(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'text-blue-600 bg-blue-50';
      case 'preparing':
      case 'ready':
        return 'text-orange-600 bg-orange-50';
      case 'in_transit':
        return 'text-purple-600 bg-purple-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Pressable
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      onPress={() => router.push({
        pathname: '/(customer)/OrderTrackingScreen',
        params: { orderId: item.id }
      })}
      className="bg-surface rounded-xl p-4 mb-3 border border-border"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground mb-1">
            {item.vendorName}
          </Text>
          <Text className="text-sm text-muted">
            Order #{item.orderNumber}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.muted} />
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Package size={16} color={colors.muted} />
          <Text className="text-sm text-muted ml-2">
            {item.items} {item.items === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <Text className="text-base font-bold text-foreground">
          K{item.total.toFixed(2)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className={cn(
          "px-3 py-1 rounded-full",
          getStatusColor(item.status)
        )}>
          <Text className={cn(
            "text-xs font-semibold",
            getStatusColor(item.status).split(' ')[0]
          )}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
        <Text className="text-xs text-muted">
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );

  if (orders.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={<Receipt size={48} color={colors.primary} strokeWidth={1.5} />}
          title="No Orders Yet"
          description="Your order history will appear here"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="px-6 py-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">My Orders</Text>
        <Text className="text-sm text-muted mt-1">
          Track and manage your orders
        </Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

