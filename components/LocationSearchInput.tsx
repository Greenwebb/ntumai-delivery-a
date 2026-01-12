// @ts-nocheck
/**
 * LocationSearchInput - Autocomplete location search using Google Places API
 * Provides real-time place suggestions as user types
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { googleMapsService, type PlaceAutocomplete, type LatLng } from '@/lib/services/google-maps-service';
import { cn } from '@/lib/utils';

interface LocationSearchInputProps {
  placeholder?: string;
  value?: string;
  onLocationSelect: (location: {
    address: string;
    coordinates: LatLng;
    placeId: string;
  }) => void;
  currentLocation?: LatLng;
  className?: string;
}

export function LocationSearchInput({
  placeholder = 'Search for a location...',
  value = '',
  onLocationSelect,
  currentLocation,
  className,
}: LocationSearchInputProps) {
  const colors = useColors();
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceAutocomplete[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchPlaces(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchPlaces = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const results = await googleMapsService.searchPlaces(
        searchQuery,
        currentLocation
      );
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching places:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlace = async (place: PlaceAutocomplete) => {
    setQuery(place.description);
    setShowSuggestions(false);

    // Fetch full place details to get coordinates
    try {
      const details = await googleMapsService.getPlaceDetails(place.placeId);
      if (details) {
        onLocationSelect({
          address: details.address,
          coordinates: details.location,
          placeId: details.placeId,
        });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const renderSuggestion = ({ item }: { item: PlaceAutocomplete }) => (
    <Pressable
      onPress={() => handleSelectPlace(item)}
      style={({ pressed }) => [
        styles.suggestionItem,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      className="flex-row items-center p-4 border-b border-border"
    >
      <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-3">
        <Feather name="map-pin" size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {item.mainText}
        </Text>
        <Text className="text-xs text-muted mt-0.5" numberOfLines={1}>
          {item.secondaryText}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.muted} />
    </Pressable>
  );

  return (
    <View className={cn('relative', className)}>
      {/* Search Input */}
      <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
        <Feather name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          className="flex-1 ml-3 text-base text-foreground"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
        {query.length > 0 && !isLoading && (
          <Pressable
            onPress={() => {
              setQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather name="x-circle" size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl border border-border shadow-lg z-50 max-h-80">
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* No Results */}
      {showSuggestions && !isLoading && query.length >= 3 && suggestions.length === 0 && (
        <View className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl border border-border p-6 items-center">
          <Feather name="map-pin" size={40} color={colors.muted} />
          <Text className="text-sm text-muted mt-3 text-center">
            No locations found for "{query}"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionItem: {
    backgroundColor: 'transparent',
  },
});
