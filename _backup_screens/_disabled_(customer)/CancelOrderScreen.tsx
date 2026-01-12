// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Button, DestructiveButton, SecondaryButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import { useOrderCancellationStore } from '@/stores/order-cancellation-store';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';
  const CANCELLATION_REASONS = [
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'wrong_order', label: 'Ordered by mistake' },
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'long_wait', label: 'Taking too long' },
  { value: 'vendor_issue', label: 'Issue with vendor' },
  { value: 'other', label: 'Other reason' },
];

// Mock order data - in real app, this would come from route params or order store
const MOCK_ORDER = { id: 'order_123',
  orderNumber: '#ORD-2024-123',
  total: 150,
  status: 'confirmed',
  createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago 
      };

export default function CancelOrderScreen() { const colors = useColors();
  const { getCancellationPolicy, submitCancellation, loadCancellations } =
    useOrderCancellationStore();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const policy = getCancellationPolicy(MOCK_ORDER.status, MOCK_ORDER.createdAt);

  useEffect(() => { loadCancellations(); }, []);
  const handleSubmit = async () =>  {
    if (!selectedReason) { toast.info('Please select a reason for cancellation.');
      return; }

    if (!policy.canCancel) { toast.info('Cannot Cancel', policy.description);
      return; }

    toast.info(
      'Confirm Cancellation',
      `Cancellation fee: K${policy.cancellationFee}\nRefund amount: K${policy.cancellationFee > 0 ? MOCK_ORDER.total - policy.cancellationFee : MOCK_ORDER.total}\n\nAre you sure you want to cancel this order?`,
      [
        { text: 'No, Keep Order', style: 'cancel' },
        { text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => { try  {
    if (Platform.OS !== 'web') { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); }
  const reasonLabel =
                CANCELLATION_REASONS.find((r) => r.value === selectedReason)?.label ||
                selectedReason;

              await submitCancellation(
                MOCK_ORDER.id,
                MOCK_ORDER.orderNumber,
                MOCK_ORDER.total,
                MOCK_ORDER.status,
                MOCK_ORDER.createdAt,
                reasonLabel,
                details.trim() || undefined
              );

              toast.info(
                'Cancellation Requested',
                'Your cancellation request has been submitted. Refund will be processed within 3-5 business days.',
                [
                  { text: 'OK',
                    onPress: () => { // Navigate back to orders screen 
      }},
                ]
              ); } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to cancel order'); } }},
      ]
    ); };
  const handleSelectReason = (value: string) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    setSelectedReason(value); };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView 
        className="flex-1" 
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="gap-1">
          <Text variant="h2" weight="bold" className="text-foreground">
            Cancel Order
          </Text>
          <Text variant="body" className="text-muted">
            Order {MOCK_ORDER.orderNumber}
          </Text>
        </View>

        {/* Order Summary */}
        <Card variant="flat" padding="md">
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text variant="body" className="text-muted">Order Total</Text>
              <Text variant="body" weight="semibold" className="text-foreground">
                K{MOCK_ORDER.total}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text variant="body" className="text-muted">Status</Text>
              <Text variant="body" weight="semibold" className="text-foreground capitalize">
                {MOCK_ORDER.status}
              </Text>
            </View>
          </View>
        </Card>

        {/* Cancellation Policy */}
        <View className={cn(
          'p-4 rounded-xl',
          policy.canCancel ? 'bg-warning/20' : 'bg-error/20'
        )}>
          <Text 
            variant="body" 
            weight="bold" 
            className={policy.canCancel ? 'text-warning mb-2' : 'text-error mb-2'}
          >
            {policy.canCancel ? '⚠️ Cancellation Policy' : '❌ Cannot Cancel'}
          </Text>
          <Text 
            variant="caption" 
            className={policy.canCancel ? 'text-warning mb-3' : 'text-error'}
          >
            {policy.description}
          </Text>

          {policy.canCancel && (
            <View className="gap-2 mt-2">
              <View className="flex-row justify-between">
                <Text variant="caption" weight="medium" className="text-warning">
                  Cancellation Fee:
                </Text>
                <Text variant="caption" weight="bold" className="text-warning">
                  K{policy.cancellationFee}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text variant="caption" weight="medium" className="text-warning">
                  Refund Amount:
                </Text>
                <Text variant="caption" weight="bold" className="text-warning">
                  K{MOCK_ORDER.total - policy.cancellationFee} ({policy.refundPercentage}%)
                </Text>
              </View>
            </View>
          )}
        </View>

        {policy.canCancel && (
          <>
            {/* Cancellation Reasons */}
            <View className="gap-2">
              <Text variant="body" weight="semibold" className="text-foreground">
                Reason for Cancellation *
              </Text>
              {CANCELLATION_REASONS.map((reason) => (
                <Button
                  key={reason.value}
                  onPress={() => handleSelectReason(reason.value)}
                  variant={selectedReason === reason.value ? 'primary' : 'secondary'}
                  size="lg"
                  fullWidth
                  className="justify-start"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className={cn(
                      'w-5 h-5 rounded-full border-2 items-center justify-center',
                      selectedReason === reason.value 
                        ? 'border-white' 
                        : 'border-muted'
                    )}>
                      {selectedReason === reason.value && (
                        <View className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </View>
                    <Text 
                      variant="body" 
                      weight="medium"
                      className={selectedReason === reason.value ? 'text-white' : 'text-foreground'}
                    >
                      {reason.label}
                    </Text>
                  </View>
                </Button>
              ))}
            </View>

            {/* Additional Details */}
            <View className="gap-2">
              <Text variant="body" weight="semibold" className="text-foreground">
                Additional Details (Optional)
              </Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Tell us more about why you're cancelling..."
                multiline
                numberOfLines={4}
                className="bg-surface text-foreground border border-border rounded-xl p-3 min-h-[100px]"
                placeholderTextColor={colors.muted}
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            {/* Action Buttons */}
            <View className="gap-3 mt-4 pb-4">
              <DestructiveButton
                title="Cancel Order"
                onPress={handleSubmit}
                size="lg"
                fullWidth
              />
              <SecondaryButton
                title="Keep My Order"
                onPress={() =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
                  toast.info('Your order will continue as normal.'); }}
                size="lg"
                fullWidth
              />
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

