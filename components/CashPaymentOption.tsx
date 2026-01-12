// @ts-nocheck
/**
 * CashPaymentOption - Cash on Delivery payment selection
 * Default payment method for customers
 */
import React, { useState } from 'react';
import { View, Pressable, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface CashPaymentOptionProps {
  orderTotal: number;
  onPaymentConfirmed: (paymentDetails: {
    method: 'cash';
    changeFor?: number;
    requiresChange: boolean;
  }) => void;
}

export function CashPaymentOption({ orderTotal, onPaymentConfirmed }: CashPaymentOptionProps) {
  const colors = useColors();
  const [requiresChange, setRequiresChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState('');

  const handleConfirm = () => {
    onPaymentConfirmed({
      method: 'cash',
      changeFor: requiresChange && changeAmount ? parseFloat(changeAmount) : undefined,
      requiresChange,
    });
  };

  const isValid = !requiresChange || (changeAmount && parseFloat(changeAmount) >= orderTotal);

  return (
    <View className="bg-surface rounded-xl p-4">
      {/* Cash Payment Header */}
      <View className="flex-row items-center gap-3 mb-4">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.success + '20' }}
        >
          <Feather name="dollar-sign" size={24} color={colors.success} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">Cash on Delivery</Text>
          <Text className="text-sm text-muted">Pay with cash when your order arrives</Text>
        </View>
      </View>

      {/* Order Total */}
      <View className="bg-background rounded-lg p-3 mb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-muted">Total Amount</Text>
          <Text className="text-lg font-bold text-foreground">
            K{orderTotal.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Change Required Option */}
      <Pressable
        onPress={() => setRequiresChange(!requiresChange)}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        className="flex-row items-center gap-3 mb-3"
      >
        <View
          className={cn(
            'w-6 h-6 rounded border-2 items-center justify-center',
            requiresChange ? 'bg-primary border-primary' : 'border-border'
          )}
        >
          {requiresChange && <Feather name="check" size={16} color="#FFFFFF" />}
        </View>
        <Text className="text-sm text-foreground flex-1">
          I need change (paying with larger bill)
        </Text>
      </Pressable>

      {/* Change Amount Input */}
      {requiresChange && (
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Change for amount
          </Text>
          <View className="flex-row items-center bg-background rounded-lg border border-border px-4">
            <Text className="text-lg text-foreground mr-2">K</Text>
            <TextInput
              value={changeAmount}
              onChangeText={setChangeAmount}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              className="flex-1 py-3 text-foreground text-base"
            />
          </View>
          {changeAmount && parseFloat(changeAmount) < orderTotal && (
            <Text className="text-xs text-error mt-1">
              Amount must be greater than order total
            </Text>
          )}
          {changeAmount && parseFloat(changeAmount) >= orderTotal && (
            <Text className="text-xs text-success mt-1">
              Change: K{(parseFloat(changeAmount) - orderTotal).toFixed(2)}
            </Text>
          )}
        </View>
      )}

      {/* Important Notes */}
      <View className="bg-warning/10 rounded-lg p-3 mb-4">
        <View className="flex-row gap-2">
          <Feather name="info" size={16} color={colors.warning} style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-xs text-foreground mb-1">
              <Text className="font-semibold">Important:</Text>
            </Text>
            <Text className="text-xs text-muted">
              • Please have exact change or inform the tasker if you need change{'\n'}
              • Payment is due upon delivery{'\n'}
              • Taskers may not carry large amounts of change
            </Text>
          </View>
        </View>
      </View>

      {/* Confirm Button */}
      <Pressable
        onPress={handleConfirm}
        disabled={!isValid}
        style={({ pressed }) => [
          styles.confirmButton,
          {
            backgroundColor: isValid ? colors.primary : colors.muted,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text className="text-base font-semibold text-white text-center">
          Confirm Cash Payment
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 12,
  },
});
