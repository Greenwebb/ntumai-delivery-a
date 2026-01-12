// @ts-nocheck

import AppText from '@/components/AppText';
/**





 * Tasker Onboarding Intro Screen





 * 





 * First screen shown to new taskers after role selection





 * Explains what they need to do and the benefits





 * Redirects to DriverOnboarding wizard





 */











import React from 'react';





import { View, TouchableOpacity, ScrollView, Image } from 'react-native';





import { useRouter } from 'expo-router';





import { CheckCircle2 } from 'lucide-react-native';











export default function TaskerOnboardingIntro() {





  const router = useRouter();











  const benefits = [





    {





      icon: '💰',





      title: 'Earn Money',





      description: 'Get paid for every delivery you complete',





    },





    {





      icon: '⏰',





      title: 'Flexible Hours',





      description: 'Work whenever you want, as much as you want',





    },





    {





      icon: '📱',





      title: 'Easy to Use',





      description: 'Simple app interface to manage your deliveries',





    },





    {





      icon: '⭐',





      title: 'Build Your Rating',





      description: 'Earn rewards and unlock premium features',





    },





  ];











  const requirements = [





    'Valid government ID',





    'Driver license or vehicle registration',





    'Insurance certificate',





    'Bank account for payouts',





  ];











  return (





    <ScrollView className="flex-1 bg-white">





      <View className="px-6 py-8">





        {/* Header */}





        <View className="items-center mb-8">





          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">





            <AppText className="text-5xl">🚗</AppText>





          </View>





          <AppText className="text-3xl font-bold text-gray-900 text-center mb-2">





            Welcome to NTUMAI!





          </AppText>





          <AppText className="text-lg text-gray-600 text-center">





            You're ready to start earning





          </AppText>





        </View>











        {/* What You'll Do */}





        <View className="mb-8">





          <AppText className="text-xl font-bold text-gray-900 mb-4">





            What You'll Be Doing





          </AppText>





          <View className="bg-green-50 border border-green-200 rounded-lg p-4">





            <AppText className="text-gray-800 leading-6">





              As a tasker, you'll deliver food orders, parcels, and provide services to customers across the city. You set your own schedule and earn money for each delivery.





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





            <TimelineStep number={1} title="Application" description="Tell us about yourself" />





            <TimelineStep number={2} title="KYC Verification" description="Upload your documents" />





            <TimelineStep number={3} title="Training" description="Complete quick training" />





            <TimelineStep number={4} title="Probation" description="Start with limited orders" />





            <TimelineStep number={5} title="Active" description="Full access to all orders" />





          </View>





        </View>











        {/* Info Box */}





        <View className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">





          <AppText className="text-sm text-amber-900">





            <AppText className="font-semibold">Note:</AppText> The entire process typically takes 2-3 business days. You'll receive updates via email and SMS.





          </AppText>





        </View>











        {/* CTA Buttons */}





        <TouchableOpacity





          onPress={() => router.push('/(tasker)/LicenseVerificationScreen')}





          className="bg-green-600 rounded-lg py-4 mb-3"





        >





          <AppText className="text-white text-center font-bold text-lg">





            Start Application





          </AppText>





        </TouchableOpacity>











        <TouchableOpacity





          onPress={() => router.replace('/(tasker)/TaskerDashboard')}





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

