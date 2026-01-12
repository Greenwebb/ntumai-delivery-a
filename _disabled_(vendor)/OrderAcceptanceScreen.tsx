// @ts-nocheck
/**
 * OrderAcceptanceScreen - Vendor order acceptance workflow
 * Allows vendors to accept/reject incoming orders with preparation time estimates
 */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

interface IncomingOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  orderTime: string;
  paymentMethod: string;
}

export default function OrderAcceptanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useColors();
  
  const [order, setOrder] = useState<IncomingOrder | null>(null);
  const [preparationTime, setPreparationTime] = useState(15); // minutes
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load order details from API
    loadOrderDetails();
  }, [params.orderId]);

  const loadOrderDetails = async () => {
    // Mock data - replace with actual API call
    setOrder({
      id: params.orderId as string || 'ORD-12345',
      customerName: 'John Doe',
      customerPhone: '+260 97 123 4567',
      items: [
        {
          id: '1',
          name: 'Chicken Burger',
          quantity: 2,
          price: 45,
          specialInstructions: 'No onions'
        },
        {
          id: '2',
          name: 'French Fries',
          quantity: 1,
          price: 20
        }
      ],
      subtotal: 110,
      deliveryFee: 15,
      total: 125,
      deliveryAddress: '123 Main Street, Lusaka',
      orderTime: new Date().toISOString(),
      paymentMethod: 'Mobile Money'
    });
  };

  const handleAcceptOrder = async () => {
    if (!order) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    try {
      // Call API to accept order
      // await acceptOrder(order.id, preparationTime);
      
      Alert.alert(
        'Order Accepted',
        `Preparation time: ${preparationTime} minutes`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectOrder = () => {
    if (!order) return;

    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setIsProcessing(true);
            
            try {
              // Call API to reject order
              // await rejectOrder(order.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject order. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const adjustPreparationTime = (delta: number) => {
    setPreparationTime(prev => Math.max(5, Math.min(120, prev + delta)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!order) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Loading order...</Text>
      </ScreenContainer>
    );
  }

  const timeElapsed = Math.floor((Date.now() - new Date(order.orderTime).getTime()) / 1000 / 60);

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View className="p-6 bg-primary/10 border-b border-border">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-foreground">New Order</Text>
            <View className={cn(
              "px-3 py-1 rounded-full",
              timeElapsed < 2 ? "bg-success/20" : timeElapsed < 5 ? "bg-warning/20" : "bg-error/20"
            )}>
              <Text className={cn(
                "text-xs font-semibold",
                timeElapsed < 2 ? "text-success" : timeElapsed < 5 ? "text-warning" : "text-error"
              )}>
                {timeElapsed} min ago
              </Text>
            </View>
          </View>
          <Text className="text-sm text-muted">Order #{order.id}</Text>
        </View>

        {/* Customer Info */}
        <View className="p-6 border-b border-border">
          <Text className="text-base font-semibold text-foreground mb-3">Customer Details</Text>
          <View className="flex-row items-center mb-2">
            <Feather name="user" size={16} color={colors.muted} />
            <Text className="text-sm text-foreground ml-2">{order.customerName}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Feather name="phone" size={16} color={colors.muted} />
            <Text className="text-sm text-foreground ml-2">{order.customerPhone}</Text>
          </View>
          <View className="flex-row items-start">
            <Feather name="map-pin" size={16} color={colors.muted} style={{ marginTop: 2 }} />
            <Text className="text-sm text-foreground ml-2 flex-1">{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View className="p-6 border-b border-border">
          <Text className="text-base font-semibold text-foreground mb-4">Order Items</Text>
          {order.items.map((item, index) => (
            <View key={item.id} className={cn("mb-4", index < order.items.length - 1 && "pb-4 border-b border-border")}>
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">
                    {item.quantity}x {item.name}
                  </Text>
                  {item.specialInstructions && (
                    <Text className="text-xs text-warning mt-1">
                      Note: {item.specialInstructions}
                    </Text>
                  )}
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  K{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          {/* Order Summary */}
          <View className="mt-4 pt-4 border-t border-border">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">Subtotal</Text>
              <Text className="text-sm text-foreground">K{order.subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">Delivery Fee</Text>
              <Text className="text-sm text-foreground">K{order.deliveryFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-border">
              <Text className="text-base font-bold text-foreground">Total</Text>
              <Text className="text-base font-bold text-primary">K{order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Preparation Time */}
        <View className="p-6">
          <Text className="text-base font-semibold text-foreground mb-4">Preparation Time</Text>
          <View className="flex-row items-center justify-center bg-surface rounded-2xl p-4">
            <Pressable
              onPress={() => adjustPreparationTime(-5)}
              disabled={preparationTime <= 5}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              className={cn(
                "w-12 h-12 rounded-full items-center justify-center",
                preparationTime <= 5 ? "bg-muted/20" : "bg-primary"
              )}
            >
              <Feather name="minus" size={24} color={preparationTime <= 5 ? colors.muted : "white"} />
            </Pressable>

            <View className="mx-8 items-center">
              <Text className="text-4xl font-bold text-primary">{preparationTime}</Text>
              <Text className="text-sm text-muted mt-1">minutes</Text>
            </View>

            <Pressable
              onPress={() => adjustPreparationTime(5)}
              disabled={preparationTime >= 120}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              className={cn(
                "w-12 h-12 rounded-full items-center justify-center",
                preparationTime >= 120 ? "bg-muted/20" : "bg-primary"
              )}
            >
              <Feather name="plus" size={24} color={preparationTime >= 120 ? colors.muted : "white"} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleRejectOrder}
            disabled={isProcessing}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="flex-1 py-4 rounded-xl bg-error/10 border border-error items-center"
          >
            <Text className="text-error font-semibold">Reject</Text>
          </Pressable>

          <Pressable
            onPress={handleAcceptOrder}
            disabled={isProcessing}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
            className="flex-[2] py-4 rounded-xl bg-success items-center"
          >
            <Text className="text-white font-bold text-base">
              {isProcessing ? 'Processing...' : 'Accept Order'}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

