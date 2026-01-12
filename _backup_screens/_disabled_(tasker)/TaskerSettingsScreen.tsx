// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';
import { View, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function TaskerSettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  
  // Tasker-specific settings
  const [notifications, setNotifications] = useState({
    newJobs: true,
    jobReminders: true,
    earningsUpdates: true,
    weeklyReport: true,
  });
  
  const [workPreferences, setWorkPreferences] = useState({
    autoAcceptJobs: false,
    soundAlerts: true,
    vibrationAlerts: true,
    showDistance: true,
    showEstimatedEarnings: true,
  });

  const [availability, setAvailability] = useState({
    acceptDeliveries: true,
    acceptTasks: true,
    acceptSameDay: true,
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
        <Text className="text-2xl font-bold text-foreground">Tasker Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Job Availability */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Job Availability</Text>
          <View>
            <SettingRow
              icon="truck"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Accept Deliveries"
              subtitle="Receive delivery job offers"
              value={availability.acceptDeliveries}
              onValueChange={(v) => setAvailability(prev => ({ ...prev, acceptDeliveries: v }))}
            />
            <SettingRow
              icon="clipboard"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Accept Tasks"
              subtitle="Receive errand/task job offers"
              value={availability.acceptTasks}
              onValueChange={(v) => setAvailability(prev => ({ ...prev, acceptTasks: v }))}
            />
            <SettingRow
              icon="zap"
              iconColor="#EA580C"
              iconBg="#FFEDD5"
              title="Same-Day Deliveries"
              subtitle="Accept urgent same-day requests"
              value={availability.acceptSameDay}
              onValueChange={(v) => setAvailability(prev => ({ ...prev, acceptSameDay: v }))}
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Notifications</Text>
          <View>
            <SettingRow
              icon="bell"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="New Job Alerts"
              subtitle="Get notified when new jobs are available"
              value={notifications.newJobs}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, newJobs: v }))}
            />
            <SettingRow
              icon="clock"
              iconColor="#EA580C"
              iconBg="#FFEDD5"
              title="Job Reminders"
              subtitle="Reminders for scheduled jobs"
              value={notifications.jobReminders}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, jobReminders: v }))}
            />
            <SettingRow
              icon="dollar-sign"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Earnings Updates"
              subtitle="Get notified when you earn money"
              value={notifications.earningsUpdates}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, earningsUpdates: v }))}
            />
            <SettingRow
              icon="bar-chart-2"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Weekly Report"
              subtitle="Receive weekly performance summary"
              value={notifications.weeklyReport}
              onValueChange={(v) => setNotifications(prev => ({ ...prev, weeklyReport: v }))}
            />
          </View>
        </View>

        {/* Work Preferences */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Work Preferences</Text>
          <View>
            <SettingRow
              icon="check-circle"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Auto-Accept Jobs"
              subtitle="Automatically accept matching jobs"
              value={workPreferences.autoAcceptJobs}
              onValueChange={(v) => setWorkPreferences(prev => ({ ...prev, autoAcceptJobs: v }))}
            />
            <SettingRow
              icon="volume-2"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Sound Alerts"
              subtitle="Play sound for new job offers"
              value={workPreferences.soundAlerts}
              onValueChange={(v) => setWorkPreferences(prev => ({ ...prev, soundAlerts: v }))}
            />
            <SettingRow
              icon="smartphone"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Vibration Alerts"
              subtitle="Vibrate for new job offers"
              value={workPreferences.vibrationAlerts}
              onValueChange={(v) => setWorkPreferences(prev => ({ ...prev, vibrationAlerts: v }))}
            />
            <SettingRow
              icon="map"
              iconColor="#EA580C"
              iconBg="#FFEDD5"
              title="Show Distance"
              subtitle="Display distance to pickup/dropoff"
              value={workPreferences.showDistance}
              onValueChange={(v) => setWorkPreferences(prev => ({ ...prev, showDistance: v }))}
            />
            <SettingRow
              icon="trending-up"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Show Estimated Earnings"
              subtitle="Display potential earnings on job offers"
              value={workPreferences.showEstimatedEarnings}
              onValueChange={(v) => setWorkPreferences(prev => ({ ...prev, showEstimatedEarnings: v }))}
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

        {/* Tasker Account */}
        <View className="px-6 py-6 border-b border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Tasker Account</Text>
          <View>
            <NavigationRow
              icon="award"
              iconColor="#FCD34D"
              iconBg="#FEF3C7"
              title="Badge & Tier"
              subtitle="View your tasker badge and progress"
              onPress={() => router.push('/(tasker)/TaskerProfile')}
            />
            <NavigationRow
              icon="dollar-sign"
              iconColor="#16A34A"
              iconBg="#DCFCE7"
              title="Earnings & Float"
              subtitle="Manage your float balance"
              onPress={() => router.push('/(tasker)/BuyFloatScreen')}
            />
            <NavigationRow
              icon="clock"
              iconColor="#2563EB"
              iconBg="#DBEAFE"
              title="Delivery History"
              subtitle="View completed deliveries"
              onPress={() => router.push('/(tasker)/DeliveryHistory')}
            />
            <NavigationRow
              icon="alert-triangle"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              title="Violations & Appeals"
              subtitle="View strike policy status"
              onPress={() => router.push('/(tasker)/ThreeStrikePolicyScreen')}
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
              title="Tasker Help Center"
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
              title="Tasker Agreement"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

