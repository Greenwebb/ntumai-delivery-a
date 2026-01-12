// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, DestructiveButton } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { BottomSheet, AlertModal } from '@/components/ui/modal';
import { LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Violation {
  id: string;
  type: 'late' | 'no_show' | 'misconduct' | 'safety';
  description: string;
  date: string;
  severity: 'warning' | 'strike';
  appealStatus?: 'pending' | 'approved' | 'rejected';
  appealReason?: string;
}

const MOCK_VIOLATIONS: Violation[] = [
  {
    id: '1',
    type: 'late',
    description: 'Delivery completed 45 minutes after estimated time',
    date: '2026-01-02',
    severity: 'warning',
  },
  {
    id: '2',
    type: 'no_show',
    description: 'Failed to show up for accepted delivery',
    date: '2025-12-28',
    severity: 'strike',
    appealStatus: 'pending',
    appealReason: 'Vehicle breakdown - have mechanic receipt',
  },
];

export default function ViolationsScreen() {
  const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [strikeCount, setStrikeCount] = useState(1);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealEvidence, setAppealEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setViolations(MOCK_VIOLATIONS);
      setStrikeCount(MOCK_VIOLATIONS.filter(v => v.severity === 'strike').length);
    } catch (error) {
      toast.error('Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  const handleAppealViolation = (violation: Violation) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedViolation(violation);
    setAppealReason(violation.appealReason || '');
    setShowAppealModal(true);
  };

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      toast.info('Please provide a reason for your appeal');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Appeal submitted successfully. We will review it within 24-48 hours.');
      
      setShowAppealModal(false);
      setAppealReason('');
      setAppealEvidence('');
      loadViolations();
    } catch (error) {
      toast.error('Failed to submit appeal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getViolationIcon = (type: Violation['type']) => {
    switch (type) {
      case 'late': return 'clock';
      case 'no_show': return 'x-circle';
      case 'misconduct': return 'alert-triangle';
      case 'safety': return 'shield-off';
      default: return 'alert-circle';
    }
  };

  const getViolationColor = (severity: Violation['severity']) => {
    return severity === 'strike' ? colors.error : colors.warning;
  };

  const getAppealStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return colors.success;
      case 'rejected': return colors.error;
      case 'pending': return colors.warning;
      default: return colors.muted;
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading violations..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
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
            <Text className="text-2xl font-bold">Violations & Strikes</Text>
            <Text className="text-sm text-muted">Three-Strike Policy</Text>
          </View>
        </View>

        {/* Strike Counter */}
        <View 
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: strikeCount >= 3 ? colors.error + '20' : colors.surface }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold">Current Strikes</Text>
            <View className="flex-row gap-2">
              {[1, 2, 3].map((strike) => (
                <View
                  key={strike}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ 
                    backgroundColor: strike <= strikeCount ? colors.error : colors.border 
                  }}
                >
                  <Text 
                    className="font-bold"
                    style={{ color: strike <= strikeCount ? '#FFF' : colors.muted }}
                  >
                    {strike}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {strikeCount >= 3 ? (
            <View className="p-4 rounded-xl" style={{ backgroundColor: colors.error + '30' }}>
              <View className="flex-row items-center gap-2 mb-2">
                <Feather name="alert-octagon" size={20} color={colors.error} />
                <Text className="font-semibold" style={{ color: colors.error }}>
                  Account Suspended
                </Text>
              </View>
              <Text className="text-sm text-muted">
                Your account has been suspended due to 3 strikes. Please contact support to appeal.
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-muted">
              {strikeCount === 0 && 'No strikes. Keep up the good work!'}
              {strikeCount === 1 && 'You have 1 strike. Be careful - 2 more strikes will result in suspension.'}
              {strikeCount === 2 && 'You have 2 strikes. One more strike will result in account suspension.'}
            </Text>
          )}
        </View>

        {/* Policy Explanation */}
        <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-semibold mb-3">Three-Strike Policy</Text>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <Feather name="info" size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="font-medium mb-1">Warnings</Text>
                <Text className="text-sm text-muted">
                  Minor violations result in warnings. Multiple warnings may lead to a strike.
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <Feather name="alert-triangle" size={20} color={colors.warning} />
              <View className="flex-1">
                <Text className="font-medium mb-1">Strikes</Text>
                <Text className="text-sm text-muted">
                  Serious violations (no-shows, safety issues) result in strikes.
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <Feather name="shield-off" size={20} color={colors.error} />
              <View className="flex-1">
                <Text className="font-medium mb-1">Suspension</Text>
                <Text className="text-sm text-muted">
                  3 strikes within 90 days results in account suspension.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Violations List */}
        <Text className="text-lg font-semibold mb-4">Violation History</Text>
        
        {violations.length === 0 ? (
          <EmptyStateView
            icon="check-circle"
            title="No Violations"
            message="You have a clean record. Keep up the excellent work!"
          />
        ) : (
          <View className="gap-4 mb-6">
            {violations.map((violation) => (
              <View
                key={violation.id}
                className="rounded-2xl p-4"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-start gap-3 mb-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: getViolationColor(violation.severity) + '20' }}
                  >
                    <Feather
                      name={getViolationIcon(violation.type)}
                      size={20}
                      color={getViolationColor(violation.severity)}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="font-semibold capitalize">
                        {violation.type.replace('_', ' ')}
                      </Text>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: getViolationColor(violation.severity) + '20' }}
                      >
                        <Text
                          className="text-xs font-medium capitalize"
                          style={{ color: getViolationColor(violation.severity) }}
                        >
                          {violation.severity}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-muted mb-2">{violation.description}</Text>
                    <Text className="text-xs text-muted">
                      {new Date(violation.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                {violation.appealStatus && (
                  <View
                    className="p-3 rounded-xl mb-3"
                    style={{ backgroundColor: getAppealStatusColor(violation.appealStatus) + '20' }}
                  >
                    <Text
                      className="text-sm font-medium mb-1"
                      style={{ color: getAppealStatusColor(violation.appealStatus) }}
                    >
                      Appeal {violation.appealStatus}
                    </Text>
                    {violation.appealReason && (
                      <Text className="text-xs text-muted">{violation.appealReason}</Text>
                    )}
                  </View>
                )}

                {violation.severity === 'strike' && !violation.appealStatus && (
                  <SecondaryButton
                    onPress={() => handleAppealViolation(violation)}
                    size="sm"
                  >
                    Appeal This Strike
                  </SecondaryButton>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Appeal Modal */}
      <BottomSheet
        visible={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        title="Appeal Violation"
      >
        <View className="gap-4">
          <Text className="text-sm text-muted">
            Explain why you believe this violation should be removed. Include any evidence or context.
          </Text>

          <Textarea
            placeholder="Reason for appeal..."
            value={appealReason}
            onChangeText={setAppealReason}
            numberOfLines={4}
          />

          <Input
            placeholder="Evidence (e.g., receipt number, photo reference)"
            value={appealEvidence}
            onChangeText={setAppealEvidence}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <SecondaryButton
                onPress={() => setShowAppealModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </SecondaryButton>
            </View>
            <View className="flex-1">
              <PrimaryButton
                onPress={handleSubmitAppeal}
                loading={isSubmitting}
              >
                Submit Appeal
              </PrimaryButton>
            </View>
          </View>
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

