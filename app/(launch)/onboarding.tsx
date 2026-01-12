// @ts-nocheck
import { View, Image, FlatList, Dimensions, ImageBackground } from 'react-native';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const onboardingSlides = [
  {
    id: '1',
    image: require('@/assets/images/onboarding-1.png'),
    title: 'Quick Deliveries at your fingertips',
    description: 'Find your favorite Meals at the best prices with exclusive deals only on Ntumai app.',
  },
  {
    id: '2',
    image: require('@/assets/images/onboarding-2.png'),
    title: 'Support Local Vendors',
    description: 'Connect with local businesses and get fresh products delivered to your doorstep.',
  },
  {
    id: '3',
    image: require('@/assets/images/onboarding-3.png'),
    title: 'Reliable Task Services',
    description: 'Get help with errands, deliveries, and tasks from verified service providers.',
  },
];

/**
 * Onboarding Screen
 * 
 * Features a carousel of 3 slides with illustrations, followed by action buttons
 * in a colored section with gradient overlay (matching reference app design).
 * 
 * Layout Pattern:
 * - Top section: White background with carousel
 * - Bottom section: Primary color with gradient overlay and buttons
 */
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setGuestMode = useAuthStore((state) => state.setGuestMode);
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    setGuestMode(true);
    router.push('/(guest)/dashboard');
  };

  const handleVendorTasker = () => {
    router.push('/(launch)/role-selection');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: typeof onboardingSlides[0] }) => (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1 items-center justify-center px-6">
      {/* Illustration */}
      <View className="w-full aspect-square max-w-sm mb-6">
        <Image
          source={item.image}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold text-primary text-center mb-4 px-4">
        {item.title}
      </Text>

      {/* Description */}
      <Text className="text-base text-gray-600 text-center leading-relaxed px-6">
        {item.description}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Top Section - Carousel */}
      <View className="flex-1 bg-white">
        <FlatList
          ref={flatListRef}
          data={onboardingSlides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />

        {/* Pagination Dots */}
        <View className="flex-row justify-center items-center gap-2 mb-6">
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              className={cn(
                'h-2 rounded-full',
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-border'
              )}
            />
          ))}
        </View>
      </View>

      {/* Bottom Section - Action Buttons with Gradient Overlay */}
      <View className="relative bg-primary" style={{ height: 200 }}>
        {/* Background Pattern Overlay */}
        <ImageBackground
          source={require('@/assets/images/splash-background.png')}
          className="absolute top-0 left-0 w-full h-full"
          resizeMode="cover"
          style={{ opacity: 0.3 }}
        />

        {/* Gradient Fade from White to Transparent */}
        <LinearGradient
          colors={['rgb(255, 255, 255)', 'transparent']}
          locations={[0, 0.3]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            zIndex: 1,
          }}
        />

        {/* Buttons */}
        <View className="flex-1 gap-3 px-6 justify-end z-10" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          {/* Get Started Button - White with Primary Text */}
          <Button
            title="Get started"
            onPress={handleGetStarted}
            variant="white"
            size="lg"
            fullWidth
          />

          {/* Continue as Vendor or Tasker - Black with White Text */}
          <Button
            title="Become a vendor or tasker"
            onPress={handleVendorTasker}
            variant="black"
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

