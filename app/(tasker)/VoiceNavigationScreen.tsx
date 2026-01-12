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
import { useVoiceNavigationStore } from '@/stores/voice-navigation-store';
import Slider from '@react-native-community/slider';

export default function VoiceNavigationScreen() { const router = useRouter();
  const colors = useColors();
  const [showSettings, setShowSettings] = useState(false);
  const { isNavigating,
    currentInstruction,
    upcomingInstructions,
    settings,
    distanceToDestination,
    estimatedTimeArrival,
    startNavigation,
    stopNavigation,
    updatePosition,
    updateSettings,
    loadSettings,
    speak} = useVoiceNavigationStore();

  useEffect(() => { loadSettings(); }, []);

  // Simulate position updates when navigating
  useEffect(() =>  {
    if (!isNavigating) return;
  const interval = setInterval(() => { updatePosition({ latitude: 0, longitude: 0 }); }, 3000);

    return () => clearInterval(interval); }, [isNavigating]);
  const handleStartNavigation = () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }
    startNavigation({ latitude: -15.4167, longitude: 28.2833 }); };
  const handleStopNavigation = () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    stopNavigation(); };
  const handleTestVoice = () =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    speak('This is a test of the voice navigation system'); };
  const formatDistance = (meters: number) =>  {
    if (meters >= 1000) { return `${(meters / 1000).toFixed(1)} km`; }
    return `${meters} m`; };
  const formatETA = (eta: Date | null) =>  {
    if (!eta) return '--';
  const minutes = Math.ceil((eta.getTime() - Date.now()) / 60000);
    return minutes === 1 ? '1 min' : `${minutes} mins`; };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Voice Navigation</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowSettings(!showSettings)}
          className="p-2 -mr-2"
        >
          <Feather name="settings" size={20} color="#009688" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Settings Panel */}
        {showSettings && (
          <View className="bg-surface rounded-xl p-4 my-4 border border-border">
            <Text className="text-base font-semibold text-foreground mb-4">Voice Settings</Text>

            {/* Enable/Disable */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-foreground">Enable Voice Guidance</Text>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSettings({ enabled: value })}
                trackColor={{ false: '#E5E7EB', true: '#009688' }}
                thumbColor="#fff"
              />
            </View>

            {/* Voice Speed */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-foreground">Voice Speed</Text>
                <Text className="text-xs text-muted">{settings.rate.toFixed(1)}x</Text>
              </View>
              <Slider
                value={settings.rate}
                onValueChange={(value) => updateSettings({ rate: value })}
                minimumValue={0.5}
                maximumValue={1.5}
                step={0.1}
                minimumTrackTintColor="#009688"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#009688"
              />
            </View>

            {/* Voice Pitch */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-foreground">Voice Pitch</Text>
                <Text className="text-xs text-muted">{settings.pitch.toFixed(1)}</Text>
              </View>
              <Slider
                value={settings.pitch}
                onValueChange={(value) => updateSettings({ pitch: value })}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                minimumTrackTintColor="#009688"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#009688"
              />
            </View>

            {/* Test Voice Button */}
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleTestVoice}
              className="bg-primary/10 rounded-lg py-3 items-center"
            >
              <Text className="text-primary font-semibold">Test Voice</Text>
            </Pressable>
          </View>
        )}

        {/* Navigation Status */}
        {isNavigating ? (
          <>
            {/* ETA Card */}
            <View className="bg-primary/5 rounded-xl p-6 my-4 border border-primary/20">
              <View className="items-center">
                <Text className="text-sm text-muted mb-2">Estimated Time of Arrival</Text>
                <Text className="text-5xl font-bold text-primary mb-1">
                  {formatETA(estimatedTimeArrival)}
                </Text>
                <Text className="text-sm text-muted">{formatDistance(distanceToDestination)} remaining</Text>
              </View>
            </View>

            {/* Current Instruction */}
            {currentInstruction && (
              <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
                <View className="flex-row items-center mb-2">
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                    <Feather
                      name={currentInstruction.type === 'turn' ? 'corner-down-left' : 'navigation'}
                      size={20}
                      color="#009688"
                    />
                  </View>
                  <Text className="text-xs text-muted ml-3">Current Instruction</Text>
                </View>
                <Text className="text-lg font-semibold text-foreground">
                  {currentInstruction.text}
                </Text>
              </View>
            )}

            {/* Upcoming Instructions */}
            <Text className="text-base font-semibold text-foreground mb-3">Upcoming</Text>
            {upcomingInstructions
              .filter(inst => !inst.triggered)
              .map((instruction) => (
                <View
                  key={instruction.id}
                  className="bg-surface rounded-xl p-4 mb-3 border border-border"
                >
                  <View className="flex-row items-start">
                    <Feather
                      name={instruction.type === 'turn' ? 'corner-down-left' : 'arrow-right'}
                      size={18}
                      color="#6B7280"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm text-foreground">{instruction.text}</Text>
                      <Text className="text-xs text-muted mt-1">
                        in {formatDistance(instruction.distance)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

            {/* Stop Button */}
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleStopNavigation}
              className="bg-error rounded-xl py-4 items-center mb-6"
            >
              <Text className="text-white font-semibold text-base">Stop Navigation</Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Info Card */}
            <View className="bg-primary/5 rounded-xl p-4 my-4 border border-primary/20">
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Feather name="volume-2" size={20} color="#009688" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-foreground mb-1">
                    Hands-Free Navigation
                  </Text>
                  <Text className="text-xs text-muted leading-relaxed">
                    Get turn-by-turn voice instructions while delivering. Keep your eyes on the road and hands on the wheel.
                  </Text>
                </View>
              </View>
            </View>

            {/* Features List */}
            <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
              <Text className="text-base font-semibold text-foreground mb-3">Features</Text>
              
              {[
                { icon: 'navigation', text: 'Turn-by-turn voice guidance' },
                { icon: 'clock', text: 'Automatic ETA updates' },
                { icon: 'map-pin', text: 'Arrival notifications' },
                { icon: 'volume-2', text: 'Customizable voice settings' },
              ].map((feature, index) => (
                <View key={index} className="flex-row items-center mb-3 last:mb-0">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                    <Feather name={feature.icon} size={14} color="#009688" />
                  </View>
                  <Text className="text-sm text-foreground ml-3">{feature.text}</Text>
                </View>
              ))}
            </View>

            {/* Start Button */}
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleStartNavigation}
              className="bg-primary rounded-xl py-4 items-center mb-6"
            >
              <Text className="text-white font-semibold text-base">Start Navigation</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

