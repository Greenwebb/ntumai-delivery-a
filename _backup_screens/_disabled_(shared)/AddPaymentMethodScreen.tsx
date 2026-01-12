// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import * as Haptics from 'expo-haptics';
export default function AddPaymentMethodScreen() { const router = useRouter();
  const colors = useColors();
  const [paymentType, setPaymentType] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const paymentTypes = [
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'mobile', label: 'Mobile Money', icon: Smartphone },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];
  const handleSave = () =>  {
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    // TODO: Save payment method to store/API
    router.back(); };

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
          <Text variant="h2" weight="bold">Add Payment Method</Text>
          <Text variant="bodySmall" color="muted">Save a new payment option</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Payment Type */}
        <View className="mb-4">
          <Text variant="body" weight="medium" className="mb-3">Payment Type</Text>
          <View className="flex-row gap-3">
            {paymentTypes.map((type) => { const Icon = type.icon;
              return (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={type.id}
                  onPress={() => setPaymentType(type.id)}
                  className={`flex-1 p-4 rounded-xl border-2 items-center ${ paymentType === type.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface' }`}
                >
                  <Icon
                    size={24}
                    color={paymentType === type.id ? colors.primary : colors.muted}
                  />
                  <Text
                    variant="bodySmall"
                    weight="medium"
                    className={`mt-2 ${paymentType === type.id ? 'text-primary' : 'text-muted'}`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ); })}
          </View>
        </View>

        {/* Card Payment Fields */}
        {paymentType === 'card' && (
          <>
            <Card className="p-4 mb-3">
              <Text variant="body" weight="medium" className="mb-2">Card Number</Text>
              <TextInput
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
                className="bg-surface rounded-lg px-4 py-3 text-base"
                placeholderTextColor={colors.muted}
              />
            </Card>

            <Card className="p-4 mb-3">
              <Text variant="body" weight="medium" className="mb-2">Cardholder Name</Text>
              <TextInput
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
                className="bg-surface rounded-lg px-4 py-3 text-base"
                placeholderTextColor={colors.muted}
              />
            </Card>

            <View className="flex-row gap-3 mb-3">
              <Card className="flex-1 p-4">
                <Text variant="body" weight="medium" className="mb-2">Expiry Date</Text>
                <TextInput
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  keyboardType="number-pad"
                  maxLength={5}
                  className="bg-surface rounded-lg px-4 py-3 text-base"
                  placeholderTextColor={colors.muted}
                />
              </Card>

              <Card className="flex-1 p-4">
                <Text variant="body" weight="medium" className="mb-2">CVV</Text>
                <TextInput
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  className="bg-surface rounded-lg px-4 py-3 text-base"
                  placeholderTextColor={colors.muted}
                />
              </Card>
            </View>
          </>
        )}

        {/* Mobile Money Fields */}
        {paymentType === 'mobile' && (
          <Card className="p-4 mb-3">
            <Text variant="body" weight="medium" className="mb-2">Mobile Number</Text>
            <TextInput
              placeholder="+260 97 123 4567"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              className="bg-surface rounded-lg px-4 py-3 text-base"
              placeholderTextColor={colors.muted}
            />
            <Text variant="bodySmall" color="muted" className="mt-2">
              Supports MTN, Airtel, and Zamtel
            </Text>
          </Card>
        )}

        {/* Wallet Info */}
        {paymentType === 'wallet' && (
          <Card className="p-4 mb-3">
            <Text variant="body" weight="medium" className="mb-2">Wallet Balance</Text>
            <Text variant="h2" weight="bold" className="text-primary">K 0.00</Text>
            <Text variant="bodySmall" color="muted" className="mt-2">
              Top up your wallet to use it for payments
            </Text>
          </Card>
        )}

        {/* Save Button */}
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-primary py-4 rounded-xl flex-row items-center justify-center mb-6"
          onPress={handleSave}
          disabled={ (paymentType === 'card' && (!cardNumber || !cardName || !expiryDate || !cvv)) ||
            (paymentType === 'mobile' && !mobileNumber) }
        >
          <Save size={20} color="white" />
          <Text variant="body" weight="bold" className="text-white ml-2">Save Payment Method</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

