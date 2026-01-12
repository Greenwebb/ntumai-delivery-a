// @ts-nocheck

import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Image, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { AuthMethodTabs } from '@/components/ui/auth-method-tabs';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/lib/toast-provider';
import { DemoQuickLogin } from '@/components/demo-quick-login';
import { isDemoMode } from '@/lib/config/demo-mode';
import { demoApi } from '@/lib/api/demo-api';
import { validatePhone, validateEmail } from '@/lib/validation/auth';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import * as Haptics from 'expo-haptics';
import { Mail } from 'lucide-react-native';
import { useColors } from '@/hooks/use-colors';

/**
 * Phone Input Screen (Login/Signup)
 * 
 * Follows reference app design pattern:
 * - Logo at top center
 * - Auth header with title, subtitle, description
 * - Tab switcher for phone/email
 * - Input fields with real-time validation
 * - Send OTP button at bottom
 * 
 * Wrapped with ScreenContainer for proper SafeArea handling on all devices
 */
export default function PhoneInputScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const toast = useToast();
  const colors = useColors();
  
  const { setVerificationState, setError, setLoading } = useAuthStore();
  
  const [selectedMethod, setSelectedMethod] = useState<'phone' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState('+254'); // Kenya default
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time validation
  const phoneValidation = validatePhone(phoneNumber, countryCode);
  const emailValidation = validateEmail(email);
  const isFormValid = selectedMethod === 'phone' 
    ? phoneValidation.isValid && phoneNumber.length > 0
    : emailValidation.isValid && email.length > 0;

  const handleMethodChange = (method: 'phone' | 'email') => {
    setSelectedMethod(method);
    setValidationErrors([]);
    setError(null);
    // Clear the other field when switching methods
    if (method === 'phone') {
      setEmail('');
    } else {
      setPhoneNumber('');
    }
  };

  const handleSendOtp = async () => {
    try {
      setValidationErrors([]);
      setError(null);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Validate form
      if (!isFormValid) {
        const errors = selectedMethod === 'phone' ? phoneValidation.errors : emailValidation.errors;
        setValidationErrors(errors);
        toast.error(errors[0] || `Please enter a valid ${selectedMethod}`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }

      // Prepare credentials
      const credentials = selectedMethod === 'phone'
        ? { phone: phoneNumber, countryCode }
        : { email };

      // Send OTP
      setIsLoading(true);
      setLoading(true);
      
      // In demo mode, skip real API and go directly to OTP verification with mock
      if (isDemoMode()) {
        setIsLoading(false);
        setLoading(false);
        
        const verificationValue = selectedMethod === 'phone' 
          ? `${countryCode}${phoneNumber}` 
          : email;
        
        setVerificationState(selectedMethod, verificationValue);
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        toast.success('Demo mode: Use code 123456');
        
        router.push({
          pathname: '/(auth)/otp-verification',
          params: {
            method: selectedMethod,
            value: verificationValue,
          },
        });
        return;
      }
      
      // Real API call for non-demo mode
      const result = await authApi.sendOtp(credentials);
      setIsLoading(false);
      setLoading(false);

      if (result.success && result.requiresVerification) {
        // Set verification state
        setVerificationState(result.verificationMethod!, result.verificationValue!);
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        toast.success('Verification code sent!');
        
        // Navigate to OTP verification
        router.push({
          pathname: '/(auth)/otp-verification',
          params: {
            method: result.verificationMethod!,
            value: result.verificationValue!,
          },
        });
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setIsLoading(false);
      setLoading(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      toast.error(err?.message || 'An unexpected error occurred');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScreenContainer className="bg-white">
        {/* Logo at Top */}
        <View className="w-full flex justify-center items-center mt-8">
          <Logo size="sm" />
        </View>

        {/* Auth Header */}
        <View className="pt-8 pb-4 px-6">
          <Text className="text-primary text-5xl font-bold mb-2">
            Tiye, tiye!
          </Text>
          <Text className="text-primary text-2xl font-medium">
            Login below
          </Text>
          <Text className="text-gray-600 text-base mt-2">
            Enter your phone number or email to receive a verification code!
          </Text>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex-1">
              {/* Demo Quick Login */}
              <View className="px-6">
                <DemoQuickLogin
                  onSelectUser={async (email, password, role) => {
                    try {
                      setIsLoading(true);
                      
                      // Use demo API to login directly
                      const result = await demoApi.auth.login(email, password);
                      
                      // Map mock user to auth store user format
                      const user = {
                        id: result.user.id,
                        email: result.user.email,
                        phone: result.user.phone,
                        name: result.user.name,
                        role: result.user.role,
                      };
                      
                      // Login user directly to the store
                      // Note: We use getState() to avoid triggering re-renders during the async operation
                      const authStore = useAuthStore.getState();
                      await authStore.login(user, result.token);
                      
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                      toast.success(`Logged in as ${role}!`);
                      
                      // Use longer delay to ensure all state updates are complete
                      // and React has finished all pending renders before navigation
                      await new Promise(resolve => setTimeout(resolve, 300));
                      
                      // Navigate based on role - use push instead of replace to avoid navigation conflicts
                      setIsLoading(false);
                      if (role === 'customer') {
                        router.push('/(customer)/(tabs)');
                      } else if (role === 'tasker') {
                        router.push('/(tasker)/(tabs)');
                      } else if (role === 'vendor') {
                        router.push('/(vendor)/(tabs)');
                      }
                    } catch (error: any) {
                      console.error('Demo login error:', error);
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      }
                      toast.error(error?.message || 'Demo login failed');
                      setIsLoading(false);
                    }
                  }}
                />
              </View>
              
              {/* Tab Switcher */}
              <View className="px-6 mt-6">
                <AuthMethodTabs
                  selectedMethod={selectedMethod}
                  onMethodChange={handleMethodChange}
                />
              </View>

              {/* Email/Phone Input */}
              <View className="px-6 mt-6">
                {selectedMethod === 'email' ? (
                  <View>
                    <Input
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      placeholder="Enter your email"
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleSendOtp}
                      className="mb-4"
                    />
                    {/* Display field-specific errors for email */}
                    {!emailValidation.isValid && email.length > 0 && (
                      <View className="mb-4">
                        {emailValidation.errors.map((error, index) => (
                          <Text key={index} className="text-error text-sm mb-1">
                            {error}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View>
                    <PhoneInput
                      phone={phoneNumber}
                      countryCode={countryCode}
                      onPhoneChange={setPhoneNumber}
                      onCountryChange={setCountryCode}
                      placeholder="Enter your mobile no."
                      onSubmitEditing={handleSendOtp}
                      className="mb-4"
                    />
                    {/* Display field-specific errors for phone */}
                    {!phoneValidation.isValid && phoneNumber.length > 0 && (
                      <View className="mb-4">
                        {phoneValidation.errors.map((error, index) => (
                          <Text key={index} className="text-error text-sm mb-1">
                            {error}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Disclaimer */}
                <Text className="text-gray-500 text-sm text-center mt-4">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Send OTP Button */}
        <View className="px-6 pb-4">
          <Button
            title={isLoading ? 'Sending OTP...' : 'Send OTP'}
            onPress={handleSendOtp}
            variant="primary"
            size="large"
            fullWidth
            disabled={!isFormValid || isLoading}
            className={isFormValid && !isLoading ? '' : 'opacity-50'}
          />
        </View>
      </ScreenContainer>
    </TouchableWithoutFeedback>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";
