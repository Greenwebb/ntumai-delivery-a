// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { useState, useEffect } from 'react';

import { View, ScrollView, Pressable, TextInput } from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { floatMockService } from '@/src/api/mockServices.extended';
import { useToast } from '@/lib/toast-provider';
  const PRESET_AMOUNTS = [10, 25, 50, 100];

export default function FloatTopUpScreen() { const router = useRouter();
  const toast = useToast();
  const [floatBalance, setFloatBalance] = useState<any>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const paymentMethods = [

    { id: 'card', name: 'Debit/Credit Card', icon: 'card' },

    { id: 'mobile_money', name: 'Mobile Money', icon: 'phone-portrait' },

    { id: 'bank', name: 'Bank Transfer', icon: 'business' },

  ];

  useEffect(() => { loadFloatBalance(); }, []);
  const loadFloatBalance = async () => { try { const response = await floatMockService.getFloatBalance('tasker_1');

      if (response.success) { setFloatBalance(response.data); } } catch (error) { toast.error('Failed to load float balance'); } finally { setLoading(false); } };
  const getTopUpAmount = (): number | null =>  {
    if (selectedAmount) return selectedAmount;

    if (customAmount.trim()) return parseFloat(customAmount);

    return null; };
  const handleTopUp = async () => { const amount = getTopUpAmount();

    if (!amount || amount <= 0) { toast.error('Please select or enter a valid amount');

      return; }

    if (!selectedPaymentMethod) { toast.error('Please select a payment method');

      return; }

    setProcessing(true);

    try { const response = await floatMockService.topUpFloat(

        amount,

        selectedPaymentMethod

      );

      if (response.success) { toast.info('Float top-up completed!'); } } catch (error) { toast.error('Failed to process top-up'); } finally { setProcessing(false); } };

  if (loading) { return (

      <View className="flex-1 justify-center items-center bg-background">

        <LoadingState />

      </View>

    ); }

  return (

    <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false}>

      {/* Header */}

      <View className="bg-background border-b border-border px-4 py-4">

        <Text className="text-2xl font-bold text-foreground">Top Up Float</Text>

      </View>

      <View className="px-4 py-4">

        {/* Current Balance */}

        <View className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-6 text-white">

          <Text className="text-white text-sm opacity-90 mb-2">Current Float Balance</Text>

          <Text className="text-white text-4xl font-bold mb-4">

            â­{floatBalance?.floatBalance.toFixed(2)}

          </Text>

          <View className="flex-row justify-between">

            <View>

              <Text className="text-white text-xs opacity-75">Earnings</Text>

              <Text className="text-white text-lg font-semibold">

                â­{floatBalance?.earningsBalance.toFixed(2)}

              </Text>

            </View>

            <View>

              <Text className="text-white text-xs opacity-75">Minimum Required</Text>

              <Text className="text-white text-lg font-semibold">

                â­{floatBalance?.minimumRequired.toFixed(2)}

              </Text>

            </View>

          </View>

        </View>

        {/* Float Status */}

        {floatBalance?.floatBalance < floatBalance?.minimumRequired && (

          <View className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">

            <Text className="text-red-900 font-semibold mb-1">â ï¸ Low Float Balance</Text>

            <Text className="text-red-700 text-sm">

              Your float is below the minimum required. Top up to continue receiving jobs.

            </Text>

          </View>

        )}

        {/* Preset Amounts */}

        <Text className="text-lg font-bold text-foreground mb-3">Quick Select</Text>

        <View className="flex-row flex-wrap gap-2 mb-6">

          {PRESET_AMOUNTS.map((amount) => (

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={amount}

              onPress={() => { setSelectedAmount(amount);

                setCustomAmount(''); }}

              className={`flex-1 min-w-[45%] py-3 rounded-lg border-2 ${ selectedAmount === amount

                  ? 'bg-blue-500 border-blue-600'

                  : 'bg-background border-border' }`}

            >

              <Text

                className={`text-center font-bold ${ selectedAmount === amount

                    ? 'text-white'

                    : 'text-foreground' }`}

              >

                â­{amount}

              </Text>

            </Pressable>

          ))}

        </View>

        {/* Custom Amount */}

        <Text className="text-lg font-bold text-foreground mb-3">Custom Amount</Text>

        <TextInput

          value={customAmount}

          onChangeText={(text) => { setCustomAmount(text);

            setSelectedAmount(null); }}

          placeholder="Enter amount"

          keyboardType="decimal-pad"

          className="bg-background rounded-lg px-4 py-3 text-foreground border border-border mb-6"

          placeholderTextColor="#999"

        />

        {/* Payment Methods */}

        <Text className="text-lg font-bold text-foreground mb-3">Payment Method</Text>

        {paymentMethods.map((method) => (

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={method.id}

            onPress={() => setSelectedPaymentMethod(method.id)}

            className={`flex-row items-center p-4 rounded-lg mb-3 border-2 ${ selectedPaymentMethod === method.id

                ? 'bg-blue-50 border-blue-500'

                : 'bg-background border-border' }`}

          >

            <Ionicons

              name={method.icon as any}

              size={24}

              color={selectedPaymentMethod === method.id ? '#3B82F6' : '#6B7280'}

            />

            <Text

              className={`ml-3 font-semibold ${ selectedPaymentMethod === method.id

                  ? 'text-blue-600'

                  : 'text-foreground' }`}

            >

              {method.name}

            </Text>

          </Pressable>

        ))}

        {/* Summary */}

        {getTopUpAmount() && (

          <View className="bg-surface rounded-lg p-4 mb-6">

            <View className="flex-row justify-between mb-2">

              <Text className="text-muted">Amount to Top Up</Text>

              <Text className="text-foreground font-semibold">

                â­{getTopUpAmount()?.toFixed(2)}

              </Text>

            </View>

            <View className="flex-row justify-between">

              <Text className="text-muted">New Balance</Text>

              <Text className="text-foreground font-bold">

                â­{(floatBalance?.floatBalance + (getTopUpAmount() || 0)).toFixed(2)}

              </Text>

            </View>

          </View>

        )}

      </View>

      {/* Button */}

      <View className="px-4 pb-6">

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleTopUp}

          disabled={processing || !getTopUpAmount() || !selectedPaymentMethod}

          className={`py-4 rounded-lg ${ processing || !getTopUpAmount() || !selectedPaymentMethod

              ? 'bg-gray-300'

              : 'bg-blue-500' }`}

        >

          <Text className="text-center text-white font-bold text-lg">

            {processing ? 'Processing...' : 'Top Up Float'}

          </Text>

        </Pressable>

      </View>

    </ScrollView>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

