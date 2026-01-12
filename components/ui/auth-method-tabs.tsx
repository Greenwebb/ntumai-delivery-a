// @ts-nocheck
import React from 'react';
import { Pressable, View, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import * as Haptics from 'expo-haptics';

interface AuthMethodTabsProps {
  selectedMethod: 'phone' | 'email';
  onMethodChange: (method: 'phone' | 'email') => void;
  className?: string;
}

export function AuthMethodTabs({ selectedMethod, onMethodChange, className }: AuthMethodTabsProps) {
  const handleMethodChange = (method: 'phone' | 'email') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMethodChange(method);
  };

  return (
    <View className={`flex-row w-full rounded-full p-1 mb-6 bg-surface shadow-sm ${className || ''}`}>
      <Pressable
        className={`flex-1 py-4 rounded-full items-center justify-center ${selectedMethod === 'phone' ? 'bg-background' : 'bg-transparent'}`}
        onPress={() => handleMethodChange('phone')}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Text variant="body" weight="medium" color={selectedMethod === 'phone' ? 'foreground' : 'muted'}>
          Phone Number
        </Text>
      </Pressable>

      <Pressable
        className={`flex-1 py-4 rounded-full items-center justify-center ${selectedMethod === 'email' ? 'bg-background' : 'bg-transparent'}`}
        onPress={() => handleMethodChange('email')}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Text variant="body" weight="medium" color={selectedMethod === 'email' ? 'foreground' : 'muted'}>
          Email
        </Text>
      </Pressable>
    </View>
  );
}
