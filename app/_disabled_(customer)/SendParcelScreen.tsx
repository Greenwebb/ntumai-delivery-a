// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { WorkflowStepper } from '@/components/workflow-stepper';
import { ContactPicker } from '@/components/contact-picker';
import { ShareTrackingLink } from '@/components/share-tracking-link';
import { useState, useEffect } from 'react';

import { View, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useToast } from '@/lib/toast-provider';
import { Button } from '@/src/components/ui';

import { useRouter } from 'expo-router';

import { useDeliveryStore, useUserStore } from '@/src/store';

import { Feather } from '@expo/vector-icons';

type DeliveryStep = 'location' | 'details' | 'pricing' | 'confirmation';

export default function SendParcelScreen() { const router = useRouter();
  const colors = useColors();
  const toast = useToast();
  const { createDelivery, isLoading } = useDeliveryStore();
  const { addresses, getAddresses } = useUserStore();

  const [step, setStep] = useState<DeliveryStep>('location');
  const [pickupAddress, setPickupAddress] = useState('');

  // Load addresses on mount
  useEffect(() => {
    getAddresses();
  }, []);

  // Set default pickup address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !pickupAddress) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setPickupAddress(defaultAddr.id);
    }
  }, [addresses, pickupAddress]);
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [parcelDetails, setParcelDetails] = useState({ description: '',

    weight: '',

    size: 'medium' as 'small' | 'medium' | 'large',

    fragile: false});
  const [recipientInfo, setRecipientInfo] = useState({ name: '',

    phone: ''});
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express' | 'same-day'>('standard');
  const handleCalculatePrice = () =>  {
    if (!dropoffLocation.trim()) {
      toast.error('Please enter dropoff location');
      return;
    }

    // Price calculation based on delivery type, size, and fragile
    const basePrices = { 'standard': 25, 'express': 45, 'same-day': 75 };
    const basePrice = basePrices[deliveryType];
    const sizeMultiplier = { small: 1, medium: 1.5, large: 2 }[parcelDetails.size];
    const fragileMultiplier = parcelDetails.fragile ? 1.2 : 1;
    const calculatedPrice = Math.round(basePrice * sizeMultiplier * fragileMultiplier);

    setEstimatedPrice(calculatedPrice);

    setStep('pricing'); };
  const handleCreateDelivery = async () =>  {
    if (!recipientInfo.name || !recipientInfo.phone) {
      toast.error('Please fill in recipient information');
      return;
    }

    try { const delivery = await createDelivery({ pickupAddressId: pickupAddress,

        dropoffLocation,

        parcelDetails,

        recipientInfo,

        estimatedPrice});

      if (delivery) {
        toast.success('Delivery created successfully!');
        router.replace(`/(customer)/DeliveryTrackingScreen?deliveryId=${delivery.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create delivery');
    }
  };

  // Step 1: Location Selection
  if (step === 'location') { return (
      <ScreenContainer className="flex-1">
        {/* Workflow Stepper - Step 1: Package Details */}
        <WorkflowStepper
          currentStep={1}
          steps={["Package Details", "Recipient Info", "Book & Pay"]}
        />
        
        <ScrollView className="flex-1">

        <View className="px-6 py-8">

          {/* Header */}

          <View className="mb-8">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mb-4">

              <Feather name="chevron-left" size={24} color="#1F2937" />

            </Pressable>

            <View className="flex-row items-center mb-4">

              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">

                <Text className="text-white font-bold text-sm">1</Text>

              </View>

              <Text className="text-sm font-semibold text-muted">Pickup Location</Text>

            </View>

            <Text className="text-3xl font-bold text-foreground">Where are you sending from?</Text>

          </View>

          {/* Pickup Address Selection */}

          <View className="mb-8">

            <Text className="text-sm font-semibold text-gray-700 mb-3">Select Pickup Address</Text>

            {addresses.map(address => (

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={address.id}

                onPress={() => setPickupAddress(address.id)}

                className={`border-2 rounded-lg p-4 mb-3 flex-row items-center ${ pickupAddress === address.id

                    ? 'border-green-600 bg-green-50'

                    : 'border-border' }`}

              >

                <Feather

                  name="map-pin"

                  size={24}

                  color={pickupAddress === address.id ? '#16A34A' : '#9CA3AF'}

                  className="mr-4"

                />

                <View className="flex-1">

                  <Text className="text-lg font-semibold text-foreground">

                    {(address.label || address.type || 'Address').toUpperCase()}

                  </Text>

                  <Text className="text-muted text-sm">

                    {address.street}, {address.city}

                  </Text>

                </View>

                {pickupAddress === address.id && (

                  <Feather name="check-circle" size={24} color="#16A34A" />

                )}

              </Pressable>

            ))}

            {/* Add New Address Button */}
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              onPress={() => router.push('/(shared)/AddNewAddressScreen')}
              className="border-2 border-dashed border-primary rounded-lg p-4 flex-row items-center justify-center"
            >
              <Feather name="plus-circle" size={24} color={colors.primary} />
              <Text className="text-primary font-semibold ml-2">Add New Address</Text>
            </Pressable>

          </View>

          {/* Dropoff Location */}

          <View className="mb-8">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Dropoff Location</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="Enter full address or location name"

              value={dropoffLocation}

              onChangeText={setDropoffLocation}

              placeholderTextColor="#9CA3AF"

            />

          </View>

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('details')}

            disabled={!pickupAddress || !dropoffLocation.trim()}

            className={`rounded-lg py-4 ${ !pickupAddress || !dropoffLocation.trim() ? 'bg-gray-300' : 'bg-primary' }`}

          >

            <Text className="text-white text-center font-bold text-lg">Continue</Text>

          </Pressable>

        </View>

      </ScrollView>
    </ScreenContainer>
    ); }

  // Step 2: Parcel Details

  if (step === 'details') { return (
      <ScreenContainer className="flex-1">
        {/* Workflow Stepper - Step 1: Package Details */}
        <WorkflowStepper
          currentStep={1}
          steps={["Package Details", "Recipient Info", "Book & Pay"]}
        />
        
        <ScrollView className="flex-1">
          <View className="px-6 py-8">

          {/* Header */}

          <View className="mb-8">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('location')} className="mb-4">

              <Feather name="chevron-left" size={24} color="#1F2937" />

            </Pressable>

            <View className="flex-row items-center mb-4">

              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">

                <Text className="text-white font-bold text-sm">2</Text>

              </View>

              <Text className="text-sm font-semibold text-muted">Parcel Details</Text>

            </View>

            <Text className="text-3xl font-bold text-foreground">What are you sending?</Text>

          </View>

          {/* Description */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">What's in the parcel?</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3 h-24"

              placeholder="e.g., Documents, Electronics, Clothing"

              value={parcelDetails.description}

              onChangeText={(text) => setParcelDetails(prev => ({ ...prev, description: text }))}

              multiline

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Size Selection */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-3">Parcel Size</Text>

            <View className="gap-3">

              {['small', 'medium', 'large'].map(size => (

                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={size}

                  onPress={() => setParcelDetails(prev => ({ ...prev, size: size as any }))}

                  className={`border-2 rounded-lg p-4 flex-row items-center ${ parcelDetails.size === size

                      ? 'border-green-600 bg-green-50'

                      : 'border-border' }`}

                >

                  <View className="flex-1">

                    <Text className="text-lg font-semibold text-foreground capitalize">{size}</Text>

                    <Text className="text-muted text-sm">

                      {size === 'small' && 'Up to 2kg'}

                      {size === 'medium' && '2-5kg'}

                      {size === 'large' && '5-10kg'}

                    </Text>

                  </View>

                  {parcelDetails.size === size && (

                    <Feather name="check-circle" size={24} color="#16A34A" />

                  )}

                </Pressable>

              ))}

            </View>

          </View>

          {/* Fragile Option */}

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setParcelDetails(prev => ({ ...prev, fragile: !prev.fragile }))}

            className="border border-border rounded-lg p-4 mb-8 flex-row items-center"

          >

            <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${ parcelDetails.fragile ? 'bg-primary border-green-600' : 'border-border' }`}>

              {parcelDetails.fragile && (

                <Feather name="check" size={16} color="white" />

              )}

            </View>

            <View className="flex-1">

              <Text className="text-lg font-semibold text-foreground">Fragile Items</Text>

              <Text className="text-muted text-sm">Requires extra care (20% surcharge)</Text>            </View>

          </Pressable>

          {/* Delivery Type Selection */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Delivery Speed</Text>
            <View className="gap-3">
              {[
                { id: 'standard', label: 'Standard', time: '2-3 days', price: 'K25 base' },
                { id: 'express', label: 'Express', time: 'Next day', price: 'K45 base' },
                { id: 'same-day', label: 'Same Day', time: 'Within 4 hours', price: 'K75 base' },
              ].map(option => (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  onPress={() => setDeliveryType(option.id as any)}
                  className={`border-2 rounded-lg p-4 flex-row items-center ${
                    deliveryType === option.id ? 'border-green-600 bg-green-50' : 'border-border'
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">{option.label}</Text>
                    <Text className="text-muted text-sm">{option.time} • {option.price}</Text>
                  </View>
                  {deliveryType === option.id && (
                    <Feather name="check-circle" size={24} color="#16A34A" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleCalculatePrice()}            className="bg-primary rounded-lg py-4"

          >

            <Text className="text-white text-center font-bold text-lg">Continue</Text>

          </Pressable>

         </View>
      </ScrollView>
    </ScreenContainer>
    ); }

  // Step 3: Pricing
  if (step === 'pricing') { return (
      <ScreenContainer className="flex-1">
        {/* Workflow Stepper - Step 2: Recipient Info */}
        <WorkflowStepper
          currentStep={2}
          steps={["Package Details", "Recipient Info", "Book & Pay"]}
        />
        
        <ScrollView className="flex-1">

        <View className="px-6 py-8">

          {/* Header */}

          <View className="mb-8">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('details')} className="mb-4">

              <Feather name="chevron-left" size={24} color="#1F2937" />

            </Pressable>

            <View className="flex-row items-center mb-4">

              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">

                <Text className="text-white font-bold text-sm">3</Text>

              </View>

              <Text className="text-sm font-semibold text-muted">Pricing</Text>

            </View>

            <Text className="text-3xl font-bold text-foreground">Confirm Delivery Price</Text>

          </View>

          {/* Blueprint: Show only Delivery Cost - no fee breakdown for customers */}
          <View className="bg-surface rounded-lg p-6 mb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Delivery Cost</Text>
              <Text className="text-3xl font-bold text-primary">{estimatedPrice}K</Text>
            </View>
            <Text className="text-sm text-muted mt-3">Pay this amount to your tasker upon delivery</Text>
          </View>

          {/* Info Box */}

          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">

            <Text className="text-blue-900 font-semibold mb-2">ð¡ Delivery Time</Text>

            <Text className="text-blue-800 text-sm">

              Estimated delivery: 30-60 minutes from confirmation

            </Text>

          </View>

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('confirmation')}

            className="bg-primary rounded-lg py-4"

          >

            <Text className="text-white text-center font-bold text-lg">Continue</Text>

          </Pressable>

        </View>
      </ScrollView>
    </ScreenContainer>
    ); }

  // Step 4: Confirmation
  return (
    <ScreenContainer className="flex-1">
      {/* Workflow Stepper - Step 3: Book & Pay */}
      <WorkflowStepper
        currentStep={3}
        steps={["Package Details", "Recipient Info", "Book & Pay"]}
      />
      
      <ScrollView className="flex-1">

      <View className="px-6 py-8">

        {/* Header */}

        <View className="mb-8">

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('pricing')} className="mb-4">

            <Feather name="chevron-left" size={24} color="#1F2937" />

          </Pressable>

          <View className="flex-row items-center mb-4">

            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">

              <Text className="text-white font-bold text-sm">4</Text>

            </View>

            <Text className="text-sm font-semibold text-muted">Recipient Info</Text>

          </View>

          <Text className="text-3xl font-bold text-foreground">Who's receiving this?</Text>

        </View>

        {/* Recipient Info Form */}

        <View className="mb-8">

          <Text className="text-sm font-semibold text-gray-700 mb-2">Recipient Name</Text>

          <TextInput

            className="border border-border rounded-lg px-4 py-3 mb-4"

            placeholder="Full name"

            value={recipientInfo.name}

            onChangeText={(text) => setRecipientInfo(prev => ({ ...prev, name: text }))}

            placeholderTextColor="#9CA3AF"

          />

          <Text className="text-sm font-semibold text-gray-700 mb-2">Recipient Phone</Text>

          <TextInput

            className="border border-border rounded-lg px-4 py-3"

            placeholder="Phone number"

            value={recipientInfo.phone}

            onChangeText={(text) => setRecipientInfo(prev => ({ ...prev, phone: text }))}

            keyboardType="phone-pad"

            placeholderTextColor="#9CA3AF"

          />

        </View>

        {/* Summary */}

        <View className="bg-surface rounded-lg p-6 mb-8">

          <Text className="text-lg font-bold text-foreground mb-4">Delivery Summary</Text>

          <View className="gap-3">

            <View>

              <Text className="text-muted text-sm">From</Text>

              <Text className="text-foreground font-semibold">Your Location</Text>

            </View>

            <View>

              <Text className="text-muted text-sm">To</Text>

              <Text className="text-foreground font-semibold">{dropoffLocation}</Text>

            </View>

            <View className="border-t border-border pt-3">

              <Text className="text-muted text-sm">Total Cost</Text>

              <Text className="text-2xl font-bold text-primary">{estimatedPrice}K</Text>

            </View>

          </View>

        </View>

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCreateDelivery}

          disabled={isLoading || !recipientInfo.name || !recipientInfo.phone}

          className={`rounded-lg py-4 flex-row items-center justify-center ${ isLoading || !recipientInfo.name || !recipientInfo.phone ? 'bg-gray-300' : 'bg-primary' }`}

        >

          {isLoading ? (

            <ActivityIndicator color="white" />

          ) : (

            <Text className="text-white text-center font-bold text-lg">Confirm & Pay {estimatedPrice}K</Text>

          )}

        </Pressable>

      </View>
    </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

