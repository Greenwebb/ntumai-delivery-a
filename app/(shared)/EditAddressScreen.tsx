// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useColors } from '@/hooks/use-colors';
import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUserStore } from '@/src/store';
import { useToast } from '@/lib/toast-provider';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { SmartMapView } from '@/components/SmartMapView';

export default function EditAddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useColors();
  const toast = useToast();
  const { addresses, updateAddress } = useUserStore();

  // Find the address to edit
  const addressToEdit = addresses.find(addr => addr.id === params.addressId);

  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>(addressToEdit?.type || 'home');
  const [label, setLabel] = useState(addressToEdit?.label || '');
  const [street, setStreet] = useState(addressToEdit?.street || '');
  const [city, setCity] = useState(addressToEdit?.city || 'Lusaka');
  const [state, setState] = useState(addressToEdit?.state || 'Lusaka Province');
  const [zipCode, setZipCode] = useState(addressToEdit?.zipCode || '');
  const [selectedLocation, setSelectedLocation] = useState(
    addressToEdit?.coordinates || {
      latitude: -15.3875,
      longitude: 28.3228,
    }
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (!addressToEdit) {
      toast.error('Address not found');
      router.back();
    }
  }, [addressToEdit]);

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Permission to access location was denied');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setSelectedLocation(newLocation);
      
      // Animate map to new location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync(newLocation);
      if (addresses.length > 0) {
        const addr = addresses[0];
        if (addr.street) setStreet(addr.street);
        if (addr.city) setCity(addr.city);
        if (addr.region) setState(addr.region);
        if (addr.postalCode) setZipCode(addr.postalCode);
      }

      toast.success('Location updated');
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Failed to get current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);

    // Reverse geocode to get address
    try {
      const addresses = await Location.reverseGeocodeAsync(coordinate);
      if (addresses.length > 0) {
        const addr = addresses[0];
        if (addr.street) setStreet(addr.street);
        if (addr.city) setCity(addr.city);
        if (addr.region) setState(addr.region);
        if (addr.postalCode) setZipCode(addr.postalCode);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleSaveAddress = () => {
    if (!street.trim()) {
      toast.error('Please enter a street address');
      return;
    }
    if (!city.trim()) {
      toast.error('Please enter a city');
      return;
    }

    const updatedAddress = {
      ...addressToEdit,
      type: addressType,
      label: label || (addressType === 'home' ? 'Home' : addressType === 'work' ? 'Office' : 'Address'),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      coordinates: selectedLocation,
    };

    updateAddress(params.addressId as string, updatedAddress);
    toast.success('Address updated successfully');
    router.back();
  };

  if (!addressToEdit) {
    return null;
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 py-4 border-b border-border flex-row items-center">
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={() => router.back()}
          className="mr-4"
        >
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground">Edit Address</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Map Section */}
        <View className="h-64 bg-gray-200 relative">
          <SmartMapView
            height={256}
            selectedLocation={selectedLocation}
            destinationLocation={selectedLocation}
            onLocationSelect={handleMapPress}
            interactive={true}
            showRoute={false}
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          />

          {/* Current Location Button */}
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            onPress={handleGetCurrentLocation}
            className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg"
          >
            {isLoadingLocation ? (
              <Feather name="loader" size={24} color={colors.primary} />
            ) : (
              <Feather name="navigation" size={24} color={colors.primary} />
            )}
          </Pressable>
        </View>

        {/* Location Info */}
        <View className="px-6 py-4 bg-surface border-b border-border">
          <Text className="text-sm text-muted mb-1">Tap on the map to update location</Text>
          <Text className="text-xs text-muted">
            Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>

        <View className="px-6 py-6">
          {/* Address Type Selection */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Address Type</Text>
            <View className="flex-row gap-3">
              {(['home', 'work', 'other'] as const).map((type) => (
                <Pressable
                  key={type}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  onPress={() => setAddressType(type)}
                  className={`flex-1 py-3 rounded-lg border-2 items-center ${
                    addressType === type
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <Feather
                    name={type === 'home' ? 'home' : type === 'work' ? 'briefcase' : 'map-pin'}
                    size={20}
                    color={addressType === type ? colors.primary : colors.muted}
                  />
                  <Text
                    className={`text-sm font-semibold mt-1 ${
                      addressType === type ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Label */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Label</Text>
            <Input
              placeholder="e.g., Home, Office, Apartment"
              value={label}
              onChangeText={setLabel}
            />
          </View>

          {/* Street Address */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Street Address *</Text>
            <Input
              placeholder="Enter street address"
              value={street}
              onChangeText={setStreet}
            />
          </View>

          {/* City */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">City *</Text>
            <Input
              placeholder="Enter city"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* State/Province */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">State/Province</Text>
            <Input
              placeholder="Enter state or province"
              value={state}
              onChangeText={setState}
            />
          </View>

          {/* Zip Code */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Zip Code</Text>
            <Input
              placeholder="Enter zip code"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
            />
          </View>

          {/* Coordinates Display */}
          <View className="bg-surface rounded-lg p-4 mb-6">
            <Text className="text-xs text-muted mb-1">Selected Coordinates</Text>
            <Text className="text-sm text-foreground font-mono">
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <PrimaryButton
              title="Save Changes"
              onPress={handleSaveAddress}
              fullWidth
            />
            <SecondaryButton
              title="Cancel"
              onPress={() => router.back()}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

