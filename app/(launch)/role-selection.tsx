// @ts-nocheck
import React, { useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

/**
 * Role Selection Screen (ContinueBoarding)
 * 
 * Follows reference app design pattern from ContinueBoarding.tsx:
 * - Logo at top center
 * - Congratulations message
 * - "Sanka che! What will be done?" section with background
 * - Two option cards with radio buttons (Order Deliveries / Register as Tasker)
 * - Continue button at bottom
 * - Uses ScreenContainer for safe area handling
 */
export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'customer' | 'tasker' | 'vendor'>('customer');

  const handleOptionSelect = (option: 'customer' | 'tasker' | 'vendor') => {
    setSelectedOption(option);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleContinue = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Navigate based on selected option
    router.push(`/(auth)/phone-input?role=${selectedOption}`);
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/splash_style.png')} 
      className="flex-1"
      resizeMode="cover"
    >
      <ScreenContainer className="bg-white">
        {/* Header with logo */}
        <View className="items-center mt-16">
          <Logo size="lg" className="mb-10 mt-10" />
        </View>

        {/* Congratulations text */}
        <View className="px-6 mb-8">
          <Text className="text-primary text-3xl font-bold text-left mb-2">
            Congratulations,
          </Text>
          <Text className="text-primary text-3xl font-bold text-left mb-8">
            You are ready to start!
          </Text>
        </View>

        {/* Sanka che section */}
        <View className="mb-6">
          <ImageBackground
            source={require('@/assets/images/splash_style.png')} 
            className="h-32"
            resizeMode="cover"
            style={{ opacity: 1 }}
          >
            <View className="bg-primary/70 p-10 mb-4">
              <Text className="text-white text-xl font-semibold">
                Sanka che!
              </Text>
              <Text className="text-white text-xl opacity-90">
                What will be done?
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Three option buttons */}
        <View className="mx-6 mb-8 mt-12 gap-3">
          {/* Order Deliveries Option */}
          <TouchableOpacity
            className="bg-primary rounded-xl p-6"
            onPress={() => handleOptionSelect('customer')}
            activeOpacity={0.8}
          >
            <View className="flex-row justify-between items-center w-full">
              <View>
                <Text className="text-white text-xs text-left font-medium">
                  Order Deliveries
                </Text>
                <Text className="text-white text-xs opacity-80 text-left">
                  within 30 min
                </Text>
              </View>
              <View className="bg-white rounded-full w-6 h-6 items-center justify-center">
                <View
                  className={`rounded-full ${
                    selectedOption === 'customer' ? 'bg-primary w-4 h-4' : ''
                  }`}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Register as a Tasker Option */}
          <TouchableOpacity
            className="bg-yellow-100 rounded-xl p-6"
            onPress={() => handleOptionSelect('tasker')}
            activeOpacity={0.8}
          >
            <View className="flex-row justify-between items-center w-full">
              <View>
                <Text className="text-primary text-xs font-medium text-left">
                  Register as a tasker
                </Text>
                <Text className="text-primary text-xs opacity-80 text-left">
                  Earn money delivering orders
                </Text>
              </View>
              <View className="bg-white rounded-full w-6 h-6 items-center justify-center">
                <View
                  className={`rounded-full ${
                    selectedOption === 'tasker' ? 'bg-primary w-4 h-4' : ''
                  }`}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Register as a Vendor Option */}
          <TouchableOpacity
            className="bg-green-100 rounded-xl p-6"
            onPress={() => handleOptionSelect('vendor')}
            activeOpacity={0.8}
          >
            <View className="flex-row justify-between items-center w-full">
              <View>
                <Text className="text-primary text-xs font-medium text-left">
                  Register as a vendor
                </Text>
                <Text className="text-primary text-xs opacity-80 text-left">
                  Sell your products online
                </Text>
              </View>
              <View className="bg-white rounded-full w-6 h-6 items-center justify-center">
                <View
                  className={`rounded-full ${
                    selectedOption === 'vendor' ? 'bg-primary w-4 h-4' : ''
                  }`}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Continue button */}
        <View className="mx-6 mt-6 mb-8">
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      </ScreenContainer>
    </ImageBackground>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

