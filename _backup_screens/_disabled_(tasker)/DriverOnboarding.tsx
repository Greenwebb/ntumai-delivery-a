// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import { ArrowLeft, Upload, CheckCircle, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function DriverOnboarding() {
  const router = useRouter();
  const colors = useColors();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [nrcNumber, setNrcNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  const steps = [
    { id: 1, title: 'Personal Info', description: 'Tell us about yourself' },
    { id: 2, title: 'Vehicle Details', description: 'Add your vehicle information' },
    { id: 3, title: 'Documents', description: 'Upload required documents' },
    { id: 4, title: 'Review', description: 'Review and submit' },
  ];

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Submit onboarding
      router.replace('/(tasker)/DriverDashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <TouchableOpacity onPress={handleBack} className="mb-4">
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text variant="h2" weight="bold">Driver Onboarding</Text>
        <Text variant="bodySmall" color="muted">Step {step} of 4</Text>
      </View>

      {/* Progress Steps */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between">
          {steps.map((s) => (
            <View key={s.id} className="flex-1 items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  s.id <= step ? 'bg-primary' : 'bg-surface'
                }`}
              >
                {s.id < step ? (
                  <CheckCircle size={20} color="white" />
                ) : (
                  <Text
                    variant="body"
                    weight="bold"
                    className={s.id === step ? 'text-white' : 'text-muted'}
                  >
                    {s.id}
                  </Text>
                )}
              </View>
              <Text
                variant="caption"
                weight="medium"
                className={`mt-2 text-center ${s.id <= step ? 'text-foreground' : 'text-muted'}`}
              >
                {s.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <>
            <Card className="p-4 mb-3">
              <Text variant="body" weight="medium" className="mb-2">Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                className="bg-surface rounded-lg px-4 py-3 text-base"
                placeholderTextColor={colors.muted}
              />
            </Card>

            <Card className="p-4 mb-3">
              <Text variant="body" weight="medium" className="mb-2">NRC Number</Text>
              <TextInput
                placeholder="123456/78/9"
                value={nrcNumber}
                onChangeText={setNrcNumber}
                className="bg-surface rounded-lg px-4 py-3 text-base"
                placeholderTextColor={colors.muted}
              />
            </Card>

            <Card className="p-4 mb-6">
              <Text variant="body" weight="medium" className="mb-2">Phone Number</Text>
              <TextInput
                placeholder="+260 97 123 4567"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                className="bg-surface rounded-lg px-4 py-3 text-base"
                placeholderTextColor={colors.muted}
              />
            </Card>
          </>
        )}

        {/* Step 2: Vehicle Details */}
        {step === 2 && (
          <>
            <Card className="p-4 mb-3">
              <Text variant="body" weight="medium" className="mb-2">Vehicle Type</Text>
              <View className="flex-row gap-3">
                {['Motorcycle', 'Car', 'Van'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setVehicleType(type)}
                    className={`flex-1 p-3 rounded-lg border-2 ${
                      vehicleType === type
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <Text
                      variant="bodySmall"
                      weight="medium"
                      className={`text-center ${vehicleType === type ? 'text-primary' : 'text-muted'}`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card className="p-4 mb-6">
              <Text variant="body" weight="medium" className="mb-2">Plate Number</Text>
              <TextInput
                placeholder="ABC 1234"
                value={plateNumber}
                onChangeText={setPlateNumber}
                autoCapitalize="characters"
                className="bg-surface rounded-lg px-4 py-3 text-base"
                placeholderTextColor={colors.muted}
              />
            </Card>
          </>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <>
            <Card className="p-4 mb-3">
              <Text variant="body" weight="medium" className="mb-3">Driver's License</Text>
              <TouchableOpacity className="bg-surface rounded-lg p-6 items-center border-2 border-dashed border-border">
                <Upload size={32} color={colors.muted} />
                <Text variant="bodySmall" color="muted" className="mt-2">Tap to upload</Text>
              </TouchableOpacity>
            </Card>

            <Card className="p-4 mb-3">
              <Text variant="body" weight="medium" className="mb-3">Vehicle Registration</Text>
              <TouchableOpacity className="bg-surface rounded-lg p-6 items-center border-2 border-dashed border-border">
                <Upload size={32} color={colors.muted} />
                <Text variant="bodySmall" color="muted" className="mt-2">Tap to upload</Text>
              </TouchableOpacity>
            </Card>

            <Card className="p-4 mb-6">
              <Text variant="body" weight="medium" className="mb-3">Insurance Certificate</Text>
              <TouchableOpacity className="bg-surface rounded-lg p-6 items-center border-2 border-dashed border-border">
                <Upload size={32} color={colors.muted} />
                <Text variant="bodySmall" color="muted" className="mt-2">Tap to upload</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <>
            <Card className="p-4 mb-3">
              <Text variant="h4" weight="bold" className="mb-4">Review Your Information</Text>
              
              <View className="mb-3">
                <Text variant="bodySmall" color="muted">Full Name</Text>
                <Text variant="body" weight="medium">{fullName || 'Not provided'}</Text>
              </View>

              <View className="mb-3">
                <Text variant="bodySmall" color="muted">NRC Number</Text>
                <Text variant="body" weight="medium">{nrcNumber || 'Not provided'}</Text>
              </View>

              <View className="mb-3">
                <Text variant="bodySmall" color="muted">Phone Number</Text>
                <Text variant="body" weight="medium">{phoneNumber || 'Not provided'}</Text>
              </View>

              <View className="mb-3">
                <Text variant="bodySmall" color="muted">Vehicle Type</Text>
                <Text variant="body" weight="medium">{vehicleType || 'Not provided'}</Text>
              </View>

              <View>
                <Text variant="bodySmall" color="muted">Plate Number</Text>
                <Text variant="body" weight="medium">{plateNumber || 'Not provided'}</Text>
              </View>
            </Card>

            <Card className="p-4 mb-6 bg-primary/10 border-primary">
              <Text variant="body" weight="medium" className="text-primary">
                By submitting, you agree to our Terms of Service and Privacy Policy
              </Text>
            </Card>
          </>
        )}

        {/* Next Button */}
        <TouchableOpacity
          className="bg-primary py-4 rounded-xl items-center mb-6"
          onPress={handleNext}
        >
          <Text variant="body" weight="bold" className="text-white">
            {step === 4 ? 'Submit Application' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

