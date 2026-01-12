// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import { useState } from 'react';

import { View, ScrollView, Image, Switch, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { useAuthStore } from '@/src/store';
import { useToast } from '@/lib/toast-provider';

import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    toast.success('Logged out successfully');
    router.replace('/(launch)/splash');
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        variant="destructive"
      />

      {/* Header */}
      <View className="px-6 py-4 border-b border-border flex-row items-center">
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={() => router.back()}
          className="mr-4"
        >
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="px-6 py-8 items-center border-b border-border">
          <Image
            source={{ uri: user?.avatar }}
            className="w-24 h-24 rounded-full mb-4"
          />
          <Text className="text-2xl font-bold text-foreground mb-1">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-muted mb-4">{user?.email}</Text>
          <View className="flex-row items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
            <View className="w-2 h-2 bg-primary rounded-full" />
            <Text className="text-green-700 font-semibold capitalize">{user?.role}</Text>
          </View>
        </View>

        {/* Account Section */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Account</Text>
          <View className="gap-3">
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              onPress={() => router.push('/(shared)/EditProfileScreen')}
              className="flex-row items-center justify-between py-4 border-b border-border"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Feather name="user" size={20} color="#2563EB" />
                </View>
                <Text className="text-foreground font-semibold">Edit Profile</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              onPress={() => router.push('/(shared)/AddressesScreen')}
              className="flex-row items-center justify-between py-4 border-b border-border"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Feather name="map-pin" size={20} color="#16A34A" />
                </View>
                <Text className="text-foreground font-semibold">Addresses</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              onPress={() => router.push('/(shared)/PaymentMethodsScreen')}
              className="flex-row items-center justify-between py-4 border-b border-border"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Feather name="credit-card" size={20} color="#7C3AED" />
                </View>
                <Text className="text-foreground font-semibold">Payment Methods</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              onPress={() => {
                if (user?.role === 'customer') {
                  router.push('/(customer)/CustomerSettingsScreen');
                } else if (user?.role === 'tasker') {
                  router.push('/(tasker)/TaskerSettingsScreen');
                } else if (user?.role === 'vendor') {
                  router.push('/(vendor)/VendorSettingsScreen');
                }
              }}
              className="flex-row items-center justify-between py-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Feather name="settings" size={20} color="#6B7280" />
                </View>
                <Text className="text-foreground font-semibold">Settings</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Preferences</Text>
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                  <Feather name="bell" size={20} color="#EA580C" />
                </View>
                <Text className="text-foreground font-semibold">Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={notificationsEnabled ? '#16A34A' : '#9CA3AF'}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                  <Feather name="navigation" size={20} color="#EF4444" />
                </View>
                <Text className="text-foreground font-semibold">Location Services</Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={locationEnabled ? '#16A34A' : '#9CA3AF'}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Feather name="moon" size={20} color="#9333EA" />
                </View>
                <Text className="text-foreground font-semibold">Dark Mode</Text>
              </View>
              <ThemeToggle />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Support</Text>
          <View className="gap-3">
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="flex-row items-center justify-between py-4 border-b border-border"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Feather name="help-circle" size={20} color="#2563EB" />
                </View>
                <Text className="text-foreground font-semibold">Help & Support</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="flex-row items-center justify-between py-4 border-b border-border"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Feather name="file-text" size={20} color="#16A34A" />
                </View>
                <Text className="text-foreground font-semibold">Terms & Privacy</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="flex-row items-center justify-between py-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                  <Feather name="info" size={20} color="#FCD34D" />
                </View>
                <Text className="text-foreground font-semibold">About</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-6 py-6">
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            onPress={handleLogout}
            className="bg-error rounded-lg py-4"
          >
            <View className="flex-row items-center justify-center">
              <Feather name="log-out" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Logout</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

