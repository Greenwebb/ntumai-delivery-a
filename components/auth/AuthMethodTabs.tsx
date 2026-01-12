// @ts-nocheck
import React from "react";
import { Pressable, View, Platform } from "react-native";
import AppText from "@/components/AppText";
import * as Haptics from 'expo-haptics';

interface AuthMethodTabsProps {
  selectedMethod: "phone" | "email";
  onMethodChange: (method: "phone" | "email") => void;
  className?: string;
}

const AuthMethodTabs: React.FC<AuthMethodTabsProps> = ({
  selectedMethod,
  onMethodChange,
  className,
}) => {
  const handleMethodChange = (method: 'phone' | 'email') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMethodChange(method);
  };

  return (
    <View className={`flex-row w-full mb-8 rounded-full bg-surface p-2 shadow-sm ${className || ''}`}>
      <Pressable
        className={`flex-1 py-4 rounded-full items-center ${
          selectedMethod === 'phone' ? 'bg-background' : ''
        }`}
        onPress={() => handleMethodChange('phone')}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <AppText variant="body" weight="bold" className={selectedMethod === 'phone' ? 'text-foreground' : 'text-muted'}>
          Phone Number
        </AppText>
      </Pressable>
      <Pressable
        className={`flex-1 py-4 rounded-full items-center ${
          selectedMethod === 'email' ? 'bg-background' : ''
        }`}
        onPress={() => handleMethodChange('email')}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <AppText variant="body" weight="bold" className={selectedMethod === 'email' ? 'text-foreground' : 'text-muted'}>
          Email
        </AppText>
      </Pressable>
    </View>
  );
};

export default AuthMethodTabs;
