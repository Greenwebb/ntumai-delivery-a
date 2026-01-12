// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Switch, Platform, KeyboardAvoidingView, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface BusinessDetails { name: string;
  type: string;
  description: string;
  registrationNumber: string; }

interface ContactInfo { phone: string;
  email: string;
  address: string;
  city: string;
  landmark: string; }

interface Documents { businessLicense: string | null;
  nationalId: string | null;
  taxCertificate: string | null; }

interface PaymentInfo { method: 'mobile_money' | 'bank';
  mobileMoneyProvider?: 'mtn' | 'airtel' | 'zamtel';
  mobileMoneyNumber?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string; }

interface StoreConfig { openTime: string;
  closeTime: string;
  deliveryRadius: number;
  acceptsOrders: boolean;
  categories: string[]; }
  const BUSINESS_TYPES = ['Restaurant', 'Grocery Store', 'Pharmacy', 'Bakery', 'Butchery', 'Other'];
  const CITIES = ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Livingstone', 'Chipata', 'Solwezi'];
  const CATEGORIES = ['Food', 'Groceries', 'Medicine', 'Bakery', 'Meat', 'Vegetables', 'Beverages'];

export default function VendorOnboardingScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);

  // Form state
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({ name: '',
    type: '',
    description: '',
    registrationNumber: ''});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ phone: '',
    email: '',
    address: '',
    city: '',
    landmark: ''});
  const [documents, setDocuments] = useState<Documents>({ businessLicense: null,
    nationalId: null,
    taxCertificate: null});
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ method: 'mobile_money',
    mobileMoneyProvider: 'mtn',
    mobileMoneyNumber: ''});
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({ openTime: '08:00',
    closeTime: '18:00',
    deliveryRadius: 5,
    acceptsOrders: true,
    categories: []});
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;
  const handleNext = () => { // Validate current step
    if (!validateStep(currentStep)) { return; }

    if (currentStep < totalSteps) { setCurrentStep((prev) => (prev + 1) as OnboardingStep);
      if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } } else { handleSubmit(); } };
  const handleBack = () =>  {
    if (currentStep > 1) { setCurrentStep((prev) => (prev - 1) as OnboardingStep); } else { router.back(); } };
  const validateStep = (step: OnboardingStep): boolean => { switch (step) { case 1:
        if (!businessDetails.name || !businessDetails.type) { toast.error('Please fill in all required fields.');
          return false; }
        return true;
      case 2:
        if (!contactInfo.phone || !contactInfo.address || !contactInfo.city) { toast.error('Please fill in all required fields.');
          return false; }
        return true;
      case 3:
        if (!documents.businessLicense || !documents.nationalId) { toast.error('Please upload required documents.');
          return false; }
        return true;
      case 4:
        if (paymentInfo.method === 'mobile_money' && !paymentInfo.mobileMoneyNumber) { toast.error('Please enter your mobile money number.');
          return false; }
        if (paymentInfo.method === 'bank' && (!paymentInfo.bankName || !paymentInfo.accountNumber)) { toast.error('Please fill in all bank details.');
          return false; }
        return true;
      case 5:
        if (storeConfig.categories.length === 0) { toast.error('Please select at least one category.');
          return false; }
        return true;
      default:
        return true; } };
  const handleSubmit = async () => { toast.info(
      'Submit Application',
      'Your vendor application will be reviewed within 24-48 hours. You will receive an email notification once approved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit',
          onPress: async () => { // Simulate API submission
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
            toast.success('Your application has been submitted successfully.');
            router.back(); }},
      ]
    ); };
  const pickImage = async (documentType: keyof Documents) => { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8});

    if (!result.canceled && result.assets[0]) { setDocuments((prev) => ({ ...prev,
        [documentType]: result.assets[0].uri})); } };
  const toggleCategory = (category: string) => { setStoreConfig((prev) => ({ ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category]})); };
  const renderProgressBar = () => (
    <View className="px-4 py-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-medium text-foreground">Step {currentStep} of {totalSteps}</Text>
        <Text className="text-sm text-muted">{Math.round(progress)}%</Text>
      </View>
      <View className="h-2 bg-muted/20 rounded-full overflow-hidden">
        <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
      </View>
    </View>
  );
  const renderStep1 = () => (
    <View className="px-4">
      <Text className="text-2xl font-bold text-foreground mb-2">Business Details</Text>
      <Text className="text-sm text-muted mb-6">Tell us about your business</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Business Name *</Text>
        <TextInput
          value={businessDetails.name}
          onChangeText={(text) => setBusinessDetails((prev) => ({ ...prev, name: text }))}
          placeholder="e.g., Mama Tina Kitchen"
          className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Business Type *</Text>
        <View className="flex-row flex-wrap gap-2">
          {BUSINESS_TYPES.map((type) => (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={type}
              onPress={() => setBusinessDetails((prev) => ({ ...prev, type }))}
              className={`px-4 py-2 rounded-full border ${ businessDetails.type === type ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
            >
              <Text className={`text-sm font-medium ${businessDetails.type === type ? 'text-white' : 'text-muted'}`}>
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
        <TextInput
          value={businessDetails.description}
          onChangeText={(text) => setBusinessDetails((prev) => ({ ...prev, description: text }))}
          placeholder="Brief description of your business"
          multiline
          numberOfLines={3}
          className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
          placeholderTextColor="#9CA3AF"
          style={{ minHeight: 80 }}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Registration Number (Optional)</Text>
        <TextInput
          value={businessDetails.registrationNumber}
          onChangeText={(text) => setBusinessDetails((prev) => ({ ...prev, registrationNumber: text }))}
          placeholder="Business registration number"
          className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
  const renderStep2 = () => (
    <View className="px-4">
      <Text className="text-2xl font-bold text-foreground mb-2">Contact Information</Text>
      <Text className="text-sm text-muted mb-6">How can customers reach you?</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Phone Number *</Text>
        <TextInput
          value={contactInfo.phone}
          onChangeText={(text) => setContactInfo((prev) => ({ ...prev, phone: text }))}
          placeholder="+260 97X XXX XXX"
          keyboardType="phone-pad"
          className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
        <TextInput
          value={contactInfo.email}
          onChangeText={(text) => setContactInfo((prev) => ({ ...prev, email: text }))}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">City *</Text>
        <View className="flex-row flex-wrap gap-2">
          {CITIES.map((city) => (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={city}
              onPress={() => setContactInfo((prev) => ({ ...prev, city }))}
              className={`px-4 py-2 rounded-full border ${ contactInfo.city === city ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
            >
              <Text className={`text-sm font-medium ${contactInfo.city === city ? 'text-white' : 'text-muted'}`}>
                {city}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Street Address *</Text>
        <TextInput
          value={contactInfo.address}
          onChangeText={(text) => setContactInfo((prev) => ({ ...prev, address: text }))}
          placeholder="e.g., Plot 123, Kabulonga Road"
          className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Landmark</Text>
        <TextInput
          value={contactInfo.landmark}
          onChangeText={(text) => setContactInfo((prev) => ({ ...prev, landmark: text }))}
          placeholder="e.g., Near Manda Hill Mall"
          className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
  const renderStep3 = () => (
    <View className="px-4">
      <Text className="text-2xl font-bold text-foreground mb-2">Upload Documents</Text>
      <Text className="text-sm text-muted mb-6">Required for verification</Text>

      {[
        { key: 'businessLicense', label: 'Business License', required: true },
        { key: 'nationalId', label: 'National ID / Passport', required: true },
        { key: 'taxCertificate', label: 'Tax Certificate (TPIN)', required: false },
      ].map((doc) => (
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={doc.key}
          onPress={() => pickImage(doc.key as keyof Documents)}
          className="bg-surface border border-border rounded-xl p-4 mb-3"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className={`w-12 h-12 rounded-full items-center justify-center ${documents[doc.key] ? 'bg-success/10' : 'bg-muted/10'}`}>
                <Feather name={documents[doc.key] ? 'check-circle' : 'upload'} size={24} color={documents[doc.key] ? '#22C55E' : '#9CA3AF'} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-medium text-foreground">
                  {doc.label} {doc.required && '*'}
                </Text>
                <Text className="text-sm text-muted">
                  {documents[doc.key] ? 'Uploaded' : 'Tap to upload'}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </View>
        </Pressable>
      ))}

      <View className="bg-warning/10 rounded-xl p-4 mt-4">
        <View className="flex-row items-start">
          <Feather name="info" size={20} color="#F59E0B" />
          <Text className="text-sm text-warning ml-2 flex-1">
            All documents will be kept confidential and used only for verification purposes.
          </Text>
        </View>
      </View>
    </View>
  );
  const renderStep4 = () => (
    <View className="px-4">
      <Text className="text-2xl font-bold text-foreground mb-2">Payment Information</Text>
      <Text className="text-sm text-muted mb-6">How should we pay you?</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Payment Method *</Text>
        <View className="flex-row gap-3">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setPaymentInfo((prev) => ({ ...prev, method: 'mobile_money' }))}
            className={`flex-1 p-4 rounded-xl border ${ paymentInfo.method === 'mobile_money' ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
          >
            <Feather name="smartphone" size={24} color={paymentInfo.method === 'mobile_money' ? '#FFFFFF' : '#9CA3AF'} />
            <Text className={`text-sm font-medium mt-2 ${paymentInfo.method === 'mobile_money' ? 'text-white' : 'text-muted'}`}>
              Mobile Money
            </Text>
          </Pressable>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setPaymentInfo((prev) => ({ ...prev, method: 'bank' }))}
            className={`flex-1 p-4 rounded-xl border ${ paymentInfo.method === 'bank' ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
          >
            <Feather name="credit-card" size={24} color={paymentInfo.method === 'bank' ? '#FFFFFF' : '#9CA3AF'} />
            <Text className={`text-sm font-medium mt-2 ${paymentInfo.method === 'bank' ? 'text-white' : 'text-muted'}`}>
              Bank Account
            </Text>
          </Pressable>
        </View>
      </View>

      {paymentInfo.method === 'mobile_money' ? (
        <>
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Provider *</Text>
            <View className="flex-row gap-2">
              {(['mtn', 'airtel', 'zamtel'] as const).map((provider) => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={provider}
                  onPress={() => setPaymentInfo((prev) => ({ ...prev, mobileMoneyProvider: provider }))}
                  className={`flex-1 py-3 rounded-xl border ${ paymentInfo.mobileMoneyProvider === provider ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
                >
                  <Text className={`text-sm font-medium text-center uppercase ${ paymentInfo.mobileMoneyProvider === provider ? 'text-white' : 'text-muted' }`}>
                    {provider}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Mobile Money Number *</Text>
            <TextInput
              value={paymentInfo.mobileMoneyNumber}
              onChangeText={(text) => setPaymentInfo((prev) => ({ ...prev, mobileMoneyNumber: text }))}
              placeholder="+260 97X XXX XXX"
              keyboardType="phone-pad"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </>
      ) : (
        <>
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Bank Name *</Text>
            <TextInput
              value={paymentInfo.bankName}
              onChangeText={(text) => setPaymentInfo((prev) => ({ ...prev, bankName: text }))}
              placeholder="e.g., Zanaco"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Account Number *</Text>
            <TextInput
              value={paymentInfo.accountNumber}
              onChangeText={(text) => setPaymentInfo((prev) => ({ ...prev, accountNumber: text }))}
              placeholder="Account number"
              keyboardType="number-pad"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Account Name *</Text>
            <TextInput
              value={paymentInfo.accountName}
              onChangeText={(text) => setPaymentInfo((prev) => ({ ...prev, accountName: text }))}
              placeholder="Account holder name"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </>
      )}
    </View>
  );
  const renderStep5 = () => (
    <View className="px-4">
      <Text className="text-2xl font-bold text-foreground mb-2">Store Configuration</Text>
      <Text className="text-sm text-muted mb-6">Set up your store preferences</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Operating Hours</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Open Time</Text>
            <TextInput
              value={storeConfig.openTime}
              onChangeText={(text) => setStoreConfig((prev) => ({ ...prev, openTime: text }))}
              placeholder="08:00"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Close Time</Text>
            <TextInput
              value={storeConfig.closeTime}
              onChangeText={(text) => setStoreConfig((prev) => ({ ...prev, closeTime: text }))}
              placeholder="18:00"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Delivery Radius (km)</Text>
        <View className="flex-row gap-2">
          {[3, 5, 10, 15].map((radius) => (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={radius}
              onPress={() => setStoreConfig((prev) => ({ ...prev, deliveryRadius: radius }))}
              className={`flex-1 py-3 rounded-xl border ${ storeConfig.deliveryRadius === radius ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
            >
              <Text className={`text-sm font-medium text-center ${ storeConfig.deliveryRadius === radius ? 'text-white' : 'text-muted' }`}>
                {radius} km
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-foreground mb-2">Product Categories *</Text>
        <View className="flex-row flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={category}
              onPress={() => toggleCategory(category)}
              className={`px-4 py-2 rounded-full border ${ storeConfig.categories.includes(category) ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
            >
              <Text className={`text-sm font-medium ${ storeConfig.categories.includes(category) ? 'text-white' : 'text-muted' }`}>
                {category}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-medium text-foreground">Accept Orders</Text>
            <Text className="text-sm text-muted">Start accepting orders immediately</Text>
          </View>
          <Switch
            value={storeConfig.acceptsOrders}
            onValueChange={(value) => setStoreConfig((prev) => ({ ...prev, acceptsOrders: value }))}
            trackColor={{ false: '#E5E7EB', true: '#009688' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
  const renderCurrentStep = () => { switch (currentStep) { case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null; } };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleBack} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Vendor Onboarding</Text>
        <View className="w-10" />
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
          <View className="h-24" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons */}
      <View className="px-4 py-4 border-t border-border bg-background">
        <View className="flex-row gap-3">
          {currentStep > 1 && (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleBack}
              className="flex-1 py-3 bg-surface border border-border rounded-xl"
            >
              <Text className="text-center text-base font-semibold text-foreground">Back</Text>
            </Pressable>
          )}
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleNext}
            className="flex-1 py-3 bg-primary rounded-xl"
          >
            <Text className="text-center text-base font-semibold text-white">
              {currentStep === totalSteps ? 'Submit' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

