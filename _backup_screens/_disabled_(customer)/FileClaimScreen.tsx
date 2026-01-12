// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Platform, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useInsuranceStore, ClaimType } from '@/stores/insurance-store';
import { useToast } from '@/lib/toast-provider';
  const CLAIM_TYPES: { id: ClaimType; label: string; description: string; icon: string; color: string }[] = [
  { id: 'lost',
    label: 'Lost Package',
    description: 'Package never arrived or went missing',
    icon: 'package',
    color: '#EF4444'},
  { id: 'damaged',
    label: 'Damaged Items',
    description: 'Items arrived broken or damaged',
    icon: 'alert-triangle',
    color: '#F59E0B'},
  { id: 'stolen',
    label: 'Stolen Package',
    description: 'Package was stolen after delivery',
    icon: 'shield-off',
    color: '#DC2626'},
  { id: 'late_delivery',
    label: 'Late Delivery',
    description: 'Delivery was significantly delayed',
    icon: 'clock',
    color: '#6B7280'},
];

export default function FileClaimScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const orderValue = parseFloat(params.orderValue as string) || 0;
  const { submitClaim, getInsuranceForOrder, isLoading } = useInsuranceStore();
  const insurance = getInsuranceForOrder(orderId);
  const [selectedType, setSelectedType] = useState<ClaimType | null>(null);
  const [claimAmount, setClaimAmount] = useState('');
  const [description, setDescription] = useState('');
  const handleSubmit = async () =>  {
    if (!selectedType) { toast.error('Please select a claim type');
      return; }
  const amount = parseFloat(claimAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Please enter a valid claim amount');
      return; }

    if (!description.trim()) { toast.error('Please provide a description of the issue');
      return; }

    if (!insurance) { toast.error('No insurance found for this order');
      return; }

    if (amount > insurance.coverageAmount) { toast.error(`Claim amount cannot exceed coverage limit of K${insurance.coverageAmount}`);
      return; }

    try { await submitClaim(orderId, selectedType, amount, description, []);
      
      if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }

      toast.info(
        'Claim Submitted',
        'Your claim has been submitted successfully. We will review it and get back to you soon.',
        [{ text: 'OK', onPress: () => router.back() }]
      ); } catch (error) { toast.error(error.message || 'Failed to submit claim. Please try again.'); } };

  if (!insurance) { return (
      <ScreenContainer className="bg-background">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
            <Feather name="arrow-left" size={24} color="#1F2937" />
          </Pressable>
          <Text className="text-lg font-semibold text-foreground">File Claim</Text>
          <View className="w-10" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-error/10 items-center justify-center mb-4">
            <Feather name="shield-off" size={32} color="#EF4444" />
          </View>
          <Text className="text-lg font-semibold text-foreground mb-2 text-center">
            No Insurance Found
          </Text>
          <Text className="text-sm text-muted text-center mb-6">
            This order doesn't have insurance protection. You can add protection to future orders during checkout.
          </Text>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    ); }

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">File Claim</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Insurance Info */}
        <View className="bg-primary/5 rounded-xl p-4 mt-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Feather name="shield" size={20} color="#009688" />
            <Text className="text-base font-semibold text-foreground ml-2">
              {insurance.plan.charAt(0).toUpperCase() + insurance.plan.slice(1)} Protection
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">Coverage Limit</Text>
            <Text className="text-sm font-medium text-foreground">
              K{insurance.coverageAmount.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-sm text-muted">Order Value</Text>
            <Text className="text-sm font-medium text-foreground">K{insurance.orderValue.toFixed(2)}</Text>
          </View>
        </View>

        {/* Claim Type */}
        <Text className="text-base font-semibold text-foreground mb-3">What went wrong?</Text>
        {CLAIM_TYPES.map(type => (
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={type.id}
            onPress={() => { setSelectedType(type.id);
              if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
            className={`flex-row items-center p-4 rounded-xl mb-2 border ${ selectedType === type.id ? 'border-primary bg-primary/5' : 'border-border bg-surface' }`}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${type.color}20` }}
            >
              <Feather name={type.icon as any} size={20} color={type.color} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-foreground">{type.label}</Text>
              <Text className="text-xs text-muted mt-0.5">{type.description}</Text>
            </View>
            {selectedType === type.id && (
              <Feather name="check-circle" size={20} color="#009688" />
            )}
          </Pressable>
        ))}

        {/* Claim Amount */}
        <Text className="text-base font-semibold text-foreground mb-2 mt-6">Claim Amount</Text>
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 mb-2">
          <Text className="text-lg font-medium text-muted mr-2">K</Text>
          <TextInput
            value={claimAmount}
            onChangeText={setClaimAmount}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            className="flex-1 text-lg text-foreground"
          />
        </View>
        <Text className="text-xs text-muted mb-6">
          Maximum: K{insurance.coverageAmount.toLocaleString()}
        </Text>

        {/* Description */}
        <Text className="text-base font-semibold text-foreground mb-2">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what happened in detail..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-6"
        />

        {/* Evidence (Future Enhancement) */}
        <View className="bg-muted/10 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Feather name="camera" size={18} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-foreground">Add Photos (Coming Soon)</Text>
              <Text className="text-xs text-muted mt-1">
                Upload photos of damaged items or delivery issues to support your claim.
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSubmit}
          disabled={isLoading}
          className={`py-4 rounded-xl mb-6 ${isLoading ? 'bg-muted' : 'bg-primary'}`}
        >
          <Text className="text-center text-white font-semibold text-base">
            {isLoading ? 'Submitting...' : 'Submit Claim'}
          </Text>
        </Pressable>

        {/* Info */}
        <View className="bg-primary/5 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Feather name="info" size={18} color="#009688" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-foreground">What happens next?</Text>
              <Text className="text-xs text-muted mt-1">
                Our team will review your claim within {insurance.plan === 'premium' ? 'the same day' : insurance.plan === 'standard' ? '1-2 business days' : '2-3 business days'}. 
                You'll receive a notification once your claim is reviewed.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

