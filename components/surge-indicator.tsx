// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSurgePricingStore } from '@/stores/surge-pricing-store';

interface SurgeIndicatorProps {
  compact?: boolean;
  onPress?: () => void;
}

export function SurgeIndicator({ compact = false, onPress }: SurgeIndicatorProps) {
  const { pricing, loadSurgePricing, isPeakHour } = useSurgePricingStore();

  useEffect(() => {
    loadSurgePricing();
    // Refresh every 5 minutes
    const interval = setInterval(loadSurgePricing, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!pricing.isActive) return null;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="flex-row items-center bg-warning/10 px-3 py-1.5 rounded-full"
      >
        <Feather name="zap" size={14} color="#F59E0B" />
        <Text className="text-xs font-semibold text-warning ml-1">
          {pricing.currentMultiplier}x
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-warning/10 border border-warning/30 rounded-xl p-4"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-warning/20 items-center justify-center">
          <Feather name="zap" size={20} color="#F59E0B" />
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-foreground">
              Surge Pricing Active
            </Text>
            <View className="ml-2 bg-warning px-2 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-white">
                {pricing.currentMultiplier}x
              </Text>
            </View>
          </View>
          <Text className="text-sm text-muted mt-0.5">{pricing.reason}</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#6B7280" />
      </View>
      
      <View className="flex-row items-center mt-3 pt-3 border-t border-warning/20">
        <Feather name="clock" size={14} color="#6B7280" />
        <Text className="text-xs text-muted ml-1">
          Est. wait: {pricing.estimatedWaitTime} min
        </Text>
        {isPeakHour() && (
          <>
            <View className="w-1 h-1 rounded-full bg-muted mx-2" />
            <Feather name="trending-up" size={14} color="#F59E0B" />
            <Text className="text-xs text-warning ml-1">Peak hours</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface SurgeInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SurgeInfoModal({ visible, onClose }: SurgeInfoModalProps) {
  const { pricing, isPeakHour } = useSurgePricingStore();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-foreground">Surge Pricing</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Status */}
            <View className="bg-warning/10 rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Feather name="zap" size={24} color="#F59E0B" />
                  <Text className="text-lg font-semibold text-foreground ml-2">
                    {pricing.currentMultiplier}x Multiplier
                  </Text>
                </View>
                <View className="bg-warning px-3 py-1 rounded-full">
                  <Text className="text-sm font-bold text-white">ACTIVE</Text>
                </View>
              </View>
              <Text className="text-sm text-muted mt-2">{pricing.reason}</Text>
            </View>

            {/* Wait Time */}
            <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Feather name="clock" size={20} color="#009688" />
                </View>
                <View className="ml-3">
                  <Text className="text-base font-semibold text-foreground">
                    {pricing.estimatedWaitTime} min
                  </Text>
                  <Text className="text-sm text-muted">Estimated wait time</Text>
                </View>
              </View>
            </View>

            {/* Why Surge */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-foreground mb-3">
                Why is there surge pricing?
              </Text>
              <View className="bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-start mb-3">
                  <Feather name="users" size={18} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-medium text-foreground">High Demand</Text>
                    <Text className="text-xs text-muted mt-0.5">
                      More customers are ordering than usual in your area
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-start mb-3">
                  <Feather name="truck" size={18} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-medium text-foreground">Limited Taskers</Text>
                    <Text className="text-xs text-muted mt-0.5">
                      Fewer delivery partners available nearby
                    </Text>
                  </View>
                </View>
                {isPeakHour() && (
                  <View className="flex-row items-start">
                    <Feather name="clock" size={18} color="#F59E0B" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-medium text-warning">Peak Hours</Text>
                      <Text className="text-xs text-muted mt-0.5">
                        This is a busy time of day
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Peak Hours Info */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-foreground mb-3">
                Peak Hours
              </Text>
              <View className="bg-surface rounded-xl p-4 border border-border">
                {pricing.peakHours.map((period, index) => (
                  <View
                    key={index}
                    className={`flex-row items-center justify-between py-2 ${
                      index < pricing.peakHours.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <Text className="text-sm text-muted">
                      {period.start === 7 ? 'Morning Rush' :
                       period.start === 12 ? 'Lunch Rush' : 'Evening Rush'}
                    </Text>
                    <Text className="text-sm font-medium text-foreground">
                      {period.start}:00 - {period.end}:00
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tips */}
            <View className="bg-primary/5 rounded-xl p-4 mb-6">
              <View className="flex-row items-start">
                <Feather name="lightbulb" size={18} color="#009688" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-foreground">Tip</Text>
                  <Text className="text-xs text-muted mt-1">
                    Schedule your order for later to avoid surge pricing, or wait a few minutes for prices to normalize.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default SurgeIndicator;
