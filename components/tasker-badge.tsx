// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeRequirements {
  tier: BadgeTier;
  minDeliveries: number;
  minRating: number;
  minCompletionRate: number;
  benefits: string[];
}

export const BADGE_TIERS: BadgeRequirements[] = [
  {
    tier: 'bronze',
    minDeliveries: 0,
    minRating: 0,
    minCompletionRate: 0,
    benefits: ['Access to standard deliveries', 'Basic support'],
  },
  {
    tier: 'silver',
    minDeliveries: 50,
    minRating: 4.5,
    minCompletionRate: 90,
    benefits: ['Priority job offers', 'Reduced platform fees (2%)', 'Extended support hours'],
  },
  {
    tier: 'gold',
    minDeliveries: 200,
    minRating: 4.7,
    minCompletionRate: 95,
    benefits: ['First access to high-value jobs', 'Reduced platform fees (5%)', '24/7 priority support', 'Monthly bonus eligibility'],
  },
  {
    tier: 'platinum',
    minDeliveries: 500,
    minRating: 4.9,
    minCompletionRate: 98,
    benefits: ['Exclusive premium jobs', 'Reduced platform fees (10%)', 'Dedicated account manager', 'Weekly bonus eligibility', 'Featured tasker status'],
  },
];

const BADGE_COLORS: Record<BadgeTier, { primary: string; secondary: string; glow: string }> = {
  bronze: { primary: '#CD7F32', secondary: '#8B4513', glow: 'rgba(205, 127, 50, 0.3)' },
  silver: { primary: '#C0C0C0', secondary: '#808080', glow: 'rgba(192, 192, 192, 0.3)' },
  gold: { primary: '#FFD700', secondary: '#DAA520', glow: 'rgba(255, 215, 0, 0.3)' },
  platinum: { primary: '#E5E4E2', secondary: '#A0A0A0', glow: 'rgba(229, 228, 226, 0.4)' },
};

export interface TaskerStats {
  totalDeliveries: number;
  rating: number;
  completionRate: number;
  currentTier: BadgeTier;
}

interface TaskerBadgeProps {
  tier: BadgeTier;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onPress?: () => void;
  animated?: boolean;
  className?: string;
}

export function TaskerBadge({ tier, size = 'medium', showLabel = true, onPress, animated = false, className }: TaskerBadgeProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);
  const colors = BADGE_COLORS[tier];

  const sizeConfig = {
    small: { badge: 32, icon: 16, fontSize: 10 },
    medium: { badge: 48, icon: 24, fontSize: 12 },
    large: { badge: 72, icon: 36, fontSize: 16 },
  };
  const config = sizeConfig[size];

  useEffect(() => {
    if (animated) {
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(300, withSpring(1.2, { damping: 8 })),
        withSpring(1, { damping: 12 })
      );
      rotation.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(300, withTiming(360, { duration: 800, easing: Easing.out(Easing.cubic) }))
      );
      glow.value = withDelay(1000, withSequence(withTiming(1, { duration: 500 }), withTiming(0.5, { duration: 500 })));
    }
  }, [animated]);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotateY: `${rotation.value}deg` }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.3 }],
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withTiming(0.9, { duration: 100 }), withSpring(1, { damping: 10 }));
    onPress?.();
  };

  const getBadgeIcon = () => {
    const icons = { bronze: 'award', silver: 'award', gold: 'star', platinum: 'zap' };
    return icons[tier] || 'award';
  };

  const content = (
    <View className={`items-center ${className || ''}`}>
      <Animated.View className="absolute items-center justify-center" style={animatedGlowStyle}>
        <View style={{ width: config.badge * 1.5, height: config.badge * 1.5, borderRadius: config.badge * 0.75, backgroundColor: colors.glow }} />
      </Animated.View>
      <Animated.View
        className="items-center justify-center border-2"
        style={[animatedBadgeStyle, { width: config.badge, height: config.badge, borderRadius: config.badge / 2, backgroundColor: colors.primary, borderColor: colors.secondary }]}
      >
        <Feather name={getBadgeIcon()} size={config.icon} color={tier === 'platinum' ? '#1F2937' : 'white'} />
      </Animated.View>
      {showLabel && (
        <Text className="mt-1 font-semibold" style={{ fontSize: config.fontSize, color: colors.secondary }}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>{content}</Pressable>;
  }
  return content;
}

interface BadgeProgressProps {
  stats: TaskerStats;
  showDetails?: boolean;
  className?: string;
}

export function BadgeProgress({ stats, showDetails = true, className }: BadgeProgressProps) {
  const currentTierIndex = BADGE_TIERS.findIndex(t => t.tier === stats.currentTier);
  const nextTier = BADGE_TIERS[currentTierIndex + 1];

  if (!nextTier) {
    return (
      <View className={`bg-surface rounded-2xl p-4 ${className || ''}`}>
        <View className="flex-row items-center">
          <TaskerBadge tier={stats.currentTier} size="small" showLabel={false} />
          <Text className="ml-3 text-base font-semibold text-foreground">Platinum Tasker</Text>
        </View>
        <Text className="mt-2 text-sm text-muted">Congratulations! You've reached the highest tier.</Text>
      </View>
    );
  }

  const deliveryProgress = Math.min((stats.totalDeliveries / nextTier.minDeliveries) * 100, 100);
  const ratingProgress = Math.min((stats.rating / nextTier.minRating) * 100, 100);
  const completionProgress = Math.min((stats.completionRate / nextTier.minCompletionRate) * 100, 100);
  const overallProgress = (deliveryProgress + ratingProgress + completionProgress) / 3;

  return (
    <View className={`bg-surface rounded-2xl p-4 ${className || ''}`}>
      <View className="flex-row items-center justify-between">
        <TaskerBadge tier={stats.currentTier} size="small" showLabel={false} />
        <View className="flex-1 mx-3">
          <Text className="text-sm font-semibold text-foreground">Progress to {nextTier.tier.charAt(0).toUpperCase() + nextTier.tier.slice(1)}</Text>
          <Text className="text-xs text-muted">{Math.round(overallProgress)}% complete</Text>
        </View>
        <TaskerBadge tier={nextTier.tier} size="small" showLabel={false} />
      </View>

      <View className="mt-3 h-2 bg-border rounded-full overflow-hidden">
        <View className="h-full rounded-full" style={{ width: `${overallProgress}%`, backgroundColor: BADGE_COLORS[nextTier.tier].primary }} />
      </View>

      {showDetails && (
        <View className="mt-4 gap-3">
          <ProgressItem icon="package" label="Deliveries" current={stats.totalDeliveries} target={nextTier.minDeliveries} progress={deliveryProgress} />
          <ProgressItem icon="star" label="Rating" current={stats.rating.toFixed(1)} target={nextTier.minRating} progress={ratingProgress} />
          <ProgressItem icon="check-circle" label="Completion" current={`${stats.completionRate}%`} target={`${nextTier.minCompletionRate}%`} progress={completionProgress} />
        </View>
      )}
    </View>
  );
}

function ProgressItem({ icon, label, current, target, progress }: { icon: string; label: string; current: string | number; target: string | number; progress: number }) {
  return (
    <View className="flex-row items-center">
      <Feather name={icon} size={14} color="#6B7280" />
      <Text className="ml-2 text-xs text-muted flex-1">{label}</Text>
      <Text className="text-xs text-foreground mr-2">{current} / {target}</Text>
      <View className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
        <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
      </View>
    </View>
  );
}

interface BadgeUnlockAnimationProps {
  tier: BadgeTier;
  onComplete?: () => void;
  className?: string;
}

export function BadgeUnlockAnimation({ tier, onComplete, className }: BadgeUnlockAnimationProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    scale.value = withSequence(withSpring(1.2, { damping: 8 }), withSpring(1, { damping: 12 }));
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  const tierInfo = BADGE_TIERS.find(t => t.tier === tier);

  return (
    <Animated.View className={`absolute inset-0 bg-black/80 items-center justify-center ${className || ''}`} style={animatedStyle}>
      <View className="items-center p-8">
        <Text className="text-white text-lg font-semibold mb-4">🎉 Badge Unlocked!</Text>
        <TaskerBadge tier={tier} size="large" animated />
        <Text className="text-white text-xl font-bold mt-4">{tier.charAt(0).toUpperCase() + tier.slice(1)} Tasker</Text>
        {tierInfo && (
          <View className="mt-4 items-center">
            <Text className="text-white/80 text-sm mb-2">New Benefits:</Text>
            {tierInfo.benefits.slice(0, 3).map((benefit, i) => (
              <Text key={i} className="text-white/70 text-xs">• {benefit}</Text>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export function calculateBadgeTier(stats: Omit<TaskerStats, 'currentTier'>): BadgeTier {
  for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
    const tier = BADGE_TIERS[i];
    if (stats.totalDeliveries >= tier.minDeliveries && stats.rating >= tier.minRating && stats.completionRate >= tier.minCompletionRate) {
      return tier.tier;
    }
  }
  return 'bronze';
}

export default TaskerBadge;
