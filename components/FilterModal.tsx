// @ts-nocheck
import React from 'react';
import { View, Modal, Pressable, ScrollView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { useColors } from '@/hooks/use-colors';
import { Feather } from '@expo/vector-icons';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  maxDeliveryTime: number;
  setMaxDeliveryTime: (time: number) => void;
  dietaryPreferences: string[];
  toggleDietaryPreference: (pref: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
  { id: 'vegan', label: 'Vegan', icon: 'heart' },
  { id: 'halal', label: 'Halal', icon: 'check-circle' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: 'alert-circle' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: 'droplet' },
  { id: 'nut-free', label: 'Nut-Free', icon: 'shield' },
];

const PRICE_RANGES = [
  { min: 0, max: 50, label: 'K0 - K50' },
  { min: 0, max: 100, label: 'K0 - K100' },
  { min: 0, max: 150, label: 'K0 - K150' },
  { min: 0, max: 200, label: 'All Prices' },
];

const DELIVERY_TIMES = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60+ min' },
];

export function FilterModal({
  visible,
  onClose,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  maxDeliveryTime,
  setMaxDeliveryTime,
  dietaryPreferences,
  toggleDietaryPreference,
  onClearFilters,
  onApplyFilters,
}: FilterModalProps) {
  const colors = useColors();

  const handlePriceSelect = (min: number, max: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPriceRange([min, max]);
  };

  const handleRatingSelect = (rating: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMinRating(rating);
  };

  const handleDeliveryTimeSelect = (time: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setMaxDeliveryTime(time);
  };

  const handleDietaryToggle = (pref: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleDietaryPreference(pref);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-background rounded-t-3xl" style={{ maxHeight: '85%' }}>
          {/* Header */}
          <View className="px-6 py-4 border-b border-border flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Filters</Text>
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              onPress={onClose}
            >
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            {/* Price Range */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-foreground mb-4">Price Range</Text>
              <View className="flex-row flex-wrap gap-3">
                {PRICE_RANGES.map((range) => (
                  <Pressable
                    key={range.label}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    onPress={() => handlePriceSelect(range.min, range.max)}
                    className={cn(
                      "px-4 py-3 rounded-lg border-2",
                      priceRange[0] === range.min && priceRange[1] === range.max
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        priceRange[0] === range.min && priceRange[1] === range.max
                          ? "text-primary"
                          : "text-muted"
                      )}
                    >
                      {range.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Minimum Rating */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-foreground mb-4">Minimum Rating</Text>
              <View className="flex-row gap-3">
                {[0, 3, 4, 4.5].map((rating) => (
                  <Pressable
                    key={rating}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    onPress={() => handleRatingSelect(rating)}
                    className={cn(
                      "flex-1 py-3 rounded-lg border-2 items-center",
                      minRating === rating
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface"
                    )}
                  >
                    <View className="flex-row items-center">
                      <Feather
                        name="star"
                        size={16}
                        color={minRating === rating ? colors.primary : colors.muted}
                        fill={minRating === rating ? colors.primary : 'none'}
                      />
                      <Text
                        className={cn(
                          "text-sm font-semibold ml-1",
                          minRating === rating ? "text-primary" : "text-muted"
                        )}
                      >
                        {rating === 0 ? 'All' : `${rating}+`}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Delivery Time */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-foreground mb-4">Max Delivery Time</Text>
              <View className="flex-row flex-wrap gap-3">
                {DELIVERY_TIMES.map((time) => (
                  <Pressable
                    key={time.value}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    onPress={() => handleDeliveryTimeSelect(time.value)}
                    className={cn(
                      "px-4 py-3 rounded-lg border-2",
                      maxDeliveryTime === time.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        maxDeliveryTime === time.value ? "text-primary" : "text-muted"
                      )}
                    >
                      {time.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Dietary Preferences */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">Dietary Preferences</Text>
              <View className="flex-row flex-wrap gap-3">
                {DIETARY_OPTIONS.map((option) => (
                  <Pressable
                    key={option.id}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    onPress={() => handleDietaryToggle(option.id)}
                    className={cn(
                      "px-4 py-3 rounded-lg border-2 flex-row items-center",
                      dietaryPreferences.includes(option.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface"
                    )}
                  >
                    <Feather
                      name={option.icon as any}
                      size={16}
                      color={
                        dietaryPreferences.includes(option.id)
                          ? colors.primary
                          : colors.muted
                      }
                    />
                    <Text
                      className={cn(
                        "text-sm font-semibold ml-2",
                        dietaryPreferences.includes(option.id)
                          ? "text-primary"
                          : "text-muted"
                      )}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="px-6 py-4 border-t border-border flex-row gap-3">
            <SecondaryButton
              title="Clear All"
              onPress={() => {
                onClearFilters();
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
              className="flex-1"
            />
            <PrimaryButton
              title="Apply Filters"
              onPress={() => {
                onApplyFilters();
                onClose();
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
