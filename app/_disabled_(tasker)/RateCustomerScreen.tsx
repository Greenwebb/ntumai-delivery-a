// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Platform, KeyboardAvoidingView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface RatingCategory {
  id: string;
  label: string;
  icon: string;
}

const RATING_CATEGORIES: RatingCategory[] = [
  { id: 'communication', label: 'Communication', icon: 'message-circle' },
  { id: 'punctuality', label: 'Punctuality', icon: 'clock' },
  { id: 'respect', label: 'Respectful', icon: 'heart' },
  { id: 'clarity', label: 'Clear Instructions', icon: 'check-circle' },
];

const QUICK_FEEDBACK = [
  'Easy to communicate',
  'Clear instructions',
  'Respectful',
  'On time',
  'Flexible',
  'Friendly',
  'Would work with again',
];

export default function RateCustomerScreen() {
  const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const params = useLocalSearchParams();
  const { orderId, customerName = 'Customer' } = params;
  
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarPress = (rating: number, category?: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (category) {
      setCategoryRatings(prev => ({ ...prev, [category]: rating }));
    } else {
      setOverallRating(rating);
    }
  };

  const handleFeedbackToggle = (feedback: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFeedback(prev =>
      prev.includes(feedback) ? prev.filter(f => f !== feedback) : [...prev, feedback]
    );
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.info('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    toast.success('Thank you for your feedback!');
    setIsSubmitting(false);
    router.back();
  };

  const renderStars = (rating: number, onPress: (r: number) => void, size: number = 32) => (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          key={star}
          onPress={() => onPress(star)}
        >
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

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'Tap to rate';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent';
    return '';
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="mr-4"
            >
              <Feather name="arrow-left" size={24} color={colors.foreground} />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold">Rate Customer</Text>
              <Text className="text-sm text-muted">Order #{orderId}</Text>
            </View>
          </View>

          {/* Customer Info */}
          <View className="rounded-2xl p-6 mb-6 items-center" style={{ backgroundColor: colors.surface }}>
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
                {customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-lg font-semibold">{customerName}</Text>
            <Text className="text-sm text-muted">How was your experience?</Text>
          </View>

          {/* Overall Rating */}
          <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
            <Text className="text-lg font-semibold mb-4 text-center">Overall Rating</Text>
            <View className="items-center mb-3">
              {renderStars(overallRating, setOverallRating, 40)}
            </View>
            <Text className="text-center text-sm font-medium" style={{ color: colors.primary }}>
              {getRatingLabel(overallRating)}
            </Text>
          </View>

          {/* Category Ratings */}
          <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
            <Text className="text-lg font-semibold mb-4">Rate by Category</Text>
            <View className="gap-4">
              {RATING_CATEGORIES.map((category) => (
                <View key={category.id}>
                  <View className="flex-row items-center gap-2 mb-2">
                    <Feather name={category.icon as any} size={18} color={colors.muted} />
                    <Text className="font-medium">{category.label}</Text>
                  </View>
                  {renderStars(
                    categoryRatings[category.id] || 0,
                    (rating) => handleStarPress(rating, category.id),
                    24
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Quick Feedback */}
          <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
            <Text className="text-lg font-semibold mb-4">Quick Feedback</Text>
            <View className="flex-row flex-wrap gap-2">
              {QUICK_FEEDBACK.map((feedback) => {
                const isSelected = selectedFeedback.includes(feedback);
                return (
                  <Pressable
                    key={feedback}
                    onPress={() => handleFeedbackToggle(feedback)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View
                      className="px-4 py-2 rounded-full"
                      style={{
                        backgroundColor: isSelected ? colors.primary : colors.border + '40',
                      }}
                    >
                      <Text
                        className="text-sm font-medium"
                        style={{ color: isSelected ? '#FFF' : colors.foreground }}
                      >
                        {feedback}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Written Review */}
          <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
            <Text className="text-lg font-semibold mb-4">Additional Comments (Optional)</Text>
            <Textarea
              placeholder="Share more about your experience with this customer..."
              value={review}
              onChangeText={setReview}
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1">
              <SecondaryButton onPress={() => router.back()} disabled={isSubmitting}>
                Skip
              </SecondaryButton>
            </View>
            <View className="flex-1">
              <PrimaryButton onPress={handleSubmit} loading={isSubmitting}>
                Submit Rating
              </PrimaryButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

