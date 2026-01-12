// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Platform, Pressable , ModalInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

type PaymentProvider = 'mtn' | 'airtel' | 'zamtel';

interface FloatPackage { id: string;
  amount: number;
  bonus: number;
  popular?: boolean; }
  const FLOAT_PACKAGES: FloatPackage[] = [
  { id: 'pkg_50', amount: 50, bonus: 0 },
  { id: 'pkg_100', amount: 100, bonus: 5 },
  { id: 'pkg_200', amount: 200, bonus: 15, popular: true },
  { id: 'pkg_500', amount: 500, bonus: 50 },
  { id: 'pkg_1000', amount: 1000, bonus: 120 },
];
  const PAYMENT_PROVIDERS: { id: PaymentProvider; name: string; color: string; icon: string }[] = [
  { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00', icon: 'smartphone' },
  { id: 'airtel', name: 'Airtel Money', color: '#FF0000', icon: 'smartphone' },
  { id: 'zamtel', name: 'Zamtel Kwacha', color: '#00A651', icon: 'smartphone' },
];

export default function BuyFloatScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [selectedPackage, setSelectedPackage] = useState<FloatPackage | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const currentFloat = 45.00; // Mock current float balance

  const getEffectiveAmount = () =>  {
    if (selectedPackage) { return selectedPackage.amount + selectedPackage.bonus; }
  const custom = parseFloat(customAmount);
    return isNaN(custom) ? 0 : custom; };
  const getPaymentAmount = () =>  {
    if (selectedPackage) return selectedPackage.amount;
  const custom = parseFloat(customAmount);
    return isNaN(custom) ? 0 : custom; };
  const handleSelectPackage = (pkg: FloatPackage) =>  {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPackage(pkg);
    setCustomAmount(''); };
  const handleCustomAmountChange = (text: string) => { setCustomAmount(text.replace(/[^0-9]/g, ''));
    setSelectedPackage(null); };
  const handleSelectProvider = (provider: PaymentProvider) =>  {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProvider(provider); };
  const handleProceed = () =>  {
    if (!selectedPackage && !customAmount) { toast.info('Please select a package or enter a custom amount');
      return; }
    if (!selectedProvider) { toast.info('Please select a payment method');
      return; }
    if (!phoneNumber || phoneNumber.length < 10) { toast.info('Please enter a valid phone number');
      return; }
    setShowConfirmModal(true); };
  const handleConfirmPayment = async () => { setShowConfirmModal(false);
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsProcessing(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccessModal(true); };
  const handleSuccessClose = () => { setShowSuccessModal(false);
    router.back(); };
  const formatCurrency = (amount: number) => `K${amount.toFixed(2)}`;

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Buy Float</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Current Balance */}
        <View className="mx-4 mt-4 bg-primary/10 rounded-2xl p-4">
          <Text className="text-sm text-muted">Current Float Balance</Text>
          <Text className="text-3xl font-bold text-primary mt-1">{formatCurrency(currentFloat)}</Text>
          <Text className="text-xs text-muted mt-2">Float is deducted per delivery (K8.00)</Text>
        </View>

        {/* Float Packages */}
        <View className="px-4 mt-6">
          <Text className="text-base font-semibold text-foreground mb-3">Select Package</Text>
          <View className="gap-3">
            {FLOAT_PACKAGES.map((pkg) => (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={pkg.id}
                onPress={() => handleSelectPackage(pkg)}
                className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${ selectedPackage?.id === pkg.id ? 'border-primary bg-primary/5' : 'border-border bg-surface' }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-lg font-bold text-foreground">{formatCurrency(pkg.amount)}</Text>
                    {pkg.popular && (
                      <View className="ml-2 bg-primary px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-semibold text-white">POPULAR</Text>
                      </View>
                    )}
                  </View>
                  {pkg.bonus > 0 && (
                    <Text className="text-sm text-success mt-0.5">+{formatCurrency(pkg.bonus)} bonus</Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-sm text-muted">You get</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {formatCurrency(pkg.amount + pkg.bonus)}
                  </Text>
                </View>
                <View className={`ml-3 w-6 h-6 rounded-full border-2 items-center justify-center ${ selectedPackage?.id === pkg.id ? 'border-primary bg-primary' : 'border-border' }`}>
                  {selectedPackage?.id === pkg.id && <Feather name="check" size={14} color="white" />}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Custom Amount */}
        <View className="px-4 mt-6">
          <Text className="text-base font-semibold text-foreground mb-3">Or Enter Custom Amount</Text>
          <View className="flex-row items-center bg-surface border border-border rounded-xl px-4">
            <Text className="text-lg font-semibold text-muted">K</Text>
            <TextInput
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              placeholder="0.00"
              keyboardType="numeric"
              className="flex-1 py-4 px-2 text-lg text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <Text className="text-xs text-muted mt-2">Minimum: K20 | Maximum: K5,000</Text>
        </View>

        {/* Payment Method */}
        <View className="px-4 mt-6">
          <Text className="text-base font-semibold text-foreground mb-3">Payment Method</Text>
          <View className="gap-3">
            {PAYMENT_PROVIDERS.map((provider) => (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={provider.id}
                onPress={() => handleSelectProvider(provider.id)}
                className={`flex-row items-center p-4 rounded-xl border-2 ${ selectedProvider === provider.id ? 'border-primary bg-primary/5' : 'border-border bg-surface' }`}
              >
                <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: provider.color }}>
                  <Feather name={provider.icon} size={24} color="white" />
                </View>
                <Text className="flex-1 ml-3 text-base font-medium text-foreground">{provider.name}</Text>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${ selectedProvider === provider.id ? 'border-primary bg-primary' : 'border-border' }`}>
                  {selectedProvider === provider.id && <Feather name="check" size={14} color="white" />}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Phone Number */}
        <View className="px-4 mt-6">
          <Text className="text-base font-semibold text-foreground mb-3">Mobile Money Number</Text>
          <View className="flex-row items-center bg-surface border border-border rounded-xl px-4">
            <Text className="text-base text-muted">+260</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
              placeholder="97XXXXXXX"
              keyboardType="phone-pad"
              maxLength={10}
              className="flex-1 py-4 px-2 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Summary */}
        {(selectedPackage || customAmount) && (
          <View className="mx-4 mt-6 bg-surface rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Summary</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">Amount</Text>
              <Text className="text-sm text-foreground">{formatCurrency(getPaymentAmount())}</Text>
            </View>
            {selectedPackage?.bonus > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-muted">Bonus</Text>
                <Text className="text-sm text-success">+{formatCurrency(selectedPackage.bonus)}</Text>
              </View>
            )}
            <View className="border-t border-border my-2" />
            <View className="flex-row justify-between">
              <Text className="text-base font-semibold text-foreground">Float to Receive</Text>
              <Text className="text-base font-bold text-primary">{formatCurrency(getEffectiveAmount())}</Text>
            </View>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-8">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleProceed}
          disabled={isProcessing || (!selectedPackage && !customAmount)}
          className={`py-4 rounded-xl items-center ${ isProcessing || (!selectedPackage && !customAmount) ? 'bg-muted' : 'bg-primary' }`}
        >
          {isProcessing ? (
            <Text className="text-base font-semibold text-white">Processing...</Text>
          ) : (
            <Text className="text-base font-semibold text-white">
              Pay {formatCurrency(getPaymentAmount())}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-foreground text-center">Confirm Payment</Text>
            <Text className="text-sm text-muted text-center mt-2">
              You will pay {formatCurrency(getPaymentAmount())} via {PAYMENT_PROVIDERS.find(p => p.id === selectedProvider)?.name}
            </Text>
            <Text className="text-sm text-muted text-center mt-1">
              to receive {formatCurrency(getEffectiveAmount())} float
            </Text>
            <View className="flex-row gap-3 mt-6">
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-surface border border-border items-center"
              >
                <Text className="text-base font-semibold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleConfirmPayment}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
              >
                <Text className="text-base font-semibold text-white">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm items-center">
            <View className="w-16 h-16 rounded-full bg-success/20 items-center justify-center">
              <Feather name="check" size={32} color="#22C55E" />
            </View>
            <Text className="text-xl font-bold text-foreground text-center mt-4">Float Purchased!</Text>
            <Text className="text-sm text-muted text-center mt-2">
              {formatCurrency(getEffectiveAmount())} has been added to your float balance
            </Text>
            <Text className="text-2xl font-bold text-primary mt-4">
              New Balance: {formatCurrency(currentFloat + getEffectiveAmount())}
            </Text>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSuccessClose}
              className="w-full py-3 rounded-xl bg-primary items-center mt-6"
            >
              <Text className="text-base font-semibold text-white">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

