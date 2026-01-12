// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTippingStore, TipPreset } from '@/stores/tipping-store';

interface TipSelectorProps {
  orderTotal: number;
  onTipSelected?: (amount: number) => void;
}

const TIP_PRESETS: { value: TipPreset; label: string }[] = [
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
  { value: 'custom', label: 'Custom' },
];

export function TipSelector({ orderTotal, onTipSelected }: TipSelectorProps) {
  const { selectedTip, setSelectedTip, clearSelectedTip, preferences } = useTippingStore();
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handlePresetSelect = (preset: TipPreset) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (preset === 'custom') {
      setShowCustomInput(true);
      setSelectedTip('custom', 0);
    } else {
      const amount = (orderTotal * (preset as number)) / 100;
      setSelectedTip(preset, amount);
      setShowCustomInput(false);
      onTipSelected?.(amount);
    }
  };

  const handleCustomAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, '');
    setCustomAmount(numericValue);
    
    const amount = parseFloat(numericValue) || 0;
    setSelectedTip('custom', amount);
    onTipSelected?.(amount);
  };

  const handleNoTip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    clearSelectedTip();
    setShowCustomInput(false);
    setCustomAmount('');
    onTipSelected?.(0);
  };

  return (
    <View className="bg-surface rounded-xl p-4 border border-border">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Feather name="heart" size={18} color="#009688" />
          <Text className="text-base font-semibold text-foreground ml-2">Add a Tip</Text>
        </View>
        {selectedTip && (
          <Text className="text-lg font-bold text-primary">
            +K{selectedTip.amount.toFixed(2)}
          </Text>
        )}
      </View>

      <Text className="text-xs text-muted mb-3">
        Show your appreciation to your tasker for great service
      </Text>

      {/* Preset Buttons */}
      <View className="flex-row gap-2 mb-3">
        {TIP_PRESETS.map(preset => {
          const isSelected = selectedTip?.preset === preset.value;
          const amount = preset.value !== 'custom'
            ? (orderTotal * (preset.value as number)) / 100
            : 0;

          return (
            <TouchableOpacity
              key={preset.value}
              onPress={() => handlePresetSelect(preset.value)}
              className={`flex-1 rounded-lg py-3 items-center ${
                isSelected ? 'bg-primary' : 'bg-background border border-border'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? 'text-white' : 'text-foreground'
                }`}
              >
                {preset.label}
              </Text>
              {preset.value !== 'custom' && (
                <Text
                  className={`text-xs mt-0.5 ${
                    isSelected ? 'text-white/80' : 'text-muted'
                  }`}
                >
                  K{amount.toFixed(0)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Amount Input */}
      {showCustomInput && (
        <View className="bg-background rounded-lg p-3 mb-3 border border-border">
          <Text className="text-xs text-muted mb-2">Enter custom tip amount</Text>
          <View className="flex-row items-center">
            <Text className="text-lg font-semibold text-foreground mr-2">K</Text>
            <TextInput
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              className="flex-1 text-lg font-semibold text-foreground"
              autoFocus
            />
          </View>
        </View>
      )}

      {/* No Tip Option */}
      <TouchableOpacity
        onPress={handleNoTip}
        className="items-center py-2"
      >
        <Text className="text-sm text-muted">No tip</Text>
      </TouchableOpacity>

      {/* Saved Preference Hint */}
      {preferences.defaultPreset && !selectedTip && (
        <View className="bg-primary/5 rounded-lg p-2 mt-2">
          <Text className="text-xs text-primary text-center">
            Your usual tip is {preferences.defaultPreset}%
          </Text>
        </View>
      )}
    </View>
  );
}
