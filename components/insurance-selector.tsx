// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useInsuranceStore, CoverageTier, InsurancePlan } from '@/stores/insurance-store';

interface InsuranceSelectorProps {
  orderValue: number;
  onSelect: (tier: CoverageTier | null, premium: number) => void;
  selectedTier?: CoverageTier | null;
}

export function InsuranceSelector({ orderValue, onSelect, selectedTier = null }: InsuranceSelectorProps) {
  const { plans, getRecommendedPlan, calculatePremium } = useInsuranceStore();
  const [selected, setSelected] = useState<CoverageTier | null>(selectedTier);
  const [showModal, setShowModal] = useState(false);
  const recommendedPlan = getRecommendedPlan(orderValue);

  useEffect(() => {
    setSelected(selectedTier);
  }, [selectedTier]);

  const handleSelect = (tier: CoverageTier | null) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelected(tier);
    const premium = tier ? calculatePremium(orderValue, tier) : 0;
    onSelect(tier, premium);
  };

  const getPlanIcon = (tier: CoverageTier) => {
    const icons: Record<CoverageTier, string> = {
      basic: 'shield',
      standard: 'shield',
      premium: 'shield',
    };
    return icons[tier];
  };

  const getPlanColor = (tier: CoverageTier) => {
    const colors: Record<CoverageTier, string> = {
      basic: '#3B82F6',
      standard: '#8B5CF6',
      premium: '#F59E0B',
    };
    return colors[tier];
  };

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Feather name="shield" size={18} color="#6B7280" />
          <Text className="text-base font-medium text-foreground ml-2">Order Protection</Text>
          <Text className="text-xs text-muted ml-1">(Optional)</Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} className="p-1">
          <Feather name="info" size={18} color="#009688" />
        </TouchableOpacity>
      </View>

      {/* No Insurance Option */}
      <TouchableOpacity
        onPress={() => handleSelect(null)}
        className={`flex-row items-center p-4 rounded-xl mb-2 border ${
          selected === null ? 'border-primary bg-primary/5' : 'border-border bg-surface'
        }`}
      >
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground">No Protection</Text>
          <Text className="text-xs text-muted mt-0.5">Continue without insurance</Text>
        </View>
        {selected === null && (
          <Feather name="check-circle" size={20} color="#009688" />
        )}
      </TouchableOpacity>

      {/* Insurance Plans */}
      {plans.map(plan => {
        const premium = calculatePremium(orderValue, plan.id);
        const isRecommended = plan.id === recommendedPlan;
        const isSelected = selected === plan.id;

        return (
          <TouchableOpacity
            key={plan.id}
            onPress={() => handleSelect(plan.id)}
            className={`p-4 rounded-xl mb-2 border ${
              isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface'
            }`}
          >
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${getPlanColor(plan.id)}20` }}
                >
                  <Feather name={getPlanIcon(plan.id) as any} size={16} color={getPlanColor(plan.id)} />
                </View>
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-semibold text-foreground">{plan.name}</Text>
                    {isRecommended && (
                      <View className="ml-2 bg-primary px-2 py-0.5 rounded-full">
                        <Text className="text-xs font-bold text-white">RECOMMENDED</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-muted mt-0.5">{plan.description}</Text>
                </View>
              </View>
              {isSelected && (
                <Feather name="check-circle" size={20} color="#009688" />
              )}
            </View>

            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
              <Text className="text-xs text-muted">Coverage up to K{plan.coverageAmount.toLocaleString()}</Text>
              <Text className="text-sm font-bold text-foreground">+K{premium}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Info Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Order Protection</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* What is it */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-foreground mb-2">What is Order Protection?</Text>
                <Text className="text-sm text-muted leading-relaxed">
                  Order Protection provides coverage for your items in case they are lost, damaged, or stolen during delivery. 
                  Get peace of mind knowing you're covered.
                </Text>
              </View>

              {/* Plans Comparison */}
              {plans.map(plan => (
                <View key={plan.id} className="bg-surface rounded-xl p-4 mb-4 border border-border">
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${getPlanColor(plan.id)}20` }}
                    >
                      <Feather name="shield" size={20} color={getPlanColor(plan.id)} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-semibold text-foreground">{plan.name}</Text>
                      <Text className="text-xs text-muted">K{plan.price} base premium</Text>
                    </View>
                  </View>

                  <View className="mb-3">
                    <Text className="text-sm font-medium text-foreground mb-1">Coverage</Text>
                    <Text className="text-sm text-muted">Up to K{plan.coverageAmount.toLocaleString()}</Text>
                  </View>

                  <View className="mb-3">
                    <Text className="text-sm font-medium text-foreground mb-2">Features</Text>
                    {plan.features.map((feature, index) => (
                      <View key={index} className="flex-row items-start mb-1">
                        <Feather name="check" size={14} color="#22C55E" style={{ marginTop: 2 }} />
                        <Text className="text-xs text-muted ml-2 flex-1">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="pt-3 border-t border-border">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-muted">Claim processing</Text>
                      <Text className="text-xs font-medium text-foreground">{plan.claimProcessingTime}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* How it works */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-foreground mb-3">How It Works</Text>
                <View className="bg-surface rounded-xl p-4 border border-border">
                  <View className="flex-row items-start mb-3">
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-xs font-bold text-white">1</Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-medium text-foreground">Add Protection</Text>
                      <Text className="text-xs text-muted mt-0.5">Select a plan during checkout</Text>
                    </View>
                  </View>
                  <View className="flex-row items-start mb-3">
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-xs font-bold text-white">2</Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-medium text-foreground">Track Your Order</Text>
                      <Text className="text-xs text-muted mt-0.5">Monitor delivery in real-time</Text>
                    </View>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Text className="text-xs font-bold text-white">3</Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-medium text-foreground">File a Claim</Text>
                      <Text className="text-xs text-muted mt-0.5">If something goes wrong, submit a claim and get reimbursed</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* FAQ */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-foreground mb-3">Common Questions</Text>
                <View className="bg-surface rounded-xl p-4 border border-border">
                  <Text className="text-sm font-medium text-foreground mb-1">When should I add protection?</Text>
                  <Text className="text-xs text-muted mb-3">
                    We recommend adding protection for orders over K200 or items that are fragile, valuable, or irreplaceable.
                  </Text>
                  
                  <Text className="text-sm font-medium text-foreground mb-1">How do I file a claim?</Text>
                  <Text className="text-xs text-muted mb-3">
                    Go to your order details and tap "File Insurance Claim". Provide photos and description of the issue.
                  </Text>
                  
                  <Text className="text-sm font-medium text-foreground mb-1">How long does it take?</Text>
                  <Text className="text-xs text-muted">
                    Processing time varies by plan, from same-day (Premium) to 2-3 days (Basic).
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default InsuranceSelector;
