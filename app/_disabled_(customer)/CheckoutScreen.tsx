// @ts-nocheck
import { WorkflowStepper } from '@/components/workflow-stepper';
import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore, useOrderStore, useUserStore } from '@/src/store';
import { ChevronLeft, CreditCard, DollarSign, Plus, CheckCircle } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { PrimaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { ScreenContainer } from '@/components/screen-container';

export default function CheckoutScreen() { const router = useRouter();
  const colors = useColors();
  const { items, totalPrice, deliveryFee } = useCartStore();
  const { createOrder, isLoading } = useOrderStore();
  const { addresses, getAddresses } = useUserStore();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for out-of-stock items
  const outOfStockItems = items.filter(item => item.product.inStock === false);
  const hasOutOfStockItems = outOfStockItems.length > 0;

  useEffect(() => { getAddresses(); }, []);
  const tax = Math.round(totalPrice * 0.1);
  const total = totalPrice + deliveryFee + tax;
  const handlePlaceOrder = async () =>  {
    if (hasOutOfStockItems) {
      alert('Some items in your cart are out of stock. Please remove them before placing your order.');
      return;
    }
    if (!selectedAddress) { alert('Please select a delivery address');
      return; }

    setIsProcessing(true);
    try { const address = addresses.find(a => a.id === selectedAddress);
      if (!address) return;
  const order = await createOrder({ items,
        deliveryAddress: address,
        paymentMethod: selectedPayment,
        totalAmount: total,
        deliveryFee});

      if (order) { router.replace(`/(customer)/OrderTracking?orderId=${order.id}`); } } finally { setIsProcessing(false); } };

  if (!addresses.length) { return (
      <ScreenContainer>
        <View className="flex-row items-center px-6 py-4 border-b border-border">
          <IconButton
            iconOnly={<ChevronLeft size={24} color={colors.foreground} />}
            onPress={() => router.back()}
            variant="ghost"
          />
          <Text variant="h2" weight="bold" className="ml-2">Checkout</Text>
        </View>
        <LoadingState message="Loading addresses..." />
      </ScreenContainer>
    ); }

  return (
    <ScreenContainer>
      {/* Workflow Stepper - Step 3: Payment */}
      <WorkflowStepper
        currentStep={3}
        steps={["Select Items", "Review Order", "Payment"]}
      />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <IconButton
          iconOnly={<ChevronLeft size={24} color={colors.foreground} />}
          onPress={() => router.back()}
          variant="ghost"
        />
        <Text variant="h2" weight="bold" className="ml-2">Checkout</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Out of Stock Warning */}
        {hasOutOfStockItems && (
          <View className="mx-6 mt-4 p-4 bg-error/10 rounded-xl border border-error/30">
            <Text variant="body" weight="semibold" className="text-error mb-1">
              Some items are out of stock
            </Text>
            <Text variant="bodySmall" color="muted">
              {outOfStockItems.map(item => item.product.name).join(', ')} - Please remove before checkout
            </Text>
          </View>
        )}

        {/* Delivery Address */}
        <View className="px-6 py-6 border-b border-border">
          <Text variant="h3" weight="bold" className="mb-4">Delivery Address</Text>
          
          <View className="gap-3">
            {addresses.map(address => (
              <Pressable
                key={address.id}
                onPress={() => setSelectedAddress(address.id)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className={cn(
                  'border-2 rounded-xl p-4 flex-row items-center',
                  selectedAddress === address.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface'
                )}
              >
                <View className="flex-1">
                  <Text variant="body" weight="semibold" className="mb-1">
                    {address.type.toUpperCase()}
                  </Text>
                  <Text variant="body" className="text-muted">
                    {address.street}, {address.city}
                  </Text>
                  <Text variant="caption" className="text-muted">
                    {address.state}, {address.zipCode}
                  </Text>
                </View>
                {selectedAddress === address.id && (
                  <CheckCircle size={24} color={colors.primary} />
                )}
              </Pressable>
            ))}

            <OutlineButton
              title="Add New Address"
              onPress={() => router.push('/(customer)/AddLocation')}
              leftIcon={<Plus size={20} color={colors.primary} />}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View className="px-6 py-6 border-b border-border">
          <Text variant="h3" weight="bold" className="mb-4">Payment Method</Text>
          
          <View className="gap-3">
            <Pressable
              onPress={() => setSelectedPayment('card')}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className={cn(
                'border-2 rounded-xl p-4 flex-row items-center',
                selectedPayment === 'card'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface'
              )}
            >
              <CreditCard 
                size={24} 
                color={selectedPayment === 'card' ? colors.primary : colors.muted} 
              />
              <View className="flex-1 ml-4">
                <Text variant="body" weight="semibold">Credit/Debit Card</Text>
                <Text variant="caption" className="text-muted">Visa, Mastercard</Text>
              </View>
              {selectedPayment === 'card' && (
                <CheckCircle size={24} color={colors.primary} />
              )}
            </Pressable>

            <Pressable
              onPress={() => setSelectedPayment('cash')}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className={cn(
                'border-2 rounded-xl p-4 flex-row items-center',
                selectedPayment === 'cash'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface'
              )}
            >
              <DollarSign 
                size={24} 
                color={selectedPayment === 'cash' ? colors.primary : colors.muted} 
              />
              <View className="flex-1 ml-4">
                <Text variant="body" weight="semibold">Cash on Delivery</Text>
                <Text variant="caption" className="text-muted">Pay when order arrives</Text>
              </View>
              {selectedPayment === 'cash' && (
                <CheckCircle size={24} color={colors.primary} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Order Summary */}
        <View className="px-6 py-6">
          <Text variant="h3" weight="bold" className="mb-4">Order Summary</Text>
          
          <View className="bg-surface rounded-xl p-4 gap-3">
            <View className="flex-row items-center justify-between py-2">
              <Text variant="h3" weight="bold">Total Amount</Text>
              <Text variant="h2" weight="bold" className="text-primary">{total}K</Text>
            </View>
            <Text variant="caption" className="text-muted">Includes delivery</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="px-6 py-4 border-t border-border bg-background">
        <PrimaryButton
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={isProcessing || isLoading}
          disabled={!selectedAddress}
          size="lg"
        />
      </View>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

