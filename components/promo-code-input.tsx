// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePromoStore } from '@/stores/promo-store';

interface PromoCodeInputProps {
  orderAmount: number;
  isFirstOrder?: boolean;
  onPromoApplied?: (discount: number) => void;
  onPromoRemoved?: () => void;
}

export function PromoCodeInput({
  orderAmount,
  isFirstOrder = false,
  onPromoApplied,
  onPromoRemoved,
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { appliedPromo, applyPromoCode, removePromoCode } = usePromoStore();

  const handleApply = async () => {
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Please enter a promo code' });
      return;
    }

    setIsApplying(true);
    setMessage(null);

    const result = await applyPromoCode(code.trim(), orderAmount, isFirstOrder);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setCode('');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPromoApplied?.(result.discount || 0);
    } else {
      setMessage({ type: 'error', text: result.message });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsApplying(false);
  };

  const handleRemove = () => {
    removePromoCode();
    setMessage(null);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPromoRemoved?.();
  };

  // Show applied promo
  if (appliedPromo) {
    return (
      <View className="bg-success/10 rounded-xl p-4 border border-success/30">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-success/20 items-center justify-center">
              <Feather name="tag" size={20} color="#22C55E" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-success">{appliedPromo.code}</Text>
              <Text className="text-sm text-success/80">
                {appliedPromo.discountType === 'free_delivery' 
                  ? 'Free delivery applied!'
                  : `You save K${appliedPromo.discountAmount.toFixed(2)}`}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleRemove}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={20} color="#22C55E" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View>
      {/* Input Row */}
      <View className="flex-row gap-2">
        <View className="flex-1 flex-row items-center bg-surface border border-border rounded-xl px-3">
          <Feather name="tag" size={18} color="#9CA3AF" />
          <TextInput
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase());
              setMessage(null);
            }}
            placeholder="Enter promo code"
            autoCapitalize="characters"
            className="flex-1 py-3 ml-2 text-base text-foreground"
            placeholderTextColor="#9CA3AF"
            editable={!isApplying}
          />
        </View>
        <TouchableOpacity
          onPress={handleApply}
          disabled={isApplying || !code.trim()}
          className={`px-5 py-3 rounded-xl items-center justify-center ${
            isApplying || !code.trim() ? 'bg-muted' : 'bg-primary'
          }`}
        >
          {isApplying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold">Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Message */}
      {message && (
        <View className={`flex-row items-center mt-2 ${message.type === 'success' ? 'text-success' : 'text-error'}`}>
          <Feather
            name={message.type === 'success' ? 'check-circle' : 'alert-circle'}
            size={14}
            color={message.type === 'success' ? '#22C55E' : '#EF4444'}
          />
          <Text className={`text-sm ml-1 ${message.type === 'success' ? 'text-success' : 'text-error'}`}>
            {message.text}
          </Text>
        </View>
      )}
    </View>
  );
}

// Available promos list component
export function AvailablePromosList({
  orderAmount,
  isFirstOrder = false,
  onSelectPromo,
}: {
  orderAmount: number;
  isFirstOrder?: boolean;
  onSelectPromo?: (code: string) => void;
}) {
  const { availablePromos, calculateDiscount } = usePromoStore();

  const applicablePromos = availablePromos.filter(promo => {
    if (promo.firstOrderOnly && !isFirstOrder) return false;
    if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) return false;
    return true;
  });

  if (applicablePromos.length === 0) return null;

  return (
    <View className="mt-4">
      <Text className="text-sm font-medium text-foreground mb-2">Available Promos</Text>
      <View className="gap-2">
        {applicablePromos.map((promo) => {
          const discount = calculateDiscount(promo, orderAmount);
          return (
            <TouchableOpacity
              key={promo.id}
              onPress={() => onSelectPromo?.(promo.code)}
              className="flex-row items-center bg-surface rounded-xl p-3 border border-border"
            >
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <Feather name="percent" size={18} color="#009688" />
              </View>
              <View className="flex-1 ml-3">
                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold text-foreground">{promo.code}</Text>
                  <View className="ml-2 px-2 py-0.5 bg-primary/10 rounded">
                    <Text className="text-xs text-primary font-medium">
                      {promo.discountType === 'percentage' 
                        ? `${promo.discountValue}% OFF`
                        : promo.discountType === 'fixed'
                        ? `K${promo.discountValue} OFF`
                        : 'FREE DELIVERY'}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted mt-0.5">{promo.description}</Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-success">-K{discount.toFixed(0)}</Text>
                <Feather name="chevron-right" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
