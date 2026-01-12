// @ts-nocheck
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useColors } from '@/hooks/use-colors';
import { Skeleton, SkeletonText, SkeletonCard } from '@/components/ui/skeleton';

/**
 * Branded loading skeleton for AuthGuard
 * Shows a polished loading state while authentication is being verified
 */
export function AuthLoadingSkeleton() {
  const colors = useColors();
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0.7);

  useEffect(() => {
    // Subtle pulse animation for the logo
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    logoOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.7, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  return (
    <View className="flex-1 bg-background">
      {/* Header skeleton */}
      <View className="pt-16 px-6 pb-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Skeleton width={120} height={24} borderRadius="sm" className="mb-2" />
            <Skeleton width={180} height={16} borderRadius="sm" />
          </View>
          <Skeleton width={48} height={48} borderRadius="full" />
        </View>
      </View>

      {/* Logo/Brand section */}
      <View className="items-center py-8">
        <Animated.View 
          style={[logoAnimatedStyle]}
          className="w-20 h-20 rounded-2xl bg-primary items-center justify-center mb-4"
        >
          <View className="w-12 h-12 rounded-xl bg-background/20" />
        </Animated.View>
        <Skeleton width={100} height={20} borderRadius="sm" className="mb-2" />
        <Skeleton width={160} height={14} borderRadius="sm" />
      </View>

      {/* Content skeleton */}
      <View className="flex-1 px-6">
        {/* Search bar skeleton */}
        <Skeleton width="100%" height={48} borderRadius="lg" className="mb-6" />

        {/* Category pills skeleton */}
        <View className="flex-row mb-6">
          <Skeleton width={80} height={36} borderRadius="full" className="mr-3" />
          <Skeleton width={100} height={36} borderRadius="full" className="mr-3" />
          <Skeleton width={70} height={36} borderRadius="full" className="mr-3" />
          <Skeleton width={90} height={36} borderRadius="full" />
        </View>

        {/* Cards skeleton */}
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] mb-4">
            <SkeletonCard />
          </View>
          <View className="w-[48%] mb-4">
            <SkeletonCard />
          </View>
        </View>

        {/* List items skeleton */}
        <View className="mt-4">
          <Skeleton width="40%" height={20} borderRadius="sm" className="mb-4" />
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-row items-center py-3 border-b border-border">
              <Skeleton width={56} height={56} borderRadius="md" className="mr-4" />
              <View className="flex-1">
                <Skeleton width="70%" height={18} borderRadius="sm" className="mb-2" />
                <Skeleton width="50%" height={14} borderRadius="sm" />
              </View>
              <Skeleton width={60} height={24} borderRadius="sm" />
            </View>
          ))}
        </View>
      </View>

      {/* Bottom tab bar skeleton */}
      <View className="flex-row justify-around items-center py-4 px-6 border-t border-border bg-surface">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="items-center">
            <Skeleton width={24} height={24} borderRadius="sm" className="mb-1" />
            <Skeleton width={40} height={10} borderRadius="sm" />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Simple loading spinner with brand colors
 * For smaller loading states
 */
export function BrandedSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const colors = useColors();
  const rotation = useSharedValue(0);

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const spinnerSize = sizeMap[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: spinnerSize / 2,
          borderWidth: 3,
          borderColor: colors.border,
          borderTopColor: colors.primary,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Full screen loading state with branded spinner
 */
export function FullScreenLoader({ message = 'Loading...' }: { message?: string }) {
  const colors = useColors();

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <BrandedSpinner size="large" />
      <Animated.Text 
        className="text-muted mt-4 text-base"
        style={{ color: colors.muted }}
      >
        {message}
      </Animated.Text>
    </View>
  );
}
