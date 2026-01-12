// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import * as Haptics from 'expo-haptics';
export default function AddAddressScreen() { const router = useRouter();
  const colors = useColors();
  const [label, setLabel] = useState('home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const addressTypes = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'work', label: 'Work', icon: Briefcase },
    { id: 'other', label: 'Other', icon: MapPin },
  ];
  const handleSave = () =>  {
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    // TODO: Save address to store/API
    router.back(); };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-6 pb-4 flex-row items-center">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <View className="flex-1">
          <Text variant="h2" weight="bold">Add Address</Text>
          <Text variant="bodySmall" color="muted">Save a new delivery address</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Address Type */}
        <View className="mb-4">
          <Text variant="body" weight="medium" className="mb-3">Address Type</Text>
          <View className="flex-row gap-3">
            {addressTypes.map((type) => { const Icon = type.icon;
              return (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={type.id}
                  onPress={() => setLabel(type.id)}
                  className={`flex-1 p-4 rounded-xl border-2 items-center ${ label === type.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface' }`}
                >
                  <Icon
                    size={24}
                    color={label === type.id ? colors.primary : colors.muted}
                  />
                  <Text
                    variant="bodySmall"
                    weight="medium"
                    className={`mt-2 ${label === type.id ? 'text-primary' : 'text-muted'}`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ); })}
          </View>
        </View>

        {/* Street Address */}
        <Card className="p-4 mb-3">
          <Text variant="body" weight="medium" className="mb-2">Street Address</Text>
          <TextInput
            placeholder="e.g., 123 Cairo Road"
            value={street}
            onChangeText={setStreet}
            className="bg-surface rounded-lg px-4 py-3 text-base"
            placeholderTextColor={colors.muted}
          />
        </Card>

        {/* City */}
        <Card className="p-4 mb-3">
          <Text variant="body" weight="medium" className="mb-2">City</Text>
          <TextInput
            placeholder="e.g., Lusaka"
            value={city}
            onChangeText={setCity}
            className="bg-surface rounded-lg px-4 py-3 text-base"
            placeholderTextColor={colors.muted}
          />
        </Card>

        {/* Province */}
        <Card className="p-4 mb-3">
          <Text variant="body" weight="medium" className="mb-2">Province</Text>
          <TextInput
            placeholder="e.g., Lusaka Province"
            value={province}
            onChangeText={setProvince}
            className="bg-surface rounded-lg px-4 py-3 text-base"
            placeholderTextColor={colors.muted}
          />
        </Card>

        {/* Postal Code */}
        <Card className="p-4 mb-3">
          <Text variant="body" weight="medium" className="mb-2">Postal Code (Optional)</Text>
          <TextInput
            placeholder="e.g., 10101"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
            className="bg-surface rounded-lg px-4 py-3 text-base"
            placeholderTextColor={colors.muted}
          />
        </Card>

        {/* Delivery Instructions */}
        <Card className="p-4 mb-6">
          <Text variant="body" weight="medium" className="mb-2">Delivery Instructions (Optional)</Text>
          <TextInput
            placeholder="e.g., Ring the doorbell twice"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={3}
            className="bg-surface rounded-lg px-4 py-3 text-base"
            placeholderTextColor={colors.muted}
            style={{ textAlignVertical: 'top' }}
          />
        </Card>

        {/* Save Button */}
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="bg-primary py-4 rounded-xl flex-row items-center justify-center mb-6"
          onPress={handleSave}
          disabled={!street || !city}
        >
          <Save size={20} color="white" />
          <Text variant="body" weight="bold" className="text-white ml-2">Save Address</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

