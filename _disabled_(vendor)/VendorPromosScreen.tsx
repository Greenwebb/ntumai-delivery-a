// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Switch, Platform, FlatList, Pressable , ModalInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { usePromoStore, PromoCode, DiscountType } from '@/stores/promo-store';
import { useToast } from '@/lib/toast-provider';
  const DISCOUNT_TYPES: { id: DiscountType; label: string; icon: string }[] = [
  { id: 'percentage', label: 'Percentage', icon: 'percent' },
  { id: 'fixed', label: 'Fixed Amount', icon: 'dollar-sign' },
  { id: 'free_delivery', label: 'Free Delivery', icon: 'truck' },
];

export default function VendorPromosScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { vendorPromos, loadVendorPromos, createPromo, togglePromoStatus, deletePromo, isLoading } = usePromoStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);

  useEffect(() => { loadVendorPromos('vendor-001'); // Mock vendor ID 
      }, []);
  const resetForm = () => { setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderAmount('');
    setMaxDiscount('');
    setUsageLimit('');
    setValidUntil('');
    setFirstOrderOnly(false);
    setEditingPromo(null); };
  const handleCreatePromo = async () =>  {
    if (!code.trim()) { toast.error('Please enter a promo code.');
      return; }
    if (!discountValue && discountType !== 'free_delivery') { toast.error('Please enter a discount value.');
      return; }
  const newPromo = { code: code.toUpperCase().trim(),
      description: description.trim() || `${discountValue}${discountType === 'percentage' ? '%' : 'K'} off`,
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      validFrom: new Date(),
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      isActive: true,
      vendorId: 'vendor-001',
      firstOrderOnly};

    await createPromo(newPromo);
    setShowCreateModal(false);
    resetForm();
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); };
  const handleDeletePromo = (promoId: string, promoCode: string) => { toast.info(
      'Delete Promo',
      `Are you sure you want to delete "${promoCode}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete',
          style: 'destructive',
          onPress: async () => { await deletePromo(promoId);
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }},
      ]
    ); };
  const getDiscountLabel = (promo: PromoCode) => { switch (promo.discountType) { case 'percentage':
        return `${promo.discountValue}% OFF`;
      case 'fixed':
        return `K${promo.discountValue} OFF`;
      case 'free_delivery':
        return 'FREE DELIVERY'; } };
  const isPromoExpired = (promo: PromoCode) => { return new Date(promo.validUntil) < new Date(); };
  const activePromos = vendorPromos.filter(p => p.isActive && !isPromoExpired(p));
  const inactivePromos = vendorPromos.filter(p => !p.isActive || isPromoExpired(p));
  const renderPromoCard = (promo: PromoCode) => { const expired = isPromoExpired(promo);
  const usagePercent = promo.usageLimit 
      ? (promo.usageCount / promo.usageLimit) * 100 
      : 0;

    return (
      <View
        key={promo.id}
        className={`bg-surface rounded-xl p-4 mb-3 border ${expired ? 'border-error/30' : promo.isActive ? 'border-border' : 'border-muted/30'}`}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-foreground">{promo.code}</Text>
              <View className={`ml-2 px-2 py-0.5 rounded ${expired ? 'bg-error/10' : promo.isActive ? 'bg-success/10' : 'bg-muted/10'}`}>
                <Text className={`text-xs font-medium ${expired ? 'text-error' : promo.isActive ? 'text-success' : 'text-muted'}`}>
                  {expired ? 'Expired' : promo.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <Text className="text-sm text-muted mt-1">{promo.description}</Text>
          </View>
          <View className="px-3 py-1 bg-primary/10 rounded-lg">
            <Text className="text-sm font-bold text-primary">{getDiscountLabel(promo)}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row mt-3 pt-3 border-t border-border gap-4">
          <View className="flex-1">
            <Text className="text-xs text-muted">Used</Text>
            <Text className="text-sm font-semibold text-foreground">
              {promo.usageCount}{promo.usageLimit ? `/${promo.usageLimit}` : ''}
            </Text>
          </View>
          {promo.minOrderAmount && (
            <View className="flex-1">
              <Text className="text-xs text-muted">Min Order</Text>
              <Text className="text-sm font-semibold text-foreground">K{promo.minOrderAmount}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-xs text-muted">Expires</Text>
            <Text className="text-sm font-semibold text-foreground">
              {new Date(promo.validUntil).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Usage Progress Bar */}
        {promo.usageLimit && (
          <View className="mt-3">
            <View className="h-2 bg-muted/20 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-error' : usagePercent >= 70 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row mt-3 pt-3 border-t border-border gap-2">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => togglePromoStatus(promo.id)}
            className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${promo.isActive ? 'bg-warning/10' : 'bg-success/10'}`}
          >
            <Feather name={promo.isActive ? 'pause' : 'play'} size={16} color={promo.isActive ? '#F59E0B' : '#22C55E'} />
            <Text className={`ml-1 text-sm font-medium ${promo.isActive ? 'text-warning' : 'text-success'}`}>
              {promo.isActive ? 'Pause' : 'Activate'}
            </Text>
          </Pressable>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDeletePromo(promo.id, promo.code)}
            className="flex-1 flex-row items-center justify-center py-2 bg-error/10 rounded-lg"
          >
            <Feather name="trash-2" size={16} color="#EF4444" />
            <Text className="ml-1 text-sm text-error font-medium">Delete</Text>
          </Pressable>
        </View>
      </View>
    ); };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Promo Codes</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowCreateModal(true)}
          className="p-2 -mr-2"
        >
          <Feather name="plus" size={24} color="#009688" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View className="flex-row px-4 py-4 gap-3">
          <View className="flex-1 bg-success/10 rounded-xl p-4">
            <Text className="text-2xl font-bold text-success">{activePromos.length}</Text>
            <Text className="text-sm text-success/80">Active Promos</Text>
          </View>
          <View className="flex-1 bg-muted/10 rounded-xl p-4">
            <Text className="text-2xl font-bold text-muted">{inactivePromos.length}</Text>
            <Text className="text-sm text-muted/80">Inactive/Expired</Text>
          </View>
        </View>

        {/* Active Promos */}
        {activePromos.length > 0 && (
          <View className="px-4">
            <Text className="text-base font-semibold text-foreground mb-3">Active Promos</Text>
            {activePromos.map(renderPromoCard)}
          </View>
        )}

        {/* Inactive Promos */}
        {inactivePromos.length > 0 && (
          <View className="px-4 mt-4">
            <Text className="text-base font-semibold text-muted mb-3">Inactive / Expired</Text>
            {inactivePromos.map(renderPromoCard)}
          </View>
        )}

        {/* Empty State */}
        {vendorPromos.length === 0 && (
          <View className="items-center justify-center py-16 px-4">
            <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4">
              <Feather name="tag" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">No Promo Codes</Text>
            <Text className="text-sm text-muted text-center mb-6">
              Create promo codes to attract more customers and boost sales.
            </Text>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowCreateModal(true)}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Create Promo</Text>
            </Pressable>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Create Promo Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl max-h-[90%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => { setShowCreateModal(false); resetForm(); }}>
                <Text className="text-base text-muted">Cancel</Text>
              </Pressable>
              <Text className="text-lg font-semibold text-foreground">Create Promo</Text>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCreatePromo}>
                <Text className="text-base text-primary font-semibold">Create</Text>
              </Pressable>
            </View>

            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
              {/* Promo Code */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Promo Code *</Text>
                <TextInput
                  value={code}
                  onChangeText={(text) => setCode(text.toUpperCase())}
                  placeholder="e.g., SAVE20"
                  autoCapitalize="characters"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g., 20% off your order"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Discount Type */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Discount Type *</Text>
                <View className="flex-row gap-2">
                  {DISCOUNT_TYPES.map((type) => (
                    <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={type.id}
                      onPress={() => setDiscountType(type.id)}
                      className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${ discountType === type.id ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
                    >
                      <Feather name={type.icon} size={16} color={discountType === type.id ? '#FFFFFF' : '#6B7280'} />
                      <Text className={`ml-1 text-xs font-medium ${discountType === type.id ? 'text-white' : 'text-muted'}`}>
                        {type.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Discount Value */}
              {discountType !== 'free_delivery' && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(ZMW)'} *
                  </Text>
                  <TextInput
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                    keyboardType="decimal-pad"
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}

              {/* Min Order Amount */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Minimum Order (ZMW)</Text>
                <TextInput
                  value={minOrderAmount}
                  onChangeText={setMinOrderAmount}
                  placeholder="e.g., 100"
                  keyboardType="decimal-pad"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Max Discount (for percentage) */}
              {discountType === 'percentage' && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">Max Discount Cap (ZMW)</Text>
                  <TextInput
                    value={maxDiscount}
                    onChangeText={setMaxDiscount}
                    placeholder="e.g., 100"
                    keyboardType="decimal-pad"
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}

              {/* Usage Limit */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Usage Limit</Text>
                <TextInput
                  value={usageLimit}
                  onChangeText={setUsageLimit}
                  placeholder="Leave empty for unlimited"
                  keyboardType="number-pad"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* First Order Only */}
              <View className="flex-row items-center justify-between bg-surface rounded-xl p-4 mb-6 border border-border">
                <View>
                  <Text className="text-base font-medium text-foreground">First Order Only</Text>
                  <Text className="text-sm text-muted">Only applies to new customers</Text>
                </View>
                <Switch
                  value={firstOrderOnly}
                  onValueChange={setFirstOrderOnly}
                  trackColor={{ false: '#E5E7EB', true: '#009688' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View className="h-8" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

