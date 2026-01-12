// @ts-nocheck
/**
 * MapAddressSelector - Interactive map for selecting delivery addresses
 * Allows users to visually select their location on a map
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { Text } from '@/components/ui/text';
import { ExpoMapView } from '@/components/ExpoMapView';
import { LocationSearchInput } from '@/components/LocationSearchInput';
import { GoogleMapsService } from '@/lib/services/google-maps-service';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export interface SelectedAddress {
  latitude: number;
  longitude: number;
  address: string;
  name?: string;
  placeId?: string;
}

interface MapAddressSelectorProps {
  initialAddress?: SelectedAddress;
  onAddressSelected: (address: SelectedAddress) => void;
  onCancel: () => void;
}

export function MapAddressSelector({
  initialAddress,
  onAddressSelected,
  onCancel,
}: MapAddressSelectorProps) {
  const colors = useColors();
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  }>(
    initialAddress || {
      latitude: -15.3875,
      longitude: 28.3228, // Lusaka default
    }
  );
  const [address, setAddress] = useState(initialAddress?.address || '');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Get current location on mount
  useEffect(() => {
    if (!initialAddress) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setSelectedLocation(newLocation);
      await reverseGeocode(newLocation);
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const reverseGeocode = async (location: { latitude: number; longitude: number }) => {
    try {
      setIsLoadingAddress(true);
      const result = await GoogleMapsService.reverseGeocode(location.latitude, location.longitude);
      if (result) {
        setAddress(result);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress('Unable to get address');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleMapPress = async (coordinate: { latitude: number; longitude: number }) => {
    setSelectedLocation(coordinate);
    await reverseGeocode(coordinate);
  };

  const handlePlaceSelected = async (place: {
    description: string;
    place_id: string;
    latitude?: number;
    longitude?: number;
  }) => {
    if (place.latitude && place.longitude) {
      const newLocation = {
        latitude: place.latitude,
        longitude: place.longitude,
      };
      setSelectedLocation(newLocation);
      setAddress(place.description);
    } else {
      // Geocode the place
      try {
        setIsLoadingAddress(true);
        const result = await GoogleMapsService.geocodeAddress(place.description);
        if (result) {
          setSelectedLocation(result);
          setAddress(place.description);
        }
      } catch (error) {
        console.error('Error geocoding place:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    }
  };

  const handleConfirm = () => {
    const fullAddress = [
      address,
      apartmentNumber && `Apt/Unit: ${apartmentNumber}`,
      deliveryInstructions && `Instructions: ${deliveryInstructions}`,
    ]
      .filter(Boolean)
      .join(', ');

    onAddressSelected({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: fullAddress,
      name: apartmentNumber || undefined,
    });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-lg font-bold text-foreground">Select Delivery Address</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Input */}
        <LocationSearchInput
          onPlaceSelected={handlePlaceSelected}
          placeholder="Search for address..."
        />
      </View>

      {/* Map */}
      <View className="flex-1 relative">
        <ExpoMapView
          initialRegion={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          markers={[
            {
              id: 'selected',
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              title: 'Delivery Location',
            },
          ]}
          onMapPress={handleMapPress}
          height={400}
        />

        {/* Center Pin Indicator */}
        <View
          style={styles.centerPin}
          pointerEvents="none"
        >
          <Feather name="map-pin" size={40} color={colors.primary} />
        </View>

        {/* Current Location Button */}
        <Pressable
          onPress={getCurrentLocation}
          disabled={isLoadingLocation}
          style={({ pressed }) => [
            styles.currentLocationButton,
            { backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="navigation" size={24} color={colors.primary} />
          )}
        </Pressable>
      </View>

      {/* Address Details Form */}
      <ScrollView className="bg-surface px-4 py-4" style={{ maxHeight: 300 }}>
        {/* Selected Address Display */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">Delivery Address</Text>
          <View className="bg-background rounded-lg p-3 border border-border">
            {isLoadingAddress ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text className="text-sm text-foreground">{address || 'Select a location on the map'}</Text>
            )}
          </View>
        </View>

        {/* Apartment/Unit Number */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Apartment / Unit Number (Optional)
          </Text>
          <TextInput
            value={apartmentNumber}
            onChangeText={setApartmentNumber}
            placeholder="e.g., Apt 4B, Unit 12"
            placeholderTextColor={colors.muted}
            className="bg-background rounded-lg px-4 py-3 text-foreground border border-border"
          />
        </View>

        {/* Delivery Instructions */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Delivery Instructions (Optional)
          </Text>
          <TextInput
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            placeholder="e.g., Ring doorbell twice, Leave at gate"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-background rounded-lg px-4 py-3 text-foreground border border-border"
            style={{ minHeight: 80 }}
          />
        </View>

        {/* Confirm Button */}
        <Pressable
          onPress={handleConfirm}
          disabled={!address || isLoadingAddress}
          style={({ pressed }) => [
            styles.confirmButton,
            {
              backgroundColor: !address || isLoadingAddress ? colors.muted : colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text className="text-base font-semibold text-white text-center">
            Confirm Address
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
});
