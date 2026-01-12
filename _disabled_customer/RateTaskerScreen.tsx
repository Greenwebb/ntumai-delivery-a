// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Image, Platform, Pressable, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { Star, ThumbsUp, ThumbsDown, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { isDemoMode } from '@/lib/config/demo-mode';
  const QUICK_REVIEWS = [
  'Great service!',
  'Very professional',
  'On time',
  'Friendly',
  'Careful handling',
  'Would recommend',
];

export default function RateTaskerScreen() { const router = useRouter();
  const colors = useColors();
  const { taskId, taskerId, taskerName, taskerPhoto } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedQuickReviews, setSelectedQuickReviews] = useState<string[]>([]);
  const [tip, setTip] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const handleStarPress = (star: number) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    setRating(star); };
  const toggleQuickReview = (text: string) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    setSelectedQuickReviews((prev) =>
      prev.includes(text) ? prev.filter((r) => r !== text) : [...prev, text]
    ); };
  const handleTipSelect = (amount: number) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    setTip(amount); };
  const handleSubmit = async () =>  {
    if (rating === 0)  {
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
      alert('Please select a rating');
      return; }

    setSubmitting(true);

    try  {
    if (isDemoMode()) { // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000)); }

      if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }

      // Navigate back to home
      router.replace('/(customer)/(tabs)'); } catch (error)  {
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
      alert('Failed to submit rating'); } finally { setSubmitting(false); } };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text variant="h2" weight="bold" className="mb-2">Rate Your Experience</Text>
          <Text variant="body" color="muted" className="text-center">
            Help us improve by rating your tasker
          </Text>
        </View>

        {/* Tasker Info */}
        <Card className="p-4 mb-6 items-center">
          <Image
            source={{ uri: taskerPhoto || 'https://i.pravatar.cc/150?img=12' 
      }}
            className="w-24 h-24 rounded-full mb-3"
          />
          <Text variant="h3" weight="bold">{taskerName || 'Tasker'}</Text>
          <Text variant="bodySmall" color="muted">Task #{taskId}</Text>
        </Card>

        {/* Star Rating */}
        <Card className="p-6 mb-6">
          <Text variant="h4" weight="bold" className="mb-4 text-center">
            How was your experience?
          </Text>
          <View className="flex-row justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={star}
                onPress={() => handleStarPress(star)}
                className="p-2"
              >
                <Star
                  size={40}
                  color={star <= rating ? colors.warning : colors.border}
                  fill={star <= rating ? colors.warning : 'transparent'}
                />
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <Text variant="body" color="muted" className="text-center mt-3">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Great!'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </Text>
          )}
        </Card>

        {/* Quick Reviews */}
        {rating > 0 && (
          <Card className="p-4 mb-6">
            <Text variant="h4" weight="bold" className="mb-3">
              What did you like?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {QUICK_REVIEWS.map((text) => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={text}
                  onPress={() => toggleQuickReview(text)}
                  className={`px-4 py-2 rounded-full border ${ selectedQuickReviews.includes(text)
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border' }`}
                >
                  <Text
                    variant="bodySmall"
                    weight="medium"
                    className={selectedQuickReviews.includes(text) ? 'text-white' : 'text-foreground'}
                  >
                    {text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        {/* Written Review */}
        {rating > 0 && (
          <Card className="p-4 mb-6">
            <Text variant="h4" weight="bold" className="mb-3">
              Additional Comments (Optional)
            </Text>
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder="Share more about your experience..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-xl p-4 text-foreground"
              style={{ textAlignVertical: 'top', minHeight: 100 }}
            />
          </Card>
        )}

        {/* Tip */}
        {rating >= 4 && (
          <Card className="p-4 mb-6">
            <Text variant="h4" weight="bold" className="mb-3">
              Add a Tip (Optional)
            </Text>
            <View className="flex-row gap-3">
              {[10, 20, 50, 100].map((amount) => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={amount}
                  onPress={() => handleTipSelect(amount)}
                  className={`flex-1 py-3 rounded-xl border ${ tip === amount
                      ? 'bg-success border-success'
                      : 'bg-surface border-border' }`}
                >
                  <Text
                    variant="body"
                    weight="bold"
                    className={`text-center ${tip === amount ? 'text-white' : 'text-foreground'}`}
                  >
                    K {amount}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        {/* Submit Button */}
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSubmit}
          disabled={submitting || rating === 0}
          className={`py-4 rounded-xl items-center mb-6 flex-row justify-center ${ rating === 0 ? 'bg-surface' : 'bg-primary' }`}
        >
          <Send size={20} color={rating === 0 ? colors.muted : 'white'} />
          <Text
            variant="body"
            weight="bold"
            className={`ml-2 ${rating === 0 ? 'text-muted' : 'text-white'}`}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Text>
        </Pressable>

        {/* Skip */}
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.replace('/(customer)/(tabs)')}
          className="py-3 items-center mb-6"
        >
          <Text variant="body" color="muted">Skip for now</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

