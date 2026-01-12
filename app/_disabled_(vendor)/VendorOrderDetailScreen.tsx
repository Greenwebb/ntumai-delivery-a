// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Platform, Pressable , Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Clock, CheckCircle, XCircle, Phone, MessageCircle, MapPin, DollarSign, Package, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { isDemoMode } from '@/lib/config/demo-mode';
import { OrderRejectionModal } from '@/components/OrderRejectionModal';
import { useToast } from '@/lib/toast-provider';

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'completed' | 'cancelled';

export default function VendorOrderDetailScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [prepTime, setPrepTime] = useState(20);
  const [loading, setLoading] = useState(true);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => { loadOrderDetails(); }, [orderId]);
  const loadOrderDetails = async () => { try  {
    if (isDemoMode()) { // Mock order data
        const mockOrder = { id: orderId,
          orderNumber: `#${String(orderId).padStart(4, '0')}`,
          customer: { id: '1',
            name: 'Sarah Banda',
            phone: '+260971234567',
            photo: 'https://i.pravatar.cc/150?img=25'
      },
          items: [
            { id: '1', name: 'Nshima with Chicken', quantity: 2, price: 45, notes: 'Extra gravy' },
            { id: '2', name: 'Vegetable Rice', quantity: 1, price: 30, notes: '' },
            { id: '3', name: 'Coca Cola 500ml', quantity: 2, price: 10, notes: '' },
          ],
          subtotal: 140,
          deliveryFee: 20,
          total: 160,
          deliveryAddress: '123 Kabulonga Road, Lusaka',
          paymentMethod: 'Mobile Money',
          orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'pending',
          specialInstructions: 'Please pack separately'};
        setOrder(mockOrder);
        setStatus(mockOrder.status); } } catch (error) { toast.error('Failed to load order details'); } finally { setLoading(false); } };
  const handleAcceptOrder = async () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }

    toast.info(
      'Accept Order',
      `Estimated preparation time: ${prepTime} minutes`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept',
          onPress: async () => { setStatus('accepted');
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
            // Auto-transition to preparing after 2 seconds
            setTimeout(() => { setStatus('preparing'); }, 2000); }},
      ]
    ); };
  const handleRejectOrder = () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }
    setShowRejectionModal(true); };
  const handleConfirmRejection = (reasonId: string, reasonText?: string) => { setStatus('cancelled');
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
    
    // In a real app, send rejection reason to backend
    console.log('Order rejected:', { orderId, reasonId, reasonText });
    
    setShowRejectionModal(false);
    toast.info(
      'Order Rejected',
      `Customer has been notified: "${reasonText}"`,
      [
        { text: 'OK',
          onPress: () => { setTimeout(() => { router.back(); }, 500); }},
      ]
    ); };
  const handleMarkReady = () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }

    toast.info(
      'Order Ready',
      'Mark this order as ready for pickup?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Ready',
          onPress: () => { setStatus('ready');
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
            toast.success('Customer and driver have been notified'); }},
      ]
    ); };
  const handleMarkPickedUp = () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }

    setStatus('picked_up');
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    
    setTimeout(() => { setStatus('completed');
      toast.info('Payment has been added to your earnings'); }, 1000); };
  const getStatusColor = (s: OrderStatus) => { switch (s) { case 'pending':
        return colors.warning;
      case 'accepted':
      case 'preparing':
        return colors.primary;
      case 'ready':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.muted; } };
  const getStatusLabel = (s: OrderStatus) => { switch (s) { case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Picked Up';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled'; } };
  const getTimeSince = (timestamp: string) => { const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`; };

  if (loading) { return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text variant="body" color="muted">Loading order details...</Text>
        </View>
      </ScreenContainer>
    ); }

  if (!order) { return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="h3" weight="bold" className="mb-2">Order Not Found</Text>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-primary px-6 py-3 rounded-xl mt-4"
            onPress={() => router.back()}
          >
            <Text variant="body" weight="bold" className="text-white">Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    ); }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-6 pb-4 flex-row items-center">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <View className="flex-1">
          <Text variant="h2" weight="bold">Order {order.orderNumber}</Text>
          <Text variant="bodySmall" color="muted">{getTimeSince(order.orderTime)}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(status)}20` }}
        >
          <Text variant="bodySmall" weight="bold" style={{ color: getStatusColor(status) }}>
            {getStatusLabel(status)}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Customer Info */}
        <Card className="p-4 mb-4">
          <Text variant="h4" weight="bold" className="mb-3">Customer</Text>
          <View className="flex-row items-center mb-4">
            <Image
              source={{ uri: order.customer.photo }}
              className="w-16 h-16 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text variant="body" weight="bold">{order.customer.name}</Text>
              <Text variant="bodySmall" color="muted">{order.customer.phone}</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center"
              onPress={() => {}}
            >
              <Phone size={18} color="white" />
              <Text variant="bodySmall" weight="bold" className="text-white ml-2">Call</Text>
            </Pressable>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="flex-1 bg-surface py-3 rounded-xl flex-row items-center justify-center border border-border"
              onPress={() => {}}
            >
              <MessageCircle size={18} color={colors.primary} />
              <Text variant="bodySmall" weight="bold" className="text-primary ml-2">Message</Text>
            </Pressable>
          </View>
        </Card>

        {/* Order Items */}
        <Card className="p-4 mb-4">
          <Text variant="h4" weight="bold" className="mb-3">Order Items</Text>
          {order.items.map((item, index) => (
            <View key={item.id} className={`${index > 0 ? 'pt-3 mt-3 border-t border-border' : ''}`}>
              <View className="flex-row justify-between mb-1">
                <Text variant="body" weight="medium" className="flex-1">
                  {item.quantity}x {item.name}
                </Text>
                <Text variant="body" weight="bold">K {item.price * item.quantity}</Text>
              </View>
              {item.notes && (
                <Text variant="bodySmall" color="muted" className="italic">Note: {item.notes}</Text>
              )}
            </View>
          ))}

          {order.specialInstructions && (
            <View className="mt-4 p-3 bg-warning/10 rounded-lg">
              <Text variant="bodySmall" weight="bold" className="text-warning mb-1">
                Special Instructions:
              </Text>
              <Text variant="bodySmall" color="muted">{order.specialInstructions}</Text>
            </View>
          )}

          {/* Total */}
          <View className="mt-4 pt-4 border-t border-border">
            <View className="flex-row justify-between mb-2">
              <Text variant="body" color="muted">Subtotal</Text>
              <Text variant="body">K {order.subtotal}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text variant="body" color="muted">Delivery Fee</Text>
              <Text variant="body">K {order.deliveryFee}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text variant="h4" weight="bold">Total</Text>
              <Text variant="h4" weight="bold" className="text-success">K {order.total}</Text>
            </View>
          </View>
        </Card>

        {/* Delivery Info */}
        <Card className="p-4 mb-4">
          <Text variant="h4" weight="bold" className="mb-3">Delivery Details</Text>
          <View className="flex-row items-start mb-3">
            <MapPin size={20} color={colors.primary} />
            <View className="flex-1 ml-3">
              <Text variant="bodySmall" color="muted" className="mb-1">Delivery Address</Text>
              <Text variant="body">{order.deliveryAddress}</Text>
            </View>
          </View>
          <View className="flex-row items-start">
            <DollarSign size={20} color={colors.success} />
            <View className="flex-1 ml-3">
              <Text variant="bodySmall" color="muted" className="mb-1">Payment Method</Text>
              <Text variant="body">{order.paymentMethod}</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        {status === 'pending' && (
          <View className="mb-6 gap-3">
            {/* Prep Time Selector */}
            <Card className="p-4">
              <Text variant="body" weight="bold" className="mb-3">Preparation Time</Text>
              <View className="flex-row gap-2">
                {[15, 20, 30, 45].map((time) => (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={time}
                    onPress={() => setPrepTime(time)}
                    className={`flex-1 py-3 rounded-xl border ${ prepTime === time
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border' }`}
                  >
                    <Text
                      variant="bodySmall"
                      weight="bold"
                      className={`text-center ${prepTime === time ? 'text-white' : 'text-foreground'}`}
                    >
                      {time} min
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-success py-4 rounded-xl flex-row items-center justify-center"
              onPress={handleAcceptOrder}
            >
              <CheckCircle size={20} color="white" />
              <Text variant="body" weight="bold" className="text-white ml-2">
                Accept Order
              </Text>
            </Pressable>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-error py-4 rounded-xl flex-row items-center justify-center"
              onPress={handleRejectOrder}
            >
              <XCircle size={20} color="white" />
              <Text variant="body" weight="bold" className="text-white ml-2">
                Reject Order
              </Text>
            </Pressable>
          </View>
        )}

        {status === 'preparing' && (
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-success py-4 rounded-xl items-center mb-6"
            onPress={handleMarkReady}
          >
            <Text variant="body" weight="bold" className="text-white">
              Mark as Ready for Pickup
            </Text>
          </Pressable>
        )}

        {status === 'ready' && (
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-primary py-4 rounded-xl items-center mb-6"
            onPress={handleMarkPickedUp}
          >
            <Text variant="body" weight="bold" className="text-white">
              Confirm Pickup
            </Text>
          </Pressable>
        )}

        {(status === 'completed' || status === 'cancelled') && (
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-surface py-4 rounded-xl items-center mb-6 border border-border"
            onPress={() => router.back()}
          >
            <Text variant="body" weight="bold" className="text-primary">
              Back to Orders
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Order Rejection Modal */}
      <OrderRejectionModal
        visible={showRejectionModal}
        orderNumber={order?.orderNumber || ''}
        onClose={() => setShowRejectionModal(false)}
        onReject={handleConfirmRejection}
      />
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

