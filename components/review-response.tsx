// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { useColors } from '@/hooks/use-colors';

import React, { useState } from 'react';
import { View, Platform, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useToast } from '@/lib/toast-provider';
import * as Haptics from 'expo-haptics';

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  response?: {
    text: string;
    date: string;
  };
}

interface ReviewResponseProps {
  review: Review;
  onResponseSubmitted: (reviewId: string, response: string) => void;
}

export function ReviewResponse({ review, onResponseSubmitted }: ReviewResponseProps) {
  const colors = useColors();
  const toast = useToast();
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState(review.response?.text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.info('Please enter a response');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      onResponseSubmitted(review.id, responseText);
      toast.success('Response posted successfully');
      setShowResponseModal(false);
    } catch (error) {
      toast.error('Failed to post response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Feather
          key={star}
          name="star"
          size={14}
          color={star <= rating ? '#FFD700' : '#D1D5DB'}
        />
      ))}
    </View>
  );

  return (
    <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.surface }}>
      {/* Review Header */}
      <View className="flex-row items-start gap-3 mb-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary + '20' }}
        >
          <Text className="font-semibold" style={{ color: colors.primary }}>
            {review.customerName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-semibold">{review.customerName}</Text>
            {renderStars(review.rating)}
          </View>
          <Text className="text-xs text-muted">
            {new Date(review.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Review Comment */}
      <Text className="text-sm mb-3">{review.comment}</Text>

      {/* Response Section */}
      {review.response ? (
        <View
          className="p-3 rounded-xl border-l-4"
          style={{
            backgroundColor: colors.primary + '10',
            borderLeftColor: colors.primary,
          }}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <Feather name="message-circle" size={16} color={colors.primary} />
            <Text className="font-semibold text-sm" style={{ color: colors.primary }}>
              Your Response
            </Text>
          </View>
          <Text className="text-sm mb-1">{review.response.text}</Text>
          <Text className="text-xs text-muted">
            {new Date(review.response.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Pressable
            onPress={() => setShowResponseModal(true)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="mt-2"
          >
            <Text className="text-sm font-medium" style={{ color: colors.primary }}>
              Edit Response
            </Text>
          </Pressable>
        </View>
      ) : (
        <SecondaryButton
          onPress={() => setShowResponseModal(true)}
          size="sm"
        >
          <Feather name="message-circle" size={16} color={colors.primary} />
          <Text className="ml-2 font-medium" style={{ color: colors.primary }}>
            Respond to Review
          </Text>
        </SecondaryButton>
      )}

      {/* Response Modal */}
      <BottomSheet
        visible={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title={review.response ? 'Edit Response' : 'Respond to Review'}
      >
        <View className="gap-4">
          <Text className="text-sm text-muted">
            Respond professionally to customer feedback. Your response will be visible to all customers.
          </Text>

          <Textarea
            placeholder="Thank you for your feedback..."
            value={responseText}
            onChangeText={setResponseText}
            numberOfLines={4}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <SecondaryButton
                onPress={() => setShowResponseModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </SecondaryButton>
            </View>
            <View className="flex-1">
              <PrimaryButton
                onPress={handleSubmitResponse}
                loading={isSubmitting}
              >
                Post Response
              </PrimaryButton>
            </View>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

// Example usage screen
export function ReviewsWithResponsesScreen() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      customerName: 'Sarah K.',
      rating: 5,
      comment: 'Excellent service! Very professional and on time.',
      date: '2026-01-02',
    },
    {
      id: '2',
      customerName: 'John D.',
      rating: 3,
      comment: 'Delivery was late, but the tasker was polite.',
      date: '2025-12-30',
      response: {
        text: 'Thank you for your feedback. We apologize for the delay and are working to improve our delivery times.',
        date: '2025-12-31',
      },
    },
  ]);

  const handleResponseSubmitted = (reviewId: string, responseText: string) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              response: {
                text: responseText,
                date: new Date().toISOString(),
              },
            }
          : review
      )
    );
  };

  return (
    <View>
      {reviews.map(review => (
        <ReviewResponse
          key={review.id}
          review={review}
          onResponseSubmitted={handleResponseSubmitted}
        />
      ))}
    </View>
  );
}
