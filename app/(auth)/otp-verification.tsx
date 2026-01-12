// @ts-nocheck

import { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, Platform, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/text';
import { useToast } from '@/lib/toast-provider';
import { authApi } from '@/lib/api/auth';
import { isDemoMode, DEMO_CONFIG } from '@/lib/config/demo-mode';
import { demoApi } from '@/lib/api/demo-api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { validateOtp } from '@/lib/validation/auth';
import { useColors } from '@/hooks/use-colors';

const OTP_LENGTH = 4; // Reference app uses 4 digits

/**
 * OTP Verification Screen
 * 
 * Matches reference app OtpInputScreen.tsx design:
 * - Large header: "Get Started!" (text-5xl) + "Verify to Continue" (text-2xl)
 * - Countdown timer displayed prominently (text-2xl, text-primary)
 * - 4 OTP boxes (w-20 h-20) with primary border and shadow
 * - "Didn't Receive OTP? Resend" link
 * - "Use a different email or phone" link
 * - Verify button at bottom (bg-primary when valid, bg-gray-300 when disabled)
 */
export default function OTPVerificationScreen() {
  const router = useRouter();
  const { method, value } = useLocalSearchParams();
  const toast = useToast();
  const colors = useColors();
  
  const { setUser, setToken, clearVerificationState } = useAuthStore();
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(120); // 2 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow digits
    if (text.length <= 1 && /^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus next input
      if (text && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    try {
      // Validate OTP
      const validation = validateOtp(otpCode);
      if (!validation.isValid) {
        toast.error(validation.errors[0] || 'Invalid OTP');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }

      // Prepare credentials
      const methodType = typeof method === 'string' ? method : 'phone';
      const contactValue = typeof value === 'string' ? value : '';
      
      const credentials = methodType === 'phone'
        ? {
            phone: contactValue.replace(/^\+\d+/, ''),
            countryCode: contactValue.match(/^\+\d+/)?.[0] || '+254',
            otp: otpCode,
          }
        : {
            email: contactValue,
            otp: otpCode,
          };

      // Verify OTP
      setIsLoading(true);
      
      // In demo mode, accept code "1234" or any 4-digit code
      if (isDemoMode()) {
        setIsLoading(false);
        
        // Accept demo OTP code (1234 or 123456)
        const validDemoCodes = ['1234', '123456'];
        if (!validDemoCodes.includes(otpCode)) {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          toast.error('Demo mode: Use code 1234');
          return;
        }
        
        // Find demo user by email or create a new one
        const contactValue = typeof value === 'string' ? value : '';
        let demoUser = null;
        let demoRole: 'customer' | 'tasker' | 'vendor' = 'customer';
        
        // Check if this is a known demo user
        if (contactValue.includes('customer@demo.com')) {
          demoUser = DEMO_CONFIG.users.customer;
          demoRole = 'customer';
        } else if (contactValue.includes('tasker@demo.com')) {
          demoUser = DEMO_CONFIG.users.tasker;
          demoRole = 'tasker';
        } else if (contactValue.includes('vendor@demo.com')) {
          demoUser = DEMO_CONFIG.users.vendor;
          demoRole = 'vendor';
        } else {
          // Create a generic demo user
          demoUser = {
            id: 'demo-user-' + Date.now(),
            email: contactValue,
            name: 'Demo User',
            role: 'customer' as const,
          };
        }
        
        const user = {
          id: demoUser.id || 'demo-' + Date.now(),
          email: demoUser.email,
          name: demoUser.name,
          role: demoRole,
        };
        
        setUser(user);
        setToken('demo-token-' + Date.now());
        clearVerificationState();
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        toast.success('Demo login successful!');
        
        // Navigate based on role
        if (demoRole === 'customer') {
          router.replace('/(customer)/CustomerDashboard');
        } else if (demoRole === 'tasker') {
          router.replace('/(tasker)/TaskerDashboard');
        } else if (demoRole === 'vendor') {
          router.replace('/(vendor)/VendorDashboard');
        } else {
          router.replace('/(guest)/dashboard');
        }
        return;
      }
      
      // Real API call for non-demo mode
      const result = await authApi.verifyOtp(credentials);
      setIsLoading(false);

      if (result.success) {
        // Set auth state
        if (result.user) {
          setUser(result.user);
        }
        if (result.token) {
          setToken(result.token);
        }
        clearVerificationState();

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        toast.success('Verification successful!');

        // Navigate based on user role
        if (result.user?.role === 'customer') {
          router.replace('/(customer)/(tabs)/home');
        } else if (result.user?.role === 'tasker') {
          router.replace('/(tasker)/(tabs)/jobs');
        } else if (result.user?.role === 'vendor') {
          router.replace('/(vendor)/dashboard');
        } else {
          router.replace('/(guest)/dashboard');
        }
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        toast.error(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setIsLoading(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      toast.error(err?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const methodType = typeof method === 'string' ? method : 'phone';
      const contactValue = typeof value === 'string' ? value : '';
      
      const credentials = methodType === 'phone'
        ? {
            phone: contactValue.replace(/^\+\d+/, ''),
            countryCode: contactValue.match(/^\+\d+/)?.[0] || '+254',
          }
        : {
            email: contactValue,
          };

      // In demo mode, just reset the countdown
      if (isDemoMode()) {
        setCountdown(120);
        setIsResendDisabled(true);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        toast.success('Demo mode: Use code 1234');
        return;
      }
      
      await authApi.sendOtp(credentials);
      setCountdown(120);
      setIsResendDisabled(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      toast.success('OTP has been resent successfully.');
    } catch (err: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      toast.error(err?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        {/* Large Header */}
        <View className="pt-20 pb-8 px-6">
          <Text className="text-primary text-5xl font-bold mb-2">
            Get Started!
          </Text>
          <Text className="text-primary text-2xl font-medium">
            Verify to Continue
          </Text>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Instructions */}
            <Text className="text-gray-700 text-base mb-8 leading-6">
              Enter the code we sent to{'\n'}
              <Text className="font-semibold text-black">
                {typeof value === 'string' ? value : ''}
              </Text>
              .
            </Text>

            {/* Countdown Timer */}
            <View className="flex justify-start mb-8">
              <Text className="text-primary text-2xl font-medium">
                {formatCountdown(countdown)}
              </Text>
            </View>

            {/* OTP Input Boxes (4 digits) */}
            <View className="flex-row justify-between mb-20">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  className="w-20 h-20 bg-white border border-primary rounded-2xl text-center text-primary text-2xl font-semibold"
                  style={{
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Resend OTP and Change Method Links */}
            <View className="items-center mb-12">
              <Pressable onPress={handleResendOtp} disabled={isResendDisabled}>
                <View className="flex-row gap-2">
                  <Text className="text-base font-medium text-gray-400">
                    {isResendDisabled && "Didn't Receive OTP?"}
                  </Text>
                  <Text className="text-base font-medium text-primary">
                    Resend
                  </Text>
                </View>
              </Pressable>

              <Pressable
                className="mt-4"
                onPress={() => router.replace('/(auth)/phone-input')}
              >
                <Text className="text-base font-medium text-gray-700 underline">
                  Use a different email or phone
                </Text>
              </Pressable>
            </View>

            {/* Verify Button */}
            <View className="flex-1 justify-end pb-12">
              <Pressable
                className={`w-full py-5 rounded-2xl shadow-sm ${
                  isOtpComplete && !isLoading ? 'bg-primary' : 'bg-gray-300'
                }`}
                onPress={handleVerify}
                disabled={!isOtpComplete || isLoading}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

