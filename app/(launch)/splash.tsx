// @ts-nocheck
import { useEffect } from 'react';
import { View, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { Logo } from '@/components/ui/logo';
import { useColors } from '@/hooks/use-colors';

/**
 * Splash Screen - First screen shown when app launches
 * 
 * Features:
 * - Solid primary color background
 * - Transparent gradient/pattern overlay
 * - Small centered logo with fade-in animation
 * - Loading indicator at bottom
 * - Minimum 3-second display time
 * - Auto-navigates to onboarding after loading
 */
export default function SplashScreen() {
  const router = useRouter();
  const colors = useColors();
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo from invisible to visible
    logoOpacity.value = withTiming(1, {
      duration: 1500,
      easing: Easing.inOut(Easing.cubic),
    });

    // Ensure minimum 3-second display time
    const minDisplayTime = 3000;
    const startTime = Date.now();

    const initialize = async () => {
      // Simulate resource loading
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate remaining time to meet minimum display
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      // Wait for remaining time before navigating
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      router.replace('/(launch)/onboarding');
    };

    initialize();
  }, [router]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  return (
    <ScreenContainer className="bg-primary">
      {/* Transparent gradient/pattern overlay */}
      <ImageBackground
        source={require('@/assets/images/splash-background.png')}
        className="flex-1 items-center justify-center"
        resizeMode="cover"
      >
        {/* Centered Logo with fade-in animation */}
        <Animated.View style={animatedLogoStyle} className="items-center">
          <Logo size="xl" variant="light" />
        </Animated.View>

        {/* Bottom Loader with spacing */}
        <View className="absolute bottom-24 items-center w-full">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </ImageBackground>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

