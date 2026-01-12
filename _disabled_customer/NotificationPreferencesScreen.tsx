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
import { pushNotificationService, NotificationPreferences } from '@/services/push-notification-service';

export default function NotificationPreferencesScreen() { const router = useRouter();
  const colors = useColors();
  const [preferences, setPreferences] = useState<NotificationPreferences>({ orderUpdates: true,
    promotions: true,
    reminders: true,
    sound: true,
    vibration: true});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadPreferences(); }, []);
  const loadPreferences = async () => { const prefs = await pushNotificationService.loadPreferences();
    setPreferences(prefs);
    setIsLoading(false); };
  const handleToggle = async (key: keyof NotificationPreferences) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
  const newValue = !preferences[key];
  const updatedPrefs = { ...preferences, [key]: newValue };
    setPreferences(updatedPrefs);
    await pushNotificationService.savePreferences({ [key]: newValue }); };
  const renderToggleItem = (
    key: keyof NotificationPreferences,
    icon: string,
    title: string,
    description: string
  ) => (
    <View className="flex-row items-center py-4 border-b border-border">
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
        <Feather name={icon as any} size={20} color="#009688" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-medium text-foreground">{title}</Text>
        <Text className="text-sm text-muted mt-0.5">{description}</Text>
      </View>
      <Switch
        value={preferences[key]}
        onValueChange={() => handleToggle(key)}
        trackColor={{ false: '#E5E7EB', true: '#009688' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Notifications</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Notification Types */}
        <View className="mt-4">
          <Text className="text-sm font-medium text-muted mb-2">NOTIFICATION TYPES</Text>
          <View className="bg-surface rounded-xl px-4 border border-border">
            {renderToggleItem(
              'orderUpdates',
              'package',
              'Order Updates',
              'Get notified about your order status changes'
            )}
            {renderToggleItem(
              'promotions',
              'tag',
              'Promotions & Offers',
              'Receive special deals and discount codes'
            )}
            {renderToggleItem(
              'reminders',
              'bell',
              'Reminders',
              'Scheduled order and delivery reminders'
            )}
          </View>
        </View>

        {/* Sound & Vibration */}
        <View className="mt-6">
          <Text className="text-sm font-medium text-muted mb-2">SOUND & VIBRATION</Text>
          <View className="bg-surface rounded-xl px-4 border border-border">
            {renderToggleItem(
              'sound',
              'volume-2',
              'Sound',
              'Play sound for notifications'
            )}
            {renderToggleItem(
              'vibration',
              'smartphone',
              'Vibration',
              'Vibrate for notifications'
            )}
          </View>
        </View>

        {/* Info Section */}
        <View className="mt-6 mb-6 bg-primary/5 rounded-xl p-4">
          <View className="flex-row items-start">
            <Feather name="info" size={20} color="#009688" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-foreground">About Notifications</Text>
              <Text className="text-xs text-muted mt-1">
                We'll send you important updates about your orders, deliveries, and exclusive offers. 
                You can customize which notifications you receive above.
              </Text>
            </View>
          </View>
        </View>

        {/* Test Notification Button */}
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={async () => { await pushNotificationService.sendReminderNotification(
              'Test Notification',
              'This is a test notification from Ntumai!'
            );
            if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }}
          className="bg-surface border border-border rounded-xl py-4 mb-6"
        >
          <Text className="text-center text-primary font-medium">Send Test Notification</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

