// @ts-nocheck

import AppText from '@/components/AppText';
/**
 * Vendor Onboarding Intro Screen
 * 
 * First screen shown to new vendors after role selection
 * Explains what they need to do and the benefits
 * Redirects to VendorOnboarding wizard
 */

import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';

export default function VendorOnboardingIntro() {
  const router = useRouter();

  const benefits = [
    {
      icon: '🏪',
      title: 'Your Online Store',
      description: 'Reach thousands of customers in your area',
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track sales, orders, and customer feedback',
    },
    {
      icon: '💳',
      title: 'Easy Payments',
      description: 'Get paid directly to your bank account',
    },
    {
      icon: '🚀',
      title: 'Grow Your Business',
      description: 'Marketing tools and promotions included',
    },
  ];

  const requirements = [
    'Business registration documents',
    'Tax ID or business license',
    'Bank account details',
    'Valid government ID',
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
            <AppText className="text-5xl">🏪</AppText>
          </View>
          <AppText className="text-3xl font-bold text-gray-900 text-center mb-2">
            Welcome to NTUMAI!
          </AppText>
          <AppText className="text-lg text-gray-600 text-center">
            Let's set up your store
          </AppText>
        </View>

        {/* What You'll Do */}
        <View className="mb-8">
          <AppText className="text-xl font-bold text-gray-900 mb-4">
            What You'll Be Doing
          </AppText>
          <View className="bg-green-50 border border-green-200 rounded-lg p-4">
            <AppText className="text-gray-800 leading-6">
              As a vendor, you'll manage your store, add products, process orders, and deliver to customers or coordinate with our taskers. You control your inventory, pricing, and operating hours.
            </AppText>
          </View>
        </View>

        {/* Benefits */}
        <View className="mb-8">
          <AppText className="text-xl font-bold text-gray-900 mb-4">
            Why Join Us
          </AppText>
          <View className="gap-3">
            {benefits.map((benefit, index) => (
              <View key={index} className="flex-row items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <AppText className="text-3xl">{benefit.icon}</AppText>
                <View className="flex-1">
                  <AppText className="font-semibold text-gray-900">
                    {benefit.title}
                  </AppText>
                  <AppText className="text-sm text-gray-600 mt-1">
                    {benefit.description}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Requirements */}
        <View className="mb-8">
          <AppText className="text-xl font-bold text-gray-900 mb-4">
            What You'll Need
          </AppText>
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {requirements.map((req, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <CheckCircle2 size={20} color="#3B82F6" className="mr-3" />
                <AppText className="text-gray-800">{req}</AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Timeline */}
        <View className="mb-8">
          <AppText className="text-xl font-bold text-gray-900 mb-4">
            Onboarding Timeline
          </AppText>
          <View className="space-y-3">
            <TimelineStep number={1} title="Business Info" description="Tell us about your store" />
            <TimelineStep number={2} title="Location Setup" description="Set your delivery area" />
            <TimelineStep number={3} title="Bank Details" description="Add your payment info" />
            <TimelineStep number={4} title="Verification" description="We verify your documents" />
            <TimelineStep number={5} title="Active" description="Start accepting orders" />
          </View>
        </View>

        {/* Info Box */}
        <View className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <AppText className="text-sm text-amber-900">
            <AppText className="font-semibold">Note:</AppText> Verification typically takes 1-2 business days. You'll receive updates via email and SMS.
          </AppText>
        </View>

        {/* CTA Buttons */}
        <TouchableOpacity
          onPress={() => router.push('/(vendor)/OnboardingWizard')}
          className="bg-green-600 rounded-lg py-4 mb-3"
        >
          <AppText className="text-white text-center font-bold text-lg">
            Start Setup
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(vendor)/VendorDashboard')}
          className="border-2 border-green-600 rounded-lg py-4"
        >
          <AppText className="text-green-600 text-center font-bold text-lg">
            Skip for Now
          </AppText>
        </TouchableOpacity>

        {/* Footer */}
        <View className="mt-8 pt-8 border-t border-gray-200">
          <AppText className="text-center text-xs text-gray-600">
            By continuing, you agree to our{' '}
            <AppText className="text-green-600 font-semibold">Terms of Service</AppText>
            {' '}and{' '}
            <AppText className="text-green-600 font-semibold">Privacy Policy</AppText>
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// TIMELINE STEP COMPONENT
// ============================================================================

interface TimelineStepProps {
  number: number;
  title: string;
  description: string;
}

function TimelineStep({ number, title, description }: TimelineStepProps) {
  return (
    <View className="flex-row items-start mb-4">
      <View className="w-10 h-10 rounded-full bg-green-600 items-center justify-center mr-4 mt-1">
        <AppText className="text-white font-bold">{number}</AppText>
      </View>
      <View className="flex-1">
        <AppText className="font-semibold text-gray-900">{title}</AppText>
        <AppText className="text-sm text-gray-600 mt-1">{description}</AppText>
      </View>
    </View>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

