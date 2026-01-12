// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';
import { View, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CustomerSettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  
  // Customer-specific settings
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newRestaurants: false,
    priceDrops: true,
  });
  
  const [preferences, setPreferences] = useState({
    savePaymentInfo: true,
    saveAddresses: true,
    locationServices: true,
    autoApplyPromos: true,
  });

  const SettingRow = ({ 
    icon, 
    iconColor, 
    iconBg, 
    title, 
    subtitle, 
    value, 
    onValueChange 
  }: {
    icon: string;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-border">
      <View className="flex-row items-center flex-1">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: iconBg }}
        >
          <Feather name={icon as any} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-semibold">{title}</Text>
          {subtitle && <Text className="text-muted text-sm">{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
        thumbColor={value ? '#16A34A' : '#9CA3AF'}
      />
    </View>
  );

  const NavigationRow = ({ 
    icon, 
    iconColor, 
    iconBg, 
    title, 
    subtitle,
    onPress 
  }: {
    icon: string;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
  }) => (
    <Pressable
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-border"
    >
      <View className="flex-row items-center flex-1">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: iconBg }}
        >
          <Feather name={icon as any} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-semibold">{title}</Text>
          {subtitle && <Text className="text-muted text-sm">{subtitle}</Text>}
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.muted} />
    </Pressable>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 py-4 border-b border-border flex-row items-center">
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={() => router.back()}
          className="mr-4"
        >
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Notification Settings */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Notifications</Text>
          <View>
            <SettingRow
              icon="package"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Order Updates"
              subtitle="Get notified about your order status"
              value={notifications.orderUpdates}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, orderUpdates: v }))}
            />
            <SettingRow
              icon="tag"
              iconColor="#EA580C"
              iconBg="#FFEDD5"
              title="Promotions & Offers"
              subtitle="Receive special deals and discounts"
              value={notifications.promotions}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, promotions: v }))}
            />
            <SettingRow
              icon="shopping-bag"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="New Restaurants"
              subtitle="Be notified when new vendors join"
              value={notifications.newRestaurants}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, newRestaurants: v }))}
            />
            <SettingRow
              icon="trending-down"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Price Drops"
              subtitle="Get alerts for price reductions"
              value={notifications.priceDrops}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, priceDrops: v }))}
            />
          </View>
        </View>

        {/* Order Preferences */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Order Preferences</Text>
          <View>
            <SettingRow
              icon="credit-card"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Save Payment Info"
              subtitle="Remember your payment methods"
              value={preferences.savePaymentInfo}
              onValueChange={(v) => setPreferences(prev => ({ ...prev, savePaymentInfo: v }))}
            />
            <SettingRow
              icon="map-pin"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title="Save Delivery Addresses"
              subtitle="Remember your delivery locations"
              value={preferences.saveAddresses}
              onValueChange={(v) => setPreferences(prev => ({ ...prev, saveAddresses: v }))}
            />
            <SettingRow
              icon="navigation"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Location Services"
              subtitle="Use GPS for accurate delivery"
              value={preferences.locationServices}
              onValueChange={(v) => setPreferences(prev => ({ ...prev, locationServices: v }))}
            />
            <SettingRow
              icon="percent"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Auto-Apply Promos"
              subtitle="Automatically apply best available promo"
              value={preferences.autoApplyPromos}
              onValueChange={(v) => setPreferences(prev => ({ ...prev, autoApplyPromos: v }))}
            />
          </View>
        </View>

        {/* Appearance */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Appearance</Text>
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                <Feather name="moon" size={20} color="#9333EA" />
              </View>
              <Text className="text-foreground font-semibold">Dark Mode</Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        {/* Account Actions */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Account</Text>
          <View>
            <NavigationRow
              icon="heart"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title="Favorites"
              subtitle="View your favorite restaurants"
              onPress={() => router.push('/(customer)/FavoritesScreen')}
            />
            <NavigationRow
              icon="clock"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Order History"
              subtitle="View past orders and reorder"
              onPress={() => router.push('/(customer)/OrderHistoryScreen')}
            />
            <NavigationRow
              icon="gift"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Referrals"
              subtitle="Invite friends and earn rewards"
              onPress={() => router.push('/(shared)/ReferralScreen')}
            />
          </View>
        </View>

        {/* Support */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-foreground mb-4">Support</Text>
          <View>
            <NavigationRow
              icon="help-circle"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Help & FAQ"
              onPress={() => {}}
            />
            <NavigationRow
              icon="message-circle"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Contact Support"
              onPress={() => {}}
            />
            <NavigationRow
              icon="file-text"
              iconColor="#6B7280"
              iconBg="#F3F4F6"
              title="Terms & Privacy"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

