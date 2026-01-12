// @ts-nocheck
import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast-provider';
import { authApi } from '@/lib/api/auth';
import { isDemoMode } from '@/lib/config/demo-mode';
import { useAuthStore } from '@/lib/stores/auth-store';
import { CheckCircle, Circle } from 'lucide-react-native';

type UserRole = 'customer' | 'tasker';

export default function RoleConfirmationScreen() {
  const router = useRouter();
  const { role: initialRole } = useLocalSearchParams();
  const toast = useToast();
  
  const { user, setUser } = useAuthStore();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRole === 'tasker' ? 'tasker' : 'customer'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      setIsLoading(true);
      
      // In demo mode, skip real API and update role directly
      if (isDemoMode()) {
        setIsLoading(false);
        
        setUser({ ...user, role: selectedRole });
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        toast.success('Welcome to Ntumai!');
        
        if (selectedRole === 'tasker') {
          router.replace('/(tasker)/TaskerDashboard');
        } else {
          router.replace('/(customer)/CustomerDashboard');
        }
        return;
      }
      
      // Real API call for non-demo mode
      const result = await authApi.updateUserRole(selectedRole);
      setIsLoading(false);

      if (result.success && result.user) {
        setUser({ ...user, ...result.user });

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        toast.success('Welcome to Ntumai!');

        if (selectedRole === 'tasker') {
          router.replace('/(tasker)/(tabs)');
        } else {
          router.replace('/(customer)/(tabs)');
        }
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        toast.error('Failed to update role. Please try again.');
      }
    } catch (err: any) {
      console.error('Update role error:', err);
      setIsLoading(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      toast.error(err?.message || 'An unexpected error occurred');
    }
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 justify-center">
        <View className="flex-1 justify-center max-w-md w-full self-center">
          <View className="mb-12">
            <Text variant="h1" weight="bold">
              Select your role
            </Text>
            <Text variant="body" color="muted" className="mt-2">
              You can change this later in your profile settings
            </Text>
          </View>

          <View className="gap-4 mb-8">
            <RoleOption
              title="Customer"
              description="Order deliveries and request tasks"
              selected={selectedRole === 'customer'}
              onPress={() => handleRoleSelect('customer')}
            />
            <RoleOption
              title="Tasker"
              description="Earn money by delivering and completing tasks"
              selected={selectedRole === 'tasker'}
              onPress={() => handleRoleSelect('tasker')}
            />
          </View>

          <Button
            onPress={handleContinue}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}

interface RoleOptionProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

function RoleOption({ title, description, selected, onPress }: RoleOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`p-6 rounded-2xl border-2 ${
        selected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
      }`}
    >
      <View className="flex-row items-start">
        <View className="flex-1 mr-4">
          <Text variant="h3" weight="semibold" className="mb-2">
            {title}
          </Text>
          <Text variant="body" color="muted">
            {description}
          </Text>
        </View>
        <View className="mt-1">
          {selected ? (
            <CheckCircle size={28} color="#009688" />
          ) : (
            <Circle size={28} color="#D1D5DB" />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

