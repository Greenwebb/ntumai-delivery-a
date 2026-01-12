// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

/**
 * PaymentMethodsScreen - NativeWind Version
 * 
 * Allows customers to manage payment methods:
 * - Credit/Debit cards (Visa, Mastercard, Amex)
 * - Mobile Money (MTN, Airtel, Zamtel)
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Pressable , ModalInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { usePaymentStore } from '@/stores/payment-store';
import { useToast } from '@/lib/toast-provider';

// Types
type PaymentMethodType = 'card' | 'mobile_money';
type CardBrand = 'visa' | 'mastercard' | 'amex';
type MobileMoneyProvider = 'mtn' | 'airtel' | 'zamtel';

interface PaymentMethod { id: string;
  type: PaymentMethodType;
  isDefault: boolean;
  cardBrand?: CardBrand;
  lastFourDigits?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  provider?: MobileMoneyProvider;
  phoneNumber?: string;
  accountName?: string; }

// Mock data
const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_1',
    type: 'card',
    isDefault: true,
    cardBrand: 'visa',
    lastFourDigits: '4242',
    expiryMonth: 12,
    expiryYear: 2027,
    cardholderName: 'John Doe'},
  { id: 'pm_2',
    type: 'card',
    isDefault: false,
    cardBrand: 'mastercard',
    lastFourDigits: '8888',
    expiryMonth: 6,
    expiryYear: 2026,
    cardholderName: 'John Doe'},
  { id: 'pm_3',
    type: 'mobile_money',
    isDefault: false,
    provider: 'mtn',
    phoneNumber: '+260 97 123 4567',
    accountName: 'John Doe'},
];
  const CARD_BRANDS: Record<CardBrand, { color: string; name: string }> = { visa: { color: '#1A1F71', name: 'Visa' },
  mastercard: { color: '#EB001B', name: 'Mastercard' },
  amex: { color: '#006FCF', name: 'American Express' }};
  const MOBILE_PROVIDERS: Record<MobileMoneyProvider, { color: string; name: string }> = { mtn: { color: '#FFCC00', name: 'MTN Mobile Money' },
  airtel: { color: '#ED1C24', name: 'Airtel Money' },
  zamtel: { color: '#00A651', name: 'Zamtel Kwacha' }};

export default function PaymentMethodsScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { paymentMethods, loadPaymentMethods, addPaymentMethod, removePaymentMethod, setDefaultMethod } = usePaymentStore();
  
  useEffect(() => { loadPaymentMethods(); }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<PaymentMethodType | null>(null);
  
  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  // Mobile money form
  const [selectedProvider, setSelectedProvider] = useState<MobileMoneyProvider | null>(null);
  const [mobilePhone, setMobilePhone] = useState('');
  const [accountName, setAccountName] = useState('');
  const handleSetDefault = (id: string) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    setPaymentMethods(methods =>
      methods.map(m => ({ ...m, isDefault: m.id === id }))
    ); };
  const handleDelete = (id: string) => { const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault) { toast.info('Set another method as default first.');
      return; }
    
    toast.info('Remove this payment method?'); };
  const formatCardNumber = (value: string) => { const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19); };
  const formatExpiryDate = (value: string) => { const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) { return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`; }
    return cleaned; };
  const detectCardBrand = (number: string): CardBrand => { const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'visa'; };
  const handleAddCard = () =>  {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) { toast.error('Please fill in all card details.');
      return; }
  const [month, year] = expiryDate.split('/');
  const newCard: PaymentMethod = { id: `pm_${Date.now()}`,
      type: 'card',
      isDefault: paymentMethods.length === 0,
      cardBrand: detectCardBrand(cardNumber),
      lastFourDigits: cardNumber.replace(/\s/g, '').slice(-4),
      expiryMonth: parseInt(month),
      expiryYear: 2000 + parseInt(year),
      cardholderName};

    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    setPaymentMethods([...paymentMethods, newCard]);
    resetForm();
    setShowAddModal(false); };
  const handleAddMobileMoney = () =>  {
    if (!selectedProvider || !mobilePhone || !accountName) { toast.error('Please fill in all details.');
      return; }
  const newMobile: PaymentMethod = { id: `pm_${Date.now()}`,
      type: 'mobile_money',
      isDefault: paymentMethods.length === 0,
      provider: selectedProvider,
      phoneNumber: mobilePhone,
      accountName};

    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    setPaymentMethods([...paymentMethods, newMobile]);
    resetForm();
    setShowAddModal(false); };
  const resetForm = () => { setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setSelectedProvider(null);
    setMobilePhone('');
    setAccountName('');
    setAddType(null); };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Payment Methods</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false}>
        {/* Cards Section */}
        <View className="px-4 pt-4">
          <Text className="text-muted text-sm font-medium mb-3">CARDS</Text>
          {paymentMethods.filter(m => m.type === 'card').map((method) => (
            <View key={method.id} className="bg-background rounded-xl p-4 mb-3 border border-border">
              <View className="flex-row items-center">
                <View 
                  className="w-12 h-8 rounded items-center justify-center mr-3"
                  style={{ backgroundColor: CARD_BRANDS[method.cardBrand!].color }}
                >
                  <Text className="text-white font-bold text-xs">
                    {CARD_BRANDS[method.cardBrand!].name.substring(0, 4).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">
                    {CARD_BRANDS[method.cardBrand!].name} •••• {method.lastFourDigits}
                  </Text>
                  <Text className="text-muted text-sm">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </Text>
                </View>
                {method.isDefault && (
                  <View className="bg-primary/10 px-2 py-1 rounded-full">
                    <Text className="text-primary text-xs font-semibold">Default</Text>
                  </View>
                )}
              </View>
              <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                {!method.isDefault && (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleSetDefault(method.id)}
                    className="flex-row items-center mr-4"
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#009688" />
                    <Text className="text-primary text-sm ml-1">Set Default</Text>
                  </Pressable>
                )}
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDelete(method.id)}
                  className="flex-row items-center"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="text-red-500 text-sm ml-1">Remove</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Mobile Money Section */}
        <View className="px-4 pt-4">
          <Text className="text-muted text-sm font-medium mb-3">MOBILE MONEY</Text>
          {paymentMethods.filter(m => m.type === 'mobile_money').map((method) => (
            <View key={method.id} className="bg-background rounded-xl p-4 mb-3 border border-border">
              <View className="flex-row items-center">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: MOBILE_PROVIDERS[method.provider!].color }}
                >
                  <Ionicons name="phone-portrait" size={20} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">
                    {MOBILE_PROVIDERS[method.provider!].name}
                  </Text>
                  <Text className="text-muted text-sm">{method.phoneNumber}</Text>
                </View>
                {method.isDefault && (
                  <View className="bg-primary/10 px-2 py-1 rounded-full">
                    <Text className="text-primary text-xs font-semibold">Default</Text>
                  </View>
                )}
              </View>
              <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                {!method.isDefault && (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleSetDefault(method.id)}
                    className="flex-row items-center mr-4"
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#009688" />
                    <Text className="text-primary text-sm ml-1">Set Default</Text>
                  </Pressable>
                )}
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDelete(method.id)}
                  className="flex-row items-center"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="text-red-500 text-sm ml-1">Remove</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Add Button */}
        <View className="px-4 py-6">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowAddModal(true)}
            className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text className="text-white font-semibold text-base ml-2">Add Payment Method</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { resetForm(); setShowAddModal(false); }}
      >
        <View className="flex-1 bg-background">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => { resetForm(); setShowAddModal(false); }}>
              <Ionicons name="close" size={28} color="#1F2937" />
            </Pressable>
            <Text className="text-lg font-semibold text-foreground">
              {!addType ? 'Add Payment Method' : addType === 'card' ? 'Add Card' : 'Add Mobile Money'}
            </Text>
            <View className="w-7" />
          </View>

          <ScrollView className="flex-1 p-4">
            {!addType ? (
              // Type Selection
              <View className="gap-4">
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setAddType('card')}
                  className="bg-surface p-6 rounded-xl border border-border flex-row items-center"
                >
                  <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-4">
                    <Ionicons name="card" size={28} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-lg">Credit/Debit Card</Text>
                    <Text className="text-muted text-sm">Visa, Mastercard, Amex</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </Pressable>

                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setAddType('mobile_money')}
                  className="bg-surface p-6 rounded-xl border border-border flex-row items-center"
                >
                  <View className="w-14 h-14 rounded-full bg-yellow-100 items-center justify-center mr-4">
                    <Ionicons name="phone-portrait" size={28} color="#D97706" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold text-lg">Mobile Money</Text>
                    <Text className="text-muted text-sm">MTN, Airtel, Zamtel</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </Pressable>
              </View>
            ) : addType === 'card' ? (
              // Card Form
              <View className="gap-4">
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Card Number</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-700 font-medium mb-2">Expiry</Text>
                    <TextInput
                      className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChangeText={(v) => setExpiryDate(formatExpiryDate(v))}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-700 font-medium mb-2">CVV</Text>
                    <TextInput
                      className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                      placeholder="123"
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Cardholder Name</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChangeText={setCardholderName}
                    autoCapitalize="words"
                  />
                </View>
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleAddCard}
                  className="bg-primary py-4 rounded-xl mt-4"
                >
                  <Text className="text-white font-semibold text-center text-base">Add Card</Text>
                </Pressable>
              </View>
            ) : (
              // Mobile Money Form
              <View className="gap-4">
                <Text className="text-gray-700 font-medium">Select Provider</Text>
                <View className="flex-row gap-3">
                  {(Object.keys(MOBILE_PROVIDERS) as MobileMoneyProvider[]).map((provider) => (
                    <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={provider}
                      onPress={() => setSelectedProvider(provider)}
                      className={`flex-1 p-4 rounded-xl border items-center ${ selectedProvider === provider ? 'border-primary bg-primary/5' : 'border-border' }`}
                    >
                      <View 
                        className="w-12 h-12 rounded-full items-center justify-center mb-2"
                        style={{ backgroundColor: MOBILE_PROVIDERS[provider].color }}
                      >
                        <Ionicons name="phone-portrait" size={20} color="#fff" />
                      </View>
                      <Text className={`text-sm font-medium ${ selectedProvider === provider ? 'text-primary' : 'text-gray-700' }`}>
                        {provider.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    placeholder="+260 97 XXX XXXX"
                    value={mobilePhone}
                    onChangeText={setMobilePhone}
                    keyboardType="phone-pad"
                  />
                </View>
                <View>
                  <Text className="text-gray-700 font-medium mb-2">Account Name</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    placeholder="John Doe"
                    value={accountName}
                    onChangeText={setAccountName}
                    autoCapitalize="words"
                  />
                </View>
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleAddMobileMoney}
                  className="bg-primary py-4 rounded-xl mt-4"
                >
                  <Text className="text-white font-semibold text-center text-base">Add Mobile Money</Text>
                </Pressable>
              </View>
            )}

            {addType && (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setAddType(null)}
                className="mt-4 py-3"
              >
                <Text className="text-muted text-center">← Back to selection</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

