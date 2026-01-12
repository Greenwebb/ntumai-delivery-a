// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Platform, Linking, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useHeatMapStore, DemandZone, ServiceType } from '@/stores/heat-map-store';
  const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'errands', label: 'Errands' },
];

export default function TaskerHeatMapScreen() { const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const { zones,
    selectedServiceType,
    loadZones,
    refreshZones,
    setServiceType,
    getFilteredZones,
    isLoading,
    lastUpdated} = useHeatMapStore();

  useEffect(() => { loadZones(); }, []);
  const handleRefresh = async () => { setRefreshing(true);
    await refreshZones();
    setRefreshing(false); };
  const handleNavigate = (zone: DemandZone) => { const url = Platform.select({ ios: `maps://app?daddr=${zone.latitude},${zone.longitude
      }`,
      android: `google.navigation:q=${zone.latitude},${zone.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${zone.latitude},${zone.longitude}`
      });

    Linking.openURL(url);

    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } };
  const getDemandColor = (level: string) => { switch (level) { case 'hot':
        return { bg: '#EF444410', text: '#EF4444', border: '#EF444430', label: 'High Demand' };
      case 'warm':
        return { bg: '#F59E0B10', text: '#F59E0B', border: '#F59E0B30', label: 'Medium Demand' };
      case 'cold':
        return { bg: '#3B82F610', text: '#3B82F6', border: '#3B82F630', label: 'Low Demand' };
      default:
        return { bg: '#6B728010', text: '#6B7280', border: '#6B728030', label: 'Unknown' }; } };
  const renderZone = (zone: DemandZone) => { const demandColor = getDemandColor(zone.demandLevel);
  const demandRatio = zone.activeOrders / zone.availableTaskers;
  const competition = demandRatio > 3 ? 'Low' : demandRatio > 1.5 ? 'Medium' : 'High';

    return (
      <View
        key={zone.id}
        className="rounded-xl p-4 mb-3"
        style={{ backgroundColor: demandColor.bg, borderWidth: 1, borderColor: demandColor.border }}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{zone.name}</Text>
            <View className="flex-row items-center mt-1">
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: demandColor.bg, borderWidth: 1, borderColor: demandColor.border }}
              >
                <Text className="text-xs font-medium" style={{ color: demandColor.text }}>
                  {demandColor.label}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleNavigate(zone)}
            className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
          >
            <Feather name="navigation" size={18} color="#009688" />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Estimated Earnings</Text>
            <Text className="text-2xl font-bold text-primary">K{zone.estimatedEarnings}</Text>
            <Text className="text-xs text-muted">per hour</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-xs text-muted mb-1">Competition</Text>
            <Text className={`text-lg font-semibold ${competition === 'Low' ? 'text-success' : competition === 'Medium' ? 'text-warning' : 'text-error'}`}>
              {competition}
            </Text>
            <Text className="text-xs text-muted">
              {zone.availableTaskers} taskers
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-border">
          <View className="flex-row items-center">
            <Feather name="shopping-bag" size={14} color="#6B7280" />
            <Text className="text-xs text-muted ml-1">{zone.activeOrders} active orders</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="clock" size={14} color="#6B7280" />
            <Text className="text-xs text-muted ml-1">{zone.peakHours}</Text>
          </View>
        </View>
      </View>
    ); };
  const filteredZones = getFilteredZones();
  const sortedZones = [...filteredZones].sort((a, b) => { const demandOrder = { hot: 0, warm: 1, cold: 2 };
    return demandOrder[a.demandLevel] - demandOrder[b.demandLevel]; });

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Demand Heat Map</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleRefresh} className="p-2 -mr-2">
          <Feather name="refresh-cw" size={20} color="#009688" />
        </Pressable>
      </View>

      {/* Service Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3 border-b border-border"
        contentContainerStyle={{ gap: 8 }}
      >
        {SERVICE_TYPES.map(type => (
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={type.value}
            onPress={() => { setServiceType(type.value);
              if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
            className={`px-4 py-2 rounded-full ${ selectedServiceType === type.value
                ? 'bg-primary'
                : 'bg-surface border border-border' }`}
          >
            <Text
              className={`text-sm font-medium ${ selectedServiceType === type.value ? 'text-white' : 'text-foreground' }`}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#009688" /> }
      >
        {/* Info Card */}
        <View className="bg-primary/5 rounded-xl p-4 my-4 border border-primary/20">
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Feather name="info" size={20} color="#009688" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-foreground mb-1">
                Position Yourself Strategically
              </Text>
              <Text className="text-xs text-muted leading-relaxed">
                High demand zones have more orders than available taskers. Head to these areas to maximize your earnings!
              </Text>
            </View>
          </View>
        </View>

        {/* Zones List */}
        {sortedZones.length > 0 ? (
          sortedZones.map(renderZone)
        ) : (
          <View className="items-center justify-center py-12">
            <Feather name="map" size={48} color="#E5E7EB" />
            <Text className="text-muted mt-4">No zones available for this service type</Text>
          </View>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <View className="items-center py-6">
            <Text className="text-xs text-muted">
              Last updated: {new Date(lastUpdated).toLocaleTimeString('en-US', { hour: 'numeric',
                minute: '2-digit'})}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

