import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { useColors } from '@/hooks/use-colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { mapCacheService } from '@/lib/services/map-cache-service';
import { deliveryZones, getHighPriorityZones } from '@/lib/config/delivery-zones';

export default function MapCacheSettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [caching, setCaching] = useState(false);
  const [stats, setStats] = useState({
    tileCount: 0,
    totalSizeMB: 0,
    maxSizeMB: 100,
    usagePercent: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const cacheStats = await mapCacheService.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreloadHighPriority = async () => {
    if (caching) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCaching(true);

    try {
      const zones = getHighPriorityZones();
      await mapCacheService.preloadDeliveryZones(zones);
      await loadStats();
      
      Alert.alert(
        'Success',
        `Preloaded ${zones.length} high-priority delivery zones for offline use.`
      );
    } catch (error) {
      console.error('Error preloading zones:', error);
      Alert.alert('Error', 'Failed to preload delivery zones. Please try again.');
    } finally {
      setCaching(false);
    }
  };

  const handlePreloadAll = async () => {
    if (caching) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCaching(true);

    try {
      await mapCacheService.preloadDeliveryZones(deliveryZones);
      await loadStats();
      
      Alert.alert(
        'Success',
        `Preloaded all ${deliveryZones.length} delivery zones for offline use.`
      );
    } catch (error) {
      console.error('Error preloading zones:', error);
      Alert.alert('Error', 'Failed to preload delivery zones. Please try again.');
    } finally {
      setCaching(false);
    }
  };

  const handleClearCache = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached map tiles? This will free up storage but maps may not work offline.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await mapCacheService.clearCache();
              await loadStats();
              Alert.alert('Success', 'Map cache cleared successfully.');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getUsageColor = () => {
    if (stats.usagePercent < 50) return colors.success;
    if (stats.usagePercent < 80) return '#F59E0B';
    return colors.error;
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Offline Maps</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Cache Statistics */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Cache Statistics</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              {/* Usage Bar */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted">Storage Used</Text>
                  <Text className="text-foreground font-semibold">
                    {stats.totalSizeMB} / {stats.maxSizeMB} MB
                  </Text>
                </View>
                <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    style={{
                      width: `${Math.min(stats.usagePercent, 100)}%`,
                      backgroundColor: getUsageColor(),
                    }}
                    className="h-full"
                  />
                </View>
                <Text className="text-sm text-muted mt-1">
                  {stats.usagePercent.toFixed(1)}% used
                </Text>
              </View>

              {/* Tile Count */}
              <View className="flex-row items-center justify-between py-3 border-t border-border">
                <Text className="text-muted">Cached Tiles</Text>
                <Text className="text-foreground font-semibold">{stats.tileCount}</Text>
              </View>
            </>
          )}
        </View>

        {/* Preload Options */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-lg font-bold text-foreground mb-2">Preload Delivery Zones</Text>
          <Text className="text-sm text-muted mb-4">
            Download map tiles for offline use in areas with poor connectivity. This helps ensure maps work even without internet.
          </Text>

          {/* High Priority Zones */}
          <View className="mb-4">
            <Text className="text-foreground font-semibold mb-2">High Priority Zones</Text>
            <Text className="text-sm text-muted mb-3">
              Lusaka CBD and surrounding areas (~10 MB)
            </Text>
            <PrimaryButton
              onPress={handlePreloadHighPriority}
              disabled={caching}
            >
              {caching ? 'Caching...' : 'Preload High Priority'}
            </PrimaryButton>
          </View>

          {/* All Zones */}
          <View>
            <Text className="text-foreground font-semibold mb-2">All Delivery Zones</Text>
            <Text className="text-sm text-muted mb-3">
              All {deliveryZones.length} zones in Lusaka (~30 MB)
            </Text>
            <SecondaryButton
              onPress={handlePreloadAll}
              disabled={caching}
            >
              {caching ? 'Caching...' : 'Preload All Zones'}
            </SecondaryButton>
          </View>
        </View>

        {/* Zone List */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Delivery Zones</Text>
          {deliveryZones.map((zone, index) => (
            <View
              key={zone.id}
              className={`flex-row items-center justify-between py-3 ${
                index < deliveryZones.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <View className="flex-1">
                <Text className="text-foreground font-semibold">{zone.name}</Text>
                <Text className="text-sm text-muted">
                  {zone.radiusKm} km radius • Priority {zone.priority}
                </Text>
              </View>
              <Feather name="map-pin" size={20} color={colors.primary} />
            </View>
          ))}
        </View>

        {/* Clear Cache */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-lg font-bold text-foreground mb-2">Manage Cache</Text>
          <Text className="text-sm text-muted mb-4">
            Clear all cached map tiles to free up storage space. You can always preload them again later.
          </Text>
          <SecondaryButton onPress={handleClearCache} disabled={loading || stats.tileCount === 0}>
            Clear Cache
          </SecondaryButton>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

