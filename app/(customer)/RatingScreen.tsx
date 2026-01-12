// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Platform, KeyboardAvoidingView, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface RatingCategory { id: string;
  label: string;
  icon: string; }
  const RATING_CATEGORIES: RatingCategory[] = [
  { id: 'speed', label: 'Delivery Speed', icon: 'zap' },
  { id: 'communication', label: 'Communication', icon: 'message-circle' },
  { id: 'handling', label: 'Package Handling', icon: 'package' },
  { id: 'professionalism', label: 'Professionalism', icon: 'user-check' },
];
  const QUICK_FEEDBACK = [
  'Fast delivery',
  'Friendly tasker',
  'Great communication',
  'Careful handling',
  'On time',
  'Professional',
  'Helpful',
  'Would recommend',
];

export default function RatingScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const params = useLocalSearchParams();
  const { orderId, taskerName = 'Your Tasker', vendorName } = params;
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVendorRating, setShowVendorRating] = useState(false);
  const [vendorRating, setVendorRating] = useState(0);
  const [vendorReview, setVendorReview] = useState('');
  const handleStarPress = (rating: number, category?: string) =>  {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (category) { setCategoryRatings(prev => ({ ...prev, [category]: rating })); } else { setOverallRating(rating); } };
  const handleFeedbackToggle = (feedback: string) =>  {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFeedback(prev =>
      prev.includes(feedback) ? prev.filter(f => f !== feedback) : [...prev, feedback]
    ); };
  const handleTipSelect = (amount: number | null) =>  {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTipAmount(amount === tipAmount ? null : amount); };
  const handleSubmit = async () =>  {
    if (overallRating === 0) { toast.info('Please provide an overall rating');
      return; }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    toast.info(
      'Thank You!',
      'Your feedback helps improve our service.',
      [{ text: 'Done', onPress: () => router.back() }]
    );

    setIsSubmitting(false); };
  const renderStars = (rating: number, onPress: (r: number) => void, size: number = 32) => (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={star} onPress={() => onPress(star)}>
          <Feather
            name={star <= rating ? 'star' : 'star'}
            size={size}
            color={star <= rating ? '#FFD700' : '#D1D5DB'}
            style={{ opacity: star <= rating ? 1 : 0.5 }}
          />
        </Pressable>
      ))}
    </View>
  );
  const getRatingLabel = (rating: number) =>  {
    if (rating === 0) return 'Tap to rate';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    return 'Excellent'; };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="x" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Rate Your Experience</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Tasker Rating Section */}
          <View className="px-4 pt-6">
            {/* Tasker Avatar & Name */}
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-3">
                <Feather name="user" size={40} color="#009688" />
              </View>
              <Text className="text-xl font-bold text-foreground">{taskerName}</Text>
              <Text className="text-sm text-muted mt-1">How was your delivery?</Text>
            </View>

            {/* Overall Rating */}
            <View className="items-center mt-6">
              {renderStars(overallRating, (r) => handleStarPress(r))}
              <Text className={`mt-2 text-base font-medium ${overallRating > 0 ? 'text-primary' : 'text-muted'}`}>
                {getRatingLabel(overallRating)}
              </Text>
            </View>
          </View>

          {/* Category Ratings */}
          {overallRating > 0 && (
            <View className="px-4 mt-6">
              <Text className="text-base font-semibold text-foreground mb-4">Rate specific areas</Text>
              <View className="gap-4">
                {RATING_CATEGORIES.map((category) => (
                  <View key={category.id} className="flex-row items-center justify-between bg-surface rounded-xl p-3">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                        <Feather name={category.icon} size={20} color="#009688" />
                      </View>
                      <Text className="ml-3 text-sm font-medium text-foreground">{category.label}</Text>
                    </View>
                    {renderStars(categoryRatings[category.id] || 0, (r) => handleStarPress(r, category.id), 20)}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quick Feedback Tags */}
          {overallRating > 0 && (
            <View className="px-4 mt-6">
              <Text className="text-base font-semibold text-foreground mb-3">Quick feedback</Text>
              <View className="flex-row flex-wrap gap-2">
                {QUICK_FEEDBACK.map((feedback) => (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={feedback}
                    onPress={() => handleFeedbackToggle(feedback)}
                    className={`px-3 py-2 rounded-full border ${ selectedFeedback.includes(feedback)
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-border' }`}
                  >
                    <Text className={`text-sm ${selectedFeedback.includes(feedback) ? 'text-white font-medium' : 'text-foreground'}`}>
                      {feedback}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Written Review */}
          {overallRating > 0 && (
            <View className="px-4 mt-6">
              <Text className="text-base font-semibold text-foreground mb-3">Write a review (optional)</Text>
              <TextInput
                value={review}
                onChangeText={setReview}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
                className="bg-surface border border-border rounded-xl p-4 text-base text-foreground min-h-[100px]"
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Tip Section */}
          {overallRating >= 4 && (
            <View className="px-4 mt-6">
              <Text className="text-base font-semibold text-foreground mb-2">Add a tip?</Text>
              <Text className="text-sm text-muted mb-3">100% goes to your tasker</Text>
              <View className="flex-row gap-3">
                {[10, 20, 50, 100].map((amount) => (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={amount}
                    onPress={() => handleTipSelect(amount)}
                    className={`flex-1 py-3 rounded-xl items-center border-2 ${ tipAmount === amount ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
                  >
                    <Text className={`text-base font-semibold ${tipAmount === amount ? 'text-white' : 'text-foreground'}`}>
                      K{amount}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Vendor Rating Toggle */}
          {vendorName && overallRating > 0 && (
            <View className="px-4 mt-6">
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowVendorRating(!showVendorRating)}
                className="flex-row items-center justify-between bg-surface rounded-xl p-4"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-warning/10 items-center justify-center">
                    <Feather name="shopping-bag" size={20} color="#F59E0B" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-base font-medium text-foreground">Rate {vendorName}</Text>
                    <Text className="text-sm text-muted">How was the food/products?</Text>
                  </View>
                </View>
                <Feather name={showVendorRating ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
              </Pressable>

              {showVendorRating && (
                <View className="mt-4 bg-surface rounded-xl p-4">
                  <View className="items-center">
                    {renderStars(vendorRating, setVendorRating, 28)}
                    <Text className={`mt-2 text-sm ${vendorRating > 0 ? 'text-warning' : 'text-muted'}`}>
                      {getRatingLabel(vendorRating)}
                    </Text>
                  </View>
                  <TextInput
                    value={vendorReview}
                    onChangeText={setVendorReview}
                    placeholder="Comment on the products..."
                    multiline
                    numberOfLines={2}
                    className="mt-4 bg-background border border-border rounded-xl p-3 text-sm text-foreground"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </View>
          )}

          <View className="h-32" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-8">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSubmit}
          disabled={isSubmitting || overallRating === 0}
          className={`py-4 rounded-xl items-center ${ isSubmitting || overallRating === 0 ? 'bg-muted' : 'bg-primary' }`}
        >
          <Text className="text-base font-semibold text-white">
            {isSubmitting ? 'Submitting...' : tipAmount ? `Submit & Tip K${tipAmount}` : 'Submit Rating'}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

