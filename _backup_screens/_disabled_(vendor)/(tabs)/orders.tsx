// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import { ClipboardList, Clock, CheckCircle, XCircle, ChefHat, Package } from 'lucide-react-native';
import { vendorOrderService } from '@/lib/services/vendor-order-service';

export default function VendorOrdersScreen() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Subscribe to order updates
    const unsubscribe = vendorOrderService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const tabs = [
    { id: 'all', label: 'All', count: orders.length },
    { 
      id: 'pending', 
      label: 'Pending', 
      count: orders.filter(o => o.status === 'pending').length 
    },
    { 
      id: 'preparing', 
      label: 'Preparing', 
      count: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length 
    },
    { 
      id: 'ready', 
      label: 'Ready', 
      count: orders.filter(o => o.status === 'ready').length 
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending', color: colors.warning };
      case 'accepted':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle, label: 'Accepted', color: colors.primary };
      case 'preparing':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: ChefHat, label: 'Preparing', color: colors.primary };
      case 'ready':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: Package, label: 'Ready', color: colors.success };
      case 'picked_up':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle, label: 'Picked Up', color: '#9333ea' };
      case 'completed':
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle, label: 'Completed', color: colors.muted };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Cancelled', color: colors.error };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: 'Unknown', color: colors.muted };
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'preparing') {
      return orders.filter(o => o.status === 'preparing' || o.status === 'accepted');
    }
    return orders.filter(o => o.status === activeTab);
  };

  const filteredOrders = getFilteredOrders();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const updatedOrders = await vendorOrderService.getOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/(vendor)/VendorOrderDetailScreen?orderId=${orderId}`);
  };

  const getTimeSince = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const renderOrder = (order: any) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
      <TouchableOpacity
        key={order.id}
        onPress={() => handleOrderPress(order.id)}
        activeOpacity={0.7}
      >
        <Card className="mb-3 p-4">
          <View className="flex-row items-start justify-between mb-3">
            <View>
              <Text variant="h4" weight="bold">{order.orderNumber}</Text>
              <Text variant="bodySmall" color="muted">{order.customer.name}</Text>
            </View>
            <View
              className="flex-row items-center px-3 py-1 rounded-full"
              style={{ backgroundColor: `${statusConfig.color}20` }}
            >
              <StatusIcon size={14} color={statusConfig.color} />
              <Text
                variant="bodySmall"
                weight="bold"
                className="ml-1"
                style={{ color: statusConfig.color }}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <View className="bg-surface rounded-lg p-3 mb-3">
            {order.items.slice(0, 2).map((item: any, index: number) => (
              <Text key={item.id} variant="body" className="mb-1">
                {item.quantity}x {item.name}
              </Text>
            ))}
            {order.items.length > 2 && (
              <Text variant="bodySmall" color="muted" className="italic">
                +{order.items.length - 2} more items
              </Text>
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <Text variant="bodySmall" color="muted">{getTimeSince(order.orderTime)}</Text>
            <Text variant="h4" weight="bold" className="text-success">K {order.total}</Text>
          </View>

          {order.prepTime && (order.status === 'accepted' || order.status === 'preparing') && (
            <View className="mt-3 flex-row items-center">
              <Clock size={14} color={colors.primary} />
              <Text variant="bodySmall" color="muted" className="ml-2">
                Prep time: {order.prepTime} minutes
              </Text>
            </View>
          )}

          {/* Quick Actions */}
          {order.status === 'pending' && (
            <TouchableOpacity
              className="bg-primary py-3 rounded-xl mt-3"
              onPress={() => handleOrderPress(order.id)}
            >
              <Text variant="body" weight="bold" className="text-white text-center">
                View & Accept
              </Text>
            </TouchableOpacity>
          )}
          {order.status === 'preparing' && (
            <TouchableOpacity
              className="bg-success py-3 rounded-xl mt-3"
              onPress={() => handleOrderPress(order.id)}
            >
              <Text variant="body" weight="bold" className="text-white text-center">
                Mark Ready
              </Text>
            </TouchableOpacity>
          )}
          {order.status === 'ready' && (
            <TouchableOpacity
              className="bg-surface py-3 rounded-xl mt-3 border border-border"
              onPress={() => handleOrderPress(order.id)}
            >
              <Text variant="body" weight="bold" className="text-primary text-center">
                Confirm Pickup
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View className="px-4 pt-6 pb-4">
        <Text variant="h1" weight="bold">Orders</Text>
        <Text variant="body" color="muted" className="mt-1">
          Manage your incoming orders
        </Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`mr-2 px-4 py-2 rounded-full ${
              activeTab === tab.id ? 'bg-primary' : 'bg-surface border border-border'
            }`}
          >
            <Text
              variant="bodySmall"
              weight="medium"
              className={activeTab === tab.id ? 'text-white' : 'text-muted'}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrder)
        ) : (
          <View className="items-center justify-center py-16">
            <ClipboardList size={48} color={colors.muted} strokeWidth={1.5} />
            <Text variant="h4" weight="medium" color="muted" className="mt-4">
              No {activeTab === 'all' ? '' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders
            </Text>
            <Text variant="body" color="muted" className="mt-2 text-center px-8">
              {activeTab === 'pending'
                ? 'New orders will appear here when customers place them'
                : activeTab === 'preparing'
                ? 'Orders you accept will appear here'
                : activeTab === 'ready'
                ? 'Orders marked as ready will appear here'
                : 'Orders will appear here when customers place them'}
            </Text>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

