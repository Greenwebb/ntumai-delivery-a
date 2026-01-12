// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { View, ScrollView, FlatList, Platform, Pressable, Modal, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, X, RefreshCw, Receipt } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { SearchInput } from '@/components/ui/input';
import { PrimaryButton, SecondaryButton, IconButton } from '@/components/ui/button';
import { StatusBadge, EmptyStateView } from '@/components/ui/shared-components';
import { BottomSheet } from '@/components/ui/modal';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';

type OrderStatus = 'delivered' | 'cancelled' | 'refunded' | 'in_progress';
type DateFilter = 'all' | 'week' | 'month' | 'three_months';

interface OrderItem { id: string; name: string; quantity: number; price: number; }
interface Order { id: string; orderNumber: string; status: OrderStatus; createdAt: Date; deliveredAt?: Date; items: OrderItem[]; total: number; vendorName: string; deliveryAddress: string; paymentMethod: string; }
  const MOCK_ORDERS: Order[] = [
  { id: 'ord_1', orderNumber: 'NTM-2026-001234', status: 'delivered', createdAt: new Date('2025-12-28T14:30:00'), deliveredAt: new Date('2025-12-28T15:15:00'), items: [{ id: 'item_1', name: 'Nshima with Beef Stew', quantity: 2, price: 45.00 }, { id: 'item_2', name: 'Chibwabwa', quantity: 1, price: 25.00 }], total: 165.00, vendorName: "Mama's Kitchen", deliveryAddress: '123 Cairo Road, Lusaka', paymentMethod: 'MTN Mobile Money' },
  { id: 'ord_2', orderNumber: 'NTM-2026-001198', status: 'delivered', createdAt: new Date('2025-12-25T12:00:00'), deliveredAt: new Date('2025-12-25T12:45:00'), items: [{ id: 'item_4', name: 'Chicken & Chips', quantity: 1, price: 65.00 }], total: 95.00, vendorName: 'Hungry Lion', deliveryAddress: '45 Great East Road, Lusaka', paymentMethod: 'Visa 4242' },
  { id: 'ord_3', orderNumber: 'NTM-2026-001156', status: 'cancelled', createdAt: new Date('2025-12-22T18:30:00'), items: [{ id: 'item_6', name: 'Pizza Margherita', quantity: 1, price: 120.00 }], total: 145.00, vendorName: 'Pizza Hut', deliveryAddress: '78 Independence Ave, Lusaka', paymentMethod: 'Airtel Money' },
];
  const DATE_FILTERS = [{ id: 'all', label: 'All Time' }, { id: 'week', label: 'This Week' }, { id: 'month', label: 'This Month' }, { id: 'three_months', label: '3 Months' }];

export default function OrderHistoryScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reorderingIds, setReorderingIds] = useState<Set<string>>(new Set());
  const filteredOrders = useMemo(() => { let orders = [...MOCK_ORDERS];
    if (searchQuery) { const query = searchQuery.toLowerCase();
      orders = orders.filter(o => o.orderNumber.toLowerCase().includes(query) || o.vendorName.toLowerCase().includes(query) || o.items.some(i => i.name.toLowerCase().includes(query))); }
  const now = new Date();
    if (dateFilter === 'week') orders = orders.filter(o => o.createdAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    else if (dateFilter === 'month') orders = orders.filter(o => o.createdAt >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    else if (dateFilter === 'three_months') orders = orders.filter(o => o.createdAt >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
    return orders; }, [searchQuery, dateFilter]);
  const getStatusVariant = (status: OrderStatus): 'success' | 'error' | 'warning' | 'info' => { switch (status) { case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'refunded': return 'warning';
      case 'in_progress': return 'info';
      default: return 'info'; } };
  const getStatusLabel = (status: OrderStatus) => { switch (status) { case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      case 'in_progress': return 'In Progress';
      default: return 'Unknown'; } };
  const handleReorder = async (order: Order) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Optimistic UI: Show loading state immediately
    setReorderingIds(prev => new Set(prev).add(order.id));
    toast.info('Adding items to cart...');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      toast.success(`${order.items.length} items added to cart!`);
      router.push('/(customer)/Cart');
    } catch (error) {
      toast.error('Failed to add items to cart');
    } finally {
      setReorderingIds(prev => {
        const next = new Set(prev);
        next.delete(order.id);
        return next;
      });
    }
  };
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };
  const renderOrderItem = ({ item: order }: { item: Order }) => { return (
      <Pressable
        onPress={() => { setSelectedOrder(order); setShowDetailModal(true); }}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="bg-surface mx-4 mb-3 rounded-xl p-4 border border-border"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text variant="body" weight="semibold">{order.vendorName}</Text>
            <Text variant="caption" className="text-muted">{order.orderNumber}</Text>
          </View>
          <StatusBadge status={getStatusVariant(order.status)} label={getStatusLabel(order.status)} />
        </View>
        
        <View className="mb-3">
          <Text variant="caption" className="text-muted" numberOfLines={1}>
            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
          </Text>
        </View>
        
        <View className="flex-row items-center justify-between pt-3 border-t border-border">
          <View>
            <Text variant="caption" className="text-muted">{formatDate(order.createdAt)}</Text>
            <Text variant="body" weight="bold">K{order.total.toFixed(2)}</Text>
          </View>
          {order.status === 'delivered' && (
            <SecondaryButton
              title="Reorder"
              onPress={() => handleReorder(order)}
              size="sm"
              loading={reorderingIds.has(order.id)}
              disabled={reorderingIds.has(order.id)}
              leftIcon={<RefreshCw size={16} color={colors.primary} />}
            />
          )}
        </View>
      </Pressable>
    ); };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <IconButton
          iconOnly={<ChevronLeft size={24} color={colors.foreground} />}
          onPress={() => router.back()}
          variant="ghost"
        />
        <Text variant="h3" weight="semibold">Order History</Text>
        <View className="w-10" />
      </View>

      {/* Search */}
      <View className="px-4 py-3">
        <SearchInput
          placeholder="Search orders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Date Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-3" contentContainerStyle={{ gap: 8 }}>
        {DATE_FILTERS.map(filter => (
          <Pressable
            key={filter.id}
            onPress={() => setDateFilter(filter.id as DateFilter)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className={cn(
              'px-4 py-2 rounded-full',
              dateFilter === filter.id ? 'bg-primary' : 'bg-surface border border-border'
            )}
          >
            <Text
              variant="caption"
              weight="medium"
              className={dateFilter === filter.id ? 'text-white' : 'text-muted'}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={ <EmptyStateView
            icon={<Receipt size={64} color={colors.muted} />}
            title="No orders found"
            description="Try adjusting your filters"
          /> }
      />

      {/* Order Detail Modal */}
      <BottomSheet
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <View className="gap-4 pb-6">
            {/* Vendor Info */}
            <View className="bg-surface rounded-xl p-4">
              <Text variant="h3" weight="bold">{selectedOrder.vendorName}</Text>
              <Text variant="caption" className="text-muted mt-1">{selectedOrder.orderNumber}</Text>
              <Text variant="caption" className="text-muted">{formatDate(selectedOrder.createdAt)}</Text>
            </View>

            {/* Items */}
            <View>
              <Text variant="body" weight="semibold" className="mb-3">Items</Text>
              <View className="bg-surface rounded-xl p-4 gap-2">
                {selectedOrder.items.map((item, index) => (
                  <View key={item.id} className={cn('flex-row items-center justify-between py-2', index < selectedOrder.items.length - 1 && 'border-b border-border')}>
                    <View className="flex-1">
                      <Text variant="body" weight="medium">{item.name}</Text>
                      <Text variant="caption" className="text-muted">Qty: {item.quantity}</Text>
                    </View>
                    <Text variant="body" weight="semibold">K{(item.price * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Total */}
            <View className="bg-primary/10 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <Text variant="body" weight="semibold">Total</Text>
                <Text variant="h2" weight="bold" className="text-primary">K{selectedOrder.total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Delivery Address */}
            <View>
              <Text variant="body" weight="semibold" className="mb-3">Delivery Address</Text>
              <View className="bg-surface rounded-xl p-4">
                <Text variant="body">{selectedOrder.deliveryAddress}</Text>
              </View>
            </View>

            {/* Payment Method */}
            <View>
              <Text variant="body" weight="semibold" className="mb-3">Payment Method</Text>
              <View className="bg-surface rounded-xl p-4">
                <Text variant="body">{selectedOrder.paymentMethod}</Text>
              </View>
            </View>

            {/* Reorder Button */}
            {selectedOrder.status === 'delivered' && (
              <PrimaryButton
                title="Reorder"
                onPress={() => { setShowDetailModal(false); handleReorder(selectedOrder); }}
                leftIcon={<RefreshCw size={20} color="#fff" />}
              />
            )}
          </View>
        )}
      </BottomSheet>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

