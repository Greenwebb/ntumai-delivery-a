// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

/**
 * EarningsDashboardScreen - Float-Based Wallet System
 * 
 * Tasker wallet model per blueprint:
 * - Float Balance: Required to work. Purchased in-app. Deducted per job completion.
 * - Earnings Balance: Increases when jobs are completed. Shown prominently.
 * - No withdrawal needed - taskers buy float to enable working.
 * - When a delivery is completed: Float decreases, Earnings increase.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Platform, Pressable , ModalInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';

// Mock wallet data
const INITIAL_WALLET = { earnings: 2450.00,      // Total earnings (increases on job completion)
  floatBalance: 320.00,   // Current float (deducted per job)
  floatPerDelivery: 8.00, // Platform fee per delivery
  todayEarnings: 185.00,
  todayDeliveries: 12,
  todayFloatUsed: 96.00,  // 12 deliveries × K8 
      };
  const MOCK_WEEKLY_EARNINGS = [
  { day: 'Mon', amount: 145, deliveries: 6 },
  { day: 'Tue', amount: 210, deliveries: 9 },
  { day: 'Wed', amount: 185, deliveries: 8 },
  { day: 'Thu', amount: 165, deliveries: 7 },
  { day: 'Fri', amount: 280, deliveries: 12 },
  { day: 'Sat', amount: 320, deliveries: 14 },
  { day: 'Sun', amount: 185, deliveries: 8 },
];
  const FLOAT_PACKAGES = [
  { id: '1', amount: 100, bonus: 0, deliveries: 12 },
  { id: '2', amount: 250, bonus: 10, deliveries: 32 },
  { id: '3', amount: 500, bonus: 30, deliveries: 66 },
  { id: '4', amount: 1000, bonus: 80, deliveries: 135 },
];
  const RECENT_TRANSACTIONS = [
  { id: '1', type: 'earning', description: 'Delivery #NTM-4521', amount: 25.00, date: 'Today, 2:30 PM' },
  { id: '2', type: 'float_deduction', description: 'Platform fee', amount: -8.00, date: 'Today, 2:30 PM' },
  { id: '3', type: 'earning', description: 'Delivery #NTM-4520', amount: 18.00, date: 'Today, 1:15 PM' },
  { id: '4', type: 'float_deduction', description: 'Platform fee', amount: -8.00, date: 'Today, 1:15 PM' },
  { id: '5', type: 'float_purchase', description: 'Float top-up', amount: 250.00, date: 'Yesterday, 9:00 AM' },
  { id: '6', type: 'earning', description: 'Delivery #NTM-4519 + Tip', amount: 42.00, date: 'Yesterday, 6:45 PM' },
];

export default function EarningsDashboardScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [wallet, setWallet] = useState(INITIAL_WALLET);
  const [showBuyFloatModal, setShowBuyFloatModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const maxWeeklyAmount = useMemo(() => 
    Math.max(...MOCK_WEEKLY_EARNINGS.map(d => d.amount)), []
  );
  const weeklyTotal = useMemo(() => 
    MOCK_WEEKLY_EARNINGS.reduce((sum, d) => sum + d.amount, 0), []
  );

  // Calculate deliveries remaining with current float
  const deliveriesRemaining = Math.floor(wallet.floatBalance / wallet.floatPerDelivery);
  const isLowFloat = deliveriesRemaining < 10;
  const handleBuyFloat = () =>  {
    if (!selectedPackage && !customAmount) { toast.info('Please select a package or enter a custom amount.');
      return; }
  const pkg = FLOAT_PACKAGES.find(p => p.id === selectedPackage);
  const amount = pkg ? pkg.amount + pkg.bonus : parseInt(customAmount) || 0;

    if (amount < 50) { toast.info('Minimum float purchase is K50.');
      return; }

    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }

    setWallet(prev => ({ ...prev,
      floatBalance: prev.floatBalance + amount}));

    toast.info('Float Purchased!', `K${amount.toFixed(2)} has been added to your float balance.`);
    setShowBuyFloatModal(false);
    setSelectedPackage(null);
    setCustomAmount(''); };
  const getTransactionIcon = (type: string) => { switch (type) { case 'earning':
        return { name: 'arrow-down-circle', color: '#10B981' };
      case 'float_deduction':
        return { name: 'remove-circle', color: '#EF4444' };
      case 'float_purchase':
        return { name: 'add-circle', color: '#3B82F6' };
      default:
        return { name: 'ellipse', color: '#6B7280' }; } };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Wallet</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false}>
        {/* Earnings Hero Card - Large & Prominent */}
        <View className="mx-4 mt-4 bg-primary rounded-2xl p-6">
          <Text className="text-white/80 text-sm font-medium">Total Earnings</Text>
          <Text className="text-white text-5xl font-bold mt-1">
            K{wallet.earnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <View className="flex-row items-center mt-4 pt-4 border-t border-white/20">
            <View className="flex-1">
              <Text className="text-white/70 text-xs">Today</Text>
              <Text className="text-white text-xl font-semibold">K{wallet.todayEarnings.toFixed(2)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white/70 text-xs">Deliveries</Text>
              <Text className="text-white text-xl font-semibold">{wallet.todayDeliveries}</Text>
            </View>
          </View>
        </View>

        {/* Float Balance Card - Smaller, Secondary */}
        <View className={`mx-4 mt-4 rounded-2xl p-4 border ${isLowFloat ? 'bg-error/10 border-error/30' : 'bg-background border-border'}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Ionicons name="wallet-outline" size={18} color={isLowFloat ? '#EF4444' : '#6B7280'} />
                <Text className={`text-sm font-medium ${isLowFloat ? 'text-error' : 'text-muted'}`}>
                  Float Balance
                </Text>
              </View>
              <Text className={`text-2xl font-bold mt-1 ${isLowFloat ? 'text-error' : 'text-foreground'}`}>
                K{wallet.floatBalance.toFixed(2)}
              </Text>
              <Text className={`text-xs mt-1 ${isLowFloat ? 'text-error/70' : 'text-muted'}`}>
                {deliveriesRemaining} deliveries remaining
              </Text>
            </View>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowBuyFloatModal(true)}
              className="bg-primary px-4 py-2.5 rounded-xl flex-row items-center"
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text className="text-white font-semibold ml-1">Buy Float</Text>
            </Pressable>
          </View>

          {isLowFloat && (
            <View className="mt-3 pt-3 border-t border-error/20 flex-row items-center">
              <Ionicons name="warning" size={16} color="#EF4444" />
              <Text className="text-error text-sm ml-2 flex-1">
                Low float! Top up to continue accepting deliveries.
              </Text>
            </View>
          )}
        </View>

        {/* How It Works */}
        <View className="mx-4 mt-4 bg-primary/10 rounded-xl p-4 border border-primary/20">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="information-circle" size={20} color="#009688" />
            <Text className="text-primary font-semibold">How It Works</Text>
          </View>
          <Text className="text-primary/80 text-sm leading-5">
            Buy float to start working. Each delivery deducts K{wallet.floatPerDelivery} from float, and your earnings increase by the delivery fee. More float = more earning potential!
          </Text>
        </View>

        {/* Weekly Chart */}
        <View className="mx-4 mt-4 bg-background rounded-2xl p-4 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-foreground font-semibold">This Week</Text>
            <Text className="text-primary font-semibold">K{weeklyTotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row items-end justify-between h-28">
            {MOCK_WEEKLY_EARNINGS.map((day, index) => { const height = (day.amount / maxWeeklyAmount) * 100;
  const isToday = index === MOCK_WEEKLY_EARNINGS.length - 1;
              return (
                <View key={day.day} className="items-center flex-1">
                  <Text className="text-xs text-muted mb-1">K{day.amount}</Text>
                  <View
                    className={`w-7 rounded-t-lg ${isToday ? 'bg-primary' : 'bg-border'}`}
                    style={{ height: `${Math.max(height, 8)}%` }}
                  />
                  <Text className={`text-xs mt-2 ${isToday ? 'text-primary font-semibold' : 'text-muted'}`}>
                    {day.day}
                  </Text>
                </View>
              ); })}
          </View>
        </View>

        {/* Today's Summary */}
        <View className="mx-4 mt-4 bg-background rounded-2xl p-4 border border-border">
          <Text className="text-foreground font-semibold mb-3">Today's Summary</Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-success/20 items-center justify-center">
                  <Ionicons name="arrow-down" size={16} color="#10B981" />
                </View>
                <Text className="text-muted">Earnings</Text>
              </View>
              <Text className="text-success font-semibold">+K{wallet.todayEarnings.toFixed(2)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-error/20 items-center justify-center">
                  <Ionicons name="remove" size={16} color="#EF4444" />
                </View>
                <Text className="text-muted">Float Used</Text>
              </View>
              <Text className="text-error font-semibold">-K{wallet.todayFloatUsed.toFixed(2)}</Text>
            </View>
            <View className="flex-row items-center justify-between pt-3 border-t border-border">
              <Text className="text-foreground font-semibold">Net Profit</Text>
              <Text className="text-primary text-lg font-bold">
                +K{(wallet.todayEarnings - wallet.todayFloatUsed).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mx-4 mt-4 mb-8 bg-background rounded-2xl p-4 border border-border">
          <Text className="text-foreground font-semibold mb-3">Recent Transactions</Text>
          <View className="gap-3">
            {RECENT_TRANSACTIONS.map((tx) => { const icon = getTransactionIcon(tx.type);
              return (
                <View key={tx.id} className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-3">
                    <Ionicons name={icon.name as any} size={20} color={icon.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-medium">{tx.description}</Text>
                    <Text className="text-muted text-xs">{tx.date}</Text>
                  </View>
                  <Text className={`font-semibold ${tx.amount >= 0 ? 'text-success' : 'text-error'}`}>
                    {tx.amount >= 0 ? '+' : ''}K{Math.abs(tx.amount).toFixed(2)}
                  </Text>
                </View>
              ); })}
          </View>
        </View>
      </ScrollView>

      {/* Buy Float Modal */}
      <Modal
        visible={showBuyFloatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBuyFloatModal(false)}
      >
        <View className="flex-1 bg-background">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowBuyFloatModal(false)}>
              <Ionicons name="close" size={28} color="#1F2937" />
            </Pressable>
            <Text className="text-lg font-semibold text-foreground">Buy Float</Text>
            <View className="w-7" />
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Current Balance */}
            <View className="bg-surface rounded-xl p-4 mb-6">
              <Text className="text-muted text-sm">Current Float Balance</Text>
              <Text className="text-foreground text-2xl font-bold">K{wallet.floatBalance.toFixed(2)}</Text>
              <Text className="text-muted text-xs mt-1">
                {deliveriesRemaining} deliveries remaining at K{wallet.floatPerDelivery}/delivery
              </Text>
            </View>

            {/* Float Packages */}
            <Text className="text-foreground font-semibold mb-3">Select Package</Text>
            <View className="gap-3 mb-6">
              {FLOAT_PACKAGES.map((pkg) => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={pkg.id}
                  onPress={() => { setSelectedPackage(pkg.id);
                    setCustomAmount('');
                    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
                  className={`p-4 rounded-xl border flex-row items-center justify-between ${ selectedPackage === pkg.id ? 'border-primary bg-primary/5' : 'border-border' }`}
                >
                  <View>
                    <Text className={`text-lg font-bold ${selectedPackage === pkg.id ? 'text-primary' : 'text-foreground'}`}>
                      K{pkg.amount}
                    </Text>
                    {pkg.bonus > 0 && (
                      <Text className="text-success text-sm font-medium">+K{pkg.bonus} bonus</Text>
                    )}
                    <Text className="text-muted text-xs mt-1">≈ {pkg.deliveries} deliveries</Text>
                  </View>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${ selectedPackage === pkg.id ? 'border-primary bg-primary' : 'border-border' }`}>
                    {selectedPackage === pkg.id && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Custom Amount */}
            <Text className="text-foreground font-semibold mb-3">Or Enter Custom Amount</Text>
            <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 mb-6">
              <Text className="text-muted text-lg mr-2">K</Text>
              <TextInput
                className="flex-1 text-foreground text-lg"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={customAmount}
                onChangeText={(v) => { setCustomAmount(v.replace(/[^0-9]/g, ''));
                  setSelectedPackage(null); }}
                keyboardType="numeric"
              />
            </View>

            {/* Payment Info */}
            <View className="bg-warning/10 rounded-xl p-4 mb-6 border border-warning/20">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="card" size={18} color="#D97706" />
                <Text className="text-warning font-semibold">Payment Method</Text>
              </View>
              <Text className="text-warning/80 text-sm">
                Float will be purchased using MTN Mobile Money ending in •••• 4521
              </Text>
            </View>

            {/* Buy Button */}
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleBuyFloat}
              className="bg-primary py-4 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="wallet" size={20} color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                Buy Float
              </Text>
            </Pressable>

            {/* Terms */}
            <Text className="text-muted text-xs text-center mt-4">
              By purchasing float, you agree to our Terms of Service.{'\n'}
              Float is non-refundable and used for platform fees.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

