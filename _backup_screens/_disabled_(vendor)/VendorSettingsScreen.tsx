// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';
import { View, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function VendorSettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  
  // Vendor-specific settings
  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderReminders: true,
    lowStock: true,
    dailyReport: true,
    customerReviews: true,
  });
  
  const [storeSettings, setStoreSettings] = useState({
    autoAcceptOrders: false,
    showPrepTime: true,
    allowScheduledOrders: true,
    pauseNewOrders: false,
  });

  const [soundSettings, setSoundSettings] = useState({
    orderSound: true,
    vibration: true,
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
        <Text className="text-2xl font-bold text-foreground">Vendor Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Store Settings */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Store Settings</Text>
          <View>
            <SettingRow
              icon="pause-circle"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title="Pause New Orders"
              subtitle="Temporarily stop accepting orders"
              value={storeSettings.pauseNewOrders}
              onValueChange={(v) => setStoreSettings(prev => ({ ...prev, pauseNewOrders: v }))}
            />
            <SettingRow
              icon="check-circle"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Auto-Accept Orders"
              subtitle="Automatically accept incoming orders"
              value={storeSettings.autoAcceptOrders}
              onValueChange={(v) => setStoreSettings(prev => ({ ...prev, autoAcceptOrders: v }))}
            />
            <SettingRow
              icon="clock"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Show Prep Time"
              subtitle="Display estimated preparation time"
              value={storeSettings.showPrepTime}
              onValueChange={(v) => setStoreSettings(prev => ({ ...prev, showPrepTime: v }))}
            />
            <SettingRow
              icon="calendar"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Scheduled Orders"
              subtitle="Allow customers to schedule orders"
              value={storeSettings.allowScheduledOrders}
              onValueChange={(v) => setStoreSettings(prev => ({ ...prev, allowScheduledOrders: v }))}
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Notifications</Text>
          <View>
            <SettingRow
              icon="shopping-bag"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="New Orders"
              subtitle="Get notified for new orders"
              value={notifications.newOrders}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, newOrders: v }))}
            />
            <SettingRow
              icon="bell"
              iconColor="#EA580C"
              iconBg="#FFEDD5"
              title="Order Reminders"
              subtitle="Reminders for pending orders"
              value={notifications.orderReminders}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, orderReminders: v }))}
            />
            <SettingRow
              icon="alert-triangle"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title="Low Stock Alerts"
              subtitle="Get notified when items are low"
              value={notifications.lowStock}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, lowStock: v }))}
            />
            <SettingRow
              icon="bar-chart-2"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Daily Report"
              subtitle="Receive daily sales summary"
              value={notifications.dailyReport}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, dailyReport: v }))}
            />
            <SettingRow
              icon="star"
              iconColor="#FCD34D"
              iconBg="#FEF3C7"
              title="Customer Reviews"
              subtitle="Get notified for new reviews"
              value={notifications.customerReviews}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, customerReviews: v }))}
            />
          </View>
        </View>

        {/* Sound Settings */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Sound & Alerts</Text>
          <View>
            <SettingRow
              icon="volume-2"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Order Sound"
              subtitle="Play sound for new orders"
              value={soundSettings.orderSound}
              onValueChange={(v) => setSoundSettings(prev => ({ ...prev, orderSound: v }))}
            />
            <SettingRow
              icon="smartphone"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Vibration"
              subtitle="Vibrate for new orders"
              value={soundSettings.vibration}
              onValueChange={(v) => setSoundSettings(prev => ({ ...prev, vibration: v }))}
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

        {/* Store Management */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Store Management</Text>
          <View>
            <NavigationRow
              icon="clock"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Business Hours"
              subtitle="Set your operating hours"
              onPress={() => router.push('/(vendor)/BusinessHoursScreen')}
            />
            <NavigationRow
              icon="package"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Products"
              subtitle="Manage your menu items"
              onPress={() => router.push('/(vendor)/ManageProductsScreen')}
            />
            <NavigationRow
              icon="tag"
              iconColor="#EA580C"
              iconBg="#FFEDD5"
              title="Promotions"
              subtitle="Create and manage promos"
              onPress={() => router.push('/(vendor)/VendorPromosScreen')}
            />
            <NavigationRow
              icon="bar-chart"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Analytics"
              subtitle="View sales and performance"
              onPress={() => router.push('/(vendor)/VendorAnalyticsScreen')}
            />
          </View>
        </View>

        {/* Financial */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Financial</Text>
          <View>
            <NavigationRow
              icon="credit-card"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Wallet & Payouts"
              subtitle="View balance and withdraw funds"
              onPress={() => router.push('/(vendor)/VendorWalletScreen')}
            />
            <NavigationRow
              icon="file-text"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Sales Reports"
              subtitle="Download detailed reports"
              onPress={() => router.push('/(vendor)/VendorSalesReportScreen')}
            />
            <NavigationRow
              icon="download"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Payout History"
              subtitle="View past withdrawals"
              onPress={() => router.push('/(vendor)/PayoutHistoryScreen')}
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
              title="Vendor Help Center"
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
              title="Vendor Agreement"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

