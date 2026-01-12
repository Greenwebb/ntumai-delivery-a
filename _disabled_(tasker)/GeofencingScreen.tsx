// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Switch, Platform, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGeofencingStore, DeliveryZone } from '@/stores/geofencing-store';

export default function GeofencingScreen() { const router = useRouter();
  const colors = useColors();
  const { zones,
    currentZone,
    zoneHistory,
    isMonitoring,
    taskerAvailability,
    pendingOrders,
    loadZones,
    toggleZoneActive,
    startMonitoring,
    stopMonitoring,
    setAvailability} = useGeofencingStore();

  useEffect(() => { loadZones(); }, []);
  const handleToggleMonitoring = async () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }

    if (isMonitoring) { stopMonitoring(); } else { await startMonitoring(); } };
  const handleToggleZone = async (zoneId: string) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    await toggleZoneActive(zoneId); };
  const handleSetAvailability = async (status: 'online' | 'offline' | 'busy') =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    await setAvailability(status); };
  const renderZone = (zone: DeliveryZone) => { const isCurrentZone = currentZone?.id === zone.id;

    return (
      <View
        key={zone.id}
        className={`rounded-xl p-4 mb-3 border ${ isCurrentZone
            ? 'bg-primary/5 border-primary/30'
            : 'bg-surface border-border' }`}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-semibold text-foreground">{zone.name}</Text>
              {isCurrentZone && (
                <View className="ml-2 px-2 py-0.5 bg-primary/20 rounded-full">
                  <Text className="text-xs font-medium text-primary">Current</Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-muted">Radius: {zone.radius}m</Text>
          </View>
          <Switch
            value={zone.isActive}
            onValueChange={() => handleToggleZone(zone.id)}
            trackColor={{ false: '#E5E7EB', true: '#009688' }}
            thumbColor="#fff"
          />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Orders Completed</Text>
            <Text className="text-lg font-bold text-foreground">{zone.ordersInZone}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xs text-muted mb-1">Total Earnings</Text>
            <Text className="text-lg font-bold text-primary">K{zone.totalEarnings}</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-xs text-muted mb-1">Avg Rating</Text>
            <View className="flex-row items-center">
              <Feather name="star" size={14} color="#F59E0B" />
              <Text className="text-lg font-bold text-foreground ml-1">{zone.averageRating}</Text>
            </View>
          </View>
        </View>
      </View>
    ); };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Delivery Zones</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Monitoring Status */}
        <View className="bg-surface rounded-xl p-4 my-4 border border-border">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-success' : 'bg-muted'}`} />
              <Text className="text-base font-semibold text-foreground ml-2">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
              </Text>
            </View>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleToggleMonitoring}
              className={`px-4 py-2 rounded-full ${ isMonitoring ? 'bg-error/10' : 'bg-primary/10' }`}
            >
              <Text className={`text-sm font-semibold ${ isMonitoring ? 'text-error' : 'text-primary' }`}>
                {isMonitoring ? 'Stop' : 'Start'}
              </Text>
            </Pressable>
          </View>

          {currentZone && (
            <View className="pt-3 border-t border-border">
              <Text className="text-xs text-muted mb-1">Currently In</Text>
              <Text className="text-sm font-semibold text-foreground">{currentZone.name}</Text>
              {pendingOrders > 0 && (
                <Text className="text-xs text-primary mt-1">
                  {pendingOrders} order{pendingOrders > 1 ? 's' : ''} available
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Availability Status */}
        <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
          <Text className="text-base font-semibold text-foreground mb-3">Availability Status</Text>
          <View className="flex-row gap-2">
            {[
              { value: 'online', label: 'Online', color: '#22C55E' },
              { value: 'busy', label: 'Busy', color: '#F59E0B' },
              { value: 'offline', label: 'Offline', color: '#6B7280' },
            ].map((status) => (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={status.value}
                onPress={() => handleSetAvailability(status.value as any)}
                className={`flex-1 rounded-lg py-3 items-center ${ taskerAvailability === status.value
                    ? 'border-2'
                    : 'bg-background border border-border' }`}
                style={taskerAvailability === status.value ? { borderColor: status.color } : {}}
              >
                <View
                  className="w-3 h-3 rounded-full mb-1"
                  style={{ backgroundColor: status.color }}
                />
                <Text
                  className={`text-sm font-semibold ${ taskerAvailability === status.value ? 'text-foreground' : 'text-muted' }`}
                >
                  {status.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Active Zones */}
        <Text className="text-base font-semibold text-foreground mb-3">Your Zones</Text>
        {zones.length > 0 ? (
          zones.map(renderZone)
        ) : (
          <View className="items-center justify-center py-12">
            <Feather name="map" size={48} color="#E5E7EB" />
            <Text className="text-muted mt-4">No zones configured</Text>
          </View>
        )}

        {/* Zone History */}
        {zoneHistory.length > 0 && (
          <>
            <Text className="text-base font-semibold text-foreground mb-3 mt-4">Recent Activity</Text>
            {zoneHistory.slice(0, 5).map((event) => (
              <View
                key={event.id}
                className="bg-surface rounded-xl p-3 mb-2 border border-border"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Feather
                      name={event.type === 'enter' ? 'log-in' : 'log-out'}
                      size={16}
                      color={event.type === 'enter' ? '#22C55E' : '#6B7280'}
                    />
                    <Text className="text-sm text-foreground ml-2">
                      {event.type === 'enter' ? 'Entered' : 'Exited'} {event.zoneName}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted">
                    {new Date(event.timestamp).toLocaleTimeString('en-US', { hour: 'numeric',
                      minute: '2-digit'})}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

