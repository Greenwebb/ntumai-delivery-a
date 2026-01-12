// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Pressable, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address { id: string;
  label: string;
  fullAddress: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  type: 'home' | 'work' | 'other'; }
  const ADDRESS_STORAGE_KEY = 'ntumai_addresses';
  const ADDRESS_TYPES = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'other', label: 'Other', icon: 'map-pin' },
];

// Mock addresses for Lusaka
const MOCK_ADDRESSES: Address[] = [
  { id: 'addr-001',
    label: 'Home',
    fullAddress: '123 Leopards Hill Road, Kabulonga, Lusaka',
    landmark: 'Near Kabulonga Mall',
    latitude: -15.4167,
    longitude: 28.3167,
    isDefault: true,
    type: 'home'},
  { id: 'addr-002',
    label: 'Office',
    fullAddress: 'Plot 456, Cairo Road, CBD, Lusaka',
    landmark: 'Opposite Shoprite',
    latitude: -15.4089,
    longitude: 28.2871,
    isDefault: false,
    type: 'work'},
];

export default function AddressBookScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Form state
  const [label, setLabel] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  useEffect(() => { loadAddresses(); }, []);
  const loadAddresses = async () => { try { const stored = await AsyncStorage.getItem(ADDRESS_STORAGE_KEY);
      if (stored) { setAddresses(JSON.parse(stored)); } } catch (error) { console.error('Failed to load addresses:', error); } };
  const saveAddresses = async (newAddresses: Address[]) => { try { await AsyncStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(newAddresses));
      setAddresses(newAddresses); } catch (error) { console.error('Failed to save addresses:', error); } };
  const resetForm = () => { setLabel('');
    setFullAddress('');
    setLandmark('');
    setAddressType('home');
    setLatitude(0);
    setLongitude(0);
    setEditingAddress(null); };
  const handleUseCurrentLocation = async () => { setIsLoadingLocation(true);
    try { const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { toast.info('Please enable location services to use this feature.');
        return; }
  const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Reverse geocode to get address
      const [geocoded] = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude,
        longitude: location.coords.longitude});

      if (geocoded) { const addressParts = [
          geocoded.streetNumber,
          geocoded.street,
          geocoded.district,
          geocoded.city,
        ].filter(Boolean);
        setFullAddress(addressParts.join(', ')); }

      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (error) { toast.error('Failed to get current location. Please try again.'); } finally { setIsLoadingLocation(false); } };
  const handleSaveAddress = () =>  {
    if (!label.trim() || !fullAddress.trim()) { toast.error('Please provide a label and address.');
      return; }
  const newAddress: Address = { id: editingAddress?.id || `addr-${Date.now()}`,
      label: label.trim(),
      fullAddress: fullAddress.trim(),
      landmark: landmark.trim() || undefined,
      latitude: latitude || -15.4167,
      longitude: longitude || 28.3167,
      isDefault: editingAddress?.isDefault || addresses.length === 0,
      type: addressType};

    let updatedAddresses: Address[];
    if (editingAddress) { updatedAddresses = addresses.map(a => (a.id === editingAddress.id ? newAddress : a)); } else { updatedAddresses = [...addresses, newAddress]; }

    saveAddresses(updatedAddresses);
    setShowAddModal(false);
    resetForm();
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); };
  const handleSetDefault = (addressId: string) => { const updatedAddresses = addresses.map(a => ({ ...a,
      isDefault: a.id === addressId}));
    saveAddresses(updatedAddresses);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const handleDeleteAddress = (addressId: string) => { toast.info(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete',
          style: 'destructive',
          onPress: () => { const updatedAddresses = addresses.filter(a => a.id !== addressId);
            // If deleted address was default, set first remaining as default
            if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) { updatedAddresses[0].isDefault = true; }
            saveAddresses(updatedAddresses);
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }},
      ]
    ); };
  const handleEditAddress = (address: Address) => { setEditingAddress(address);
    setLabel(address.label);
    setFullAddress(address.fullAddress);
    setLandmark(address.landmark || '');
    setAddressType(address.type);
    setLatitude(address.latitude);
    setLongitude(address.longitude);
    setShowAddModal(true); };
  const getTypeIcon = (type: string) => { const typeConfig = ADDRESS_TYPES.find(t => t.id === type);
    return typeConfig?.icon || 'map-pin'; };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Saved Addresses</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => { resetForm();
            setShowAddModal(true); }}
          className="p-2 -mr-2"
        >
          <Feather name="plus" size={24} color="#009688" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Address List */}
        {addresses.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4">
              <Feather name="map-pin" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">No Saved Addresses</Text>
            <Text className="text-sm text-muted text-center mb-6">
              Add your delivery addresses for faster checkout
            </Text>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowAddModal(true)}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Add Address</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3 pb-6">
            {addresses.map((address) => (
              <View key={address.id} className="bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-start">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${address.isDefault ? 'bg-primary' : 'bg-primary/10'}`}>
                    <Feather name={getTypeIcon(address.type)} size={20} color={address.isDefault ? '#FFFFFF' : '#009688'} />
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                      <Text className="text-base font-semibold text-foreground">{address.label}</Text>
                      {address.isDefault && (
                        <View className="ml-2 px-2 py-0.5 bg-primary/10 rounded">
                          <Text className="text-xs text-primary font-medium">Default</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-muted mt-1" numberOfLines={2}>{address.fullAddress}</Text>
                    {address.landmark && (
                      <Text className="text-xs text-muted mt-1">📍 {address.landmark}</Text>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row mt-4 pt-3 border-t border-border gap-2">
                  {!address.isDefault && (
                    <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleSetDefault(address.id)}
                      className="flex-1 flex-row items-center justify-center py-2 bg-primary/10 rounded-lg"
                    >
                      <Feather name="check-circle" size={16} color="#009688" />
                      <Text className="ml-1 text-sm text-primary font-medium">Set Default</Text>
                    </Pressable>
                  )}
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleEditAddress(address)}
                    className="flex-1 flex-row items-center justify-center py-2 bg-surface border border-border rounded-lg"
                  >
                    <Feather name="edit-2" size={16} color="#6B7280" />
                    <Text className="ml-1 text-sm text-muted font-medium">Edit</Text>
                  </Pressable>
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDeleteAddress(address.id)}
                    className="flex-1 flex-row items-center justify-center py-2 bg-error/10 rounded-lg"
                  >
                    <Feather name="trash-2" size={16} color="#EF4444" />
                    <Text className="ml-1 text-sm text-error font-medium">Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Address Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl max-h-[90%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => { setShowAddModal(false); resetForm(); }}>
                <Text className="text-base text-muted">Cancel</Text>
              </Pressable>
              <Text className="text-lg font-semibold text-foreground">
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </Text>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSaveAddress}>
                <Text className="text-base text-primary font-semibold">Save</Text>
              </Pressable>
            </View>

            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
              {/* Use Current Location */}
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleUseCurrentLocation}
                disabled={isLoadingLocation}
                className="flex-row items-center justify-center py-3 bg-primary/10 rounded-xl mb-6"
              >
                <Feather name={isLoadingLocation ? 'loader' : 'navigation'} size={20} color="#009688" />
                <Text className="ml-2 text-base text-primary font-medium">
                  {isLoadingLocation ? 'Getting location...' : 'Use Current Location'}
                </Text>
              </Pressable>

              {/* Address Type */}
              <Text className="text-sm font-medium text-foreground mb-2">Address Type</Text>
              <View className="flex-row gap-2 mb-4">
                {ADDRESS_TYPES.map((type) => (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={type.id}
                    onPress={() => setAddressType(type.id as any)}
                    className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${ addressType === type.id ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
                  >
                    <Feather name={type.icon} size={18} color={addressType === type.id ? '#FFFFFF' : '#6B7280'} />
                    <Text className={`ml-2 text-sm font-medium ${addressType === type.id ? 'text-white' : 'text-muted'}`}>
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Label */}
              <Text className="text-sm font-medium text-foreground mb-2">Label</Text>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="e.g., Home, Office, Mom's House"
                className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-4"
                placeholderTextColor="#9CA3AF"
              />

              {/* Full Address */}
              <Text className="text-sm font-medium text-foreground mb-2">Full Address</Text>
              <TextInput
                value={fullAddress}
                onChangeText={setFullAddress}
                placeholder="Street, Area, City"
                multiline
                numberOfLines={2}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-4"
                placeholderTextColor="#9CA3AF"
              />

              {/* Landmark */}
              <Text className="text-sm font-medium text-foreground mb-2">Landmark (Optional)</Text>
              <TextInput
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g., Near Shoprite, Opposite Total Station"
                className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-6"
                placeholderTextColor="#9CA3AF"
              />

              {/* Map Preview Placeholder */}
              <View className="h-40 bg-surface rounded-xl items-center justify-center border border-border mb-6">
                <Feather name="map" size={40} color="#9CA3AF" />
                <Text className="text-sm text-muted mt-2">Map preview</Text>
                {latitude !== 0 && (
                  <Text className="text-xs text-muted mt-1">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </Text>
                )}
              </View>

              <View className="h-8" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

