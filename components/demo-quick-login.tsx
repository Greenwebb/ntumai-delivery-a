// @ts-nocheck
/**
 * Demo Quick Login Component
 * 
 * Shows pre-filled demo user buttons when USAGE_DEMO=true
 * Allows quick testing of all three roles without entering credentials
 */

import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { isDemoMode, DEMO_CONFIG } from '@/lib/config/demo-mode';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { User, Briefcase, Store } from 'lucide-react-native';

interface DemoQuickLoginProps {
  onSelectUser: (email: string, password: string, role: 'customer' | 'tasker' | 'vendor') => Promise<void>;
}

export function DemoQuickLogin({ onSelectUser }: DemoQuickLoginProps) {
  const colors = useColors();
  
  // Only show in demo mode
  if (!isDemoMode()) {
    return null;
  }
  
  const handlePress = async (email: string, password: string, role: 'customer' | 'tasker' | 'vendor') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await onSelectUser(email, password, role);
  };
  
  const demoUsers = [
    {
      role: 'customer' as const,
      label: 'Customer',
      email: DEMO_CONFIG.users.customer.email,
      password: DEMO_CONFIG.users.customer.password,
      icon: User,
      color: '#4ECDC4',
    },
    {
      role: 'tasker' as const,
      label: 'Tasker',
      email: DEMO_CONFIG.users.tasker.email,
      password: DEMO_CONFIG.users.tasker.password,
      icon: Briefcase,
      color: '#95E1D3',
    },
    {
      role: 'vendor' as const,
      label: 'Vendor',
      email: DEMO_CONFIG.users.vendor.email,
      password: DEMO_CONFIG.users.vendor.password,
      icon: Store,
      color: '#F38181',
    },
  ];
  
  return (
    <View className="mt-6 mb-4">
      {/* Demo Mode Badge */}
      <View className="bg-warning/10 border border-warning rounded-lg p-3 mb-4">
        <Text className="text-warning text-sm font-medium text-center">
          🎭 DEMO MODE ACTIVE
        </Text>
        <Text className="text-warning/80 text-xs text-center mt-1">
          Quick login with pre-filled test accounts
        </Text>
      </View>
      
      {/* Quick Login Buttons */}
      <View className="gap-3">
        {demoUsers.map((user) => {
          const Icon = user.icon;
          return (
            <TouchableOpacity
              key={user.role}
              onPress={() => handlePress(user.email, user.password, user.role)}
              className="bg-surface border border-border rounded-xl p-4 flex-row items-center"
              style={{ borderColor: user.color + '40' }}
            >
              <View 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: user.color + '20' }}
              >
                <Icon size={20} color={user.color} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base">
                  Login as {user.label}
                </Text>
                <Text className="text-muted text-sm">
                  {user.email}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Divider */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-border" />
        <Text className="text-muted text-sm mx-4">or enter manually</Text>
        <View className="flex-1 h-px bg-border" />
      </View>
    </View>
  );
}
