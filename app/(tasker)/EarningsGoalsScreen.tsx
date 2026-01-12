// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, ModalInput, Platform, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Button, PrimaryButton, SecondaryButton, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyStateView, ProgressBar } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { useEarningsGoalsStore, GoalPeriod, EarningsGoal } from '@/stores/earnings-goals-store';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';
import { Target, Trash2 } from 'lucide-react-native';
  const PERIOD_OPTIONS: { value: GoalPeriod; label: string; icon: string }[] = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️' },
];

export default function EarningsGoalsScreen() { const colors = useColors();
  const { goals,
    createGoal,
    deleteGoal,
    loadGoals,
    getGoalProgress,
    getActiveGoals} = useEarningsGoalsStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod>('daily');
  const [targetAmount, setTargetAmount] = useState('200');

  useEffect(() => { loadGoals(); }, []);
  const activeGoals = getActiveGoals();
  const handleHaptic = (style = Haptics.ImpactFeedbackStyle.Light) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(style); } };
  const handleCreateGoal = async () => { const amount = Number(targetAmount);
    
    if (amount <= 0) { return; }

    handleHaptic(Haptics.ImpactFeedbackStyle.Medium);
    await createGoal(selectedPeriod, amount);
    setModalVisible(false);
    setTargetAmount('200'); };
  const handleDeleteGoal = async (id: string) => { handleHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    await deleteGoal(id); };
  const getTimeRemaining = (endDate: Date) => { const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`; };
  const renderGoalCard = (goal: EarningsGoal) => { const progress = getGoalProgress(goal.id);
  const isAchieved = goal.status === 'achieved';
  const isMissed = goal.status === 'missed';

    return (
      <Card 
        key={goal.id} 
        variant="flat" 
        padding="md"
        className={cn(
          'mb-3',
          isAchieved && 'border-2 border-success',
          isMissed && 'opacity-60'
        )}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text variant="body" weight="semibold" className="text-foreground mb-1">
              {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)} Goal
            </Text>
            <Text variant="h4" weight="bold" className="text-primary">
              K{goal.currentAmount.toFixed(0)} / K{goal.targetAmount}
            </Text>
          </View>
          {goal.status === 'active' && (
            <IconButton
              icon={<Trash2 size={18} color={colors.muted} />}
              onPress={() => handleDeleteGoal(goal.id)}
              variant="ghost"
              size="sm"
            />
          )}
        </View>

        {/* Progress Bar */}
        <ProgressBar
          progress={progress}
          color={isAchieved ? 'success' : isMissed ? 'warning' : 'primary'}
          height="md"
        />

        <View className="flex-row justify-between items-center mt-3">
          <Text variant="caption" className="text-muted">
            {progress.toFixed(0)}% Complete
          </Text>
          {goal.status === 'active' && (
            <Text variant="caption" className="text-muted">
              {getTimeRemaining(goal.endDate)}
            </Text>
          )}
          {isAchieved && (
            <Text variant="caption" weight="semibold" className="text-success">
              ✓ Achieved
            </Text>
          )}
          {isMissed && (
            <Text variant="caption" weight="semibold" className="text-error">
              ✗ Missed
            </Text>
          )}
        </View>
      </Card>
    ); };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView 
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-5">
          <Text variant="h2" weight="bold" className="text-foreground">
            Earnings Goals
          </Text>
          <Button
            title="+ New Goal"
            onPress={() => { handleHaptic();
              setModalVisible(true); }}
            size="sm"
          />
        </View>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View className="mb-6">
            <Text variant="body" weight="semibold" className="text-foreground mb-3">
              Active Goals
            </Text>
            {activeGoals.map(renderGoalCard)}
          </View>
        )}

        {/* Completed/Missed Goals */}
        {goals.filter((g) => g.status !== 'active').length > 0 && (
          <View className="mb-6">
            <Text variant="body" weight="semibold" className="text-foreground mb-3">
              Past Goals
            </Text>
            {goals
              .filter((g) => g.status !== 'active')
              .slice(0, 5)
              .map(renderGoalCard)}
          </View>
        )}

        {goals.length === 0 && (
          <EmptyStateView
            icon={<Target size={32} color={colors.muted} />}
            title="No Goals Yet"
            description="Set earnings goals to track your progress and stay motivated"
            action={{ label: 'Create Goal',
              onPress: () => setModalVisible(true)}}
          />
        )}
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-5">
            <Text variant="h3" weight="bold" className="text-foreground mb-5">
              Create Earnings Goal
            </Text>

            {/* Period Selection */}
            <Text variant="caption" weight="semibold" className="text-muted mb-2">
              Goal Period
            </Text>
            <View className="flex-row gap-2 mb-4">
              {PERIOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  onPress={() => { handleHaptic();
                    setSelectedPeriod(option.value); }}
                  variant={selectedPeriod === option.value ? 'primary' : 'outline'}
                  size="sm"
                  className="flex-1 flex-row gap-1.5"
                >
                  <Text className="text-base">{option.icon}</Text>
                  <Text 
                    variant="caption"
                    weight={selectedPeriod === option.value ? 'semibold' : 'regular'}
                    className={selectedPeriod === option.value ? 'text-white' : 'text-foreground'}
                  >
                    {option.label}
                  </Text>
                </Button>
              ))}
            </View>

            {/* Target Amount */}
            <Text variant="caption" weight="semibold" className="text-muted mb-2">
              Target Amount (K)
            </Text>
            <TextInput
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
              placeholder="200"
              className="bg-surface text-foreground border border-border rounded-xl p-3 mb-5"
              placeholderTextColor={colors.muted}
            />

            <View className="flex-row gap-3">
              <SecondaryButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                className="flex-1"
              />
              <PrimaryButton
                title="Create Goal"
                onPress={handleCreateGoal}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

