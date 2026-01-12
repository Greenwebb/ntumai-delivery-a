// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Platform, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useScheduledOrdersStore } from '@/stores/scheduled-orders-store';
import { useToast } from '@/lib/toast-provider';
  const TIME_SLOTS = [
  { id: '1', time: '08:00 - 10:00', label: 'Morning' },
  { id: '2', time: '10:00 - 12:00', label: 'Late Morning' },
  { id: '3', time: '12:00 - 14:00', label: 'Lunch Time' },
  { id: '4', time: '14:00 - 16:00', label: 'Afternoon' },
  { id: '5', time: '16:00 - 18:00', label: 'Evening' },
  { id: '6', time: '18:00 - 20:00', label: 'Night' },
];
  const RECURRING_OPTIONS = [
  { id: 'none', label: 'One Time', icon: 'calendar' },
  { id: 'daily', label: 'Daily', icon: 'repeat' },
  { id: 'weekly', label: 'Weekly', icon: 'refresh-cw' },
  { id: 'monthly', label: 'Monthly', icon: 'calendar' },
];

export default function ScheduleDeliveryScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const params = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { scheduleOrder } = useScheduledOrdersStore();

  // Generate calendar days
  const calendarDays = useMemo(() => { const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) { days.push(null); }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) { days.push(new Date(year, month, day)); }
    
    return days; }, [currentMonth]);
  const handlePreviousMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)); };
  const handleNextMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); };
  const handleDateSelect = (date: Date) => { const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) { toast.error('Please select a future date');
      return; }

    setSelectedDate(date);
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } };
  const handleSchedule = async () =>  {
    if (!selectedDate || !selectedTimeSlot) { toast.error('Please select both date and time slot');
      return; }
  const timeSlot = TIME_SLOTS.find(t => t.id === selectedTimeSlot);
    if (!timeSlot) return;

    try { await scheduleOrder({ orderId: params.orderId as string || `ORD-${Date.now()}`,
        orderType: (params.orderType as any) || 'delivery',
        items: [],
        totalAmount: parseFloat(params.amount as string) || 0,
        scheduledDate: selectedDate,
        timeSlot: timeSlot.time,
        recurring,
        deliveryAddress: params.address as string || ''});

      if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }

      toast.info(
        'Order Scheduled',
        `Your order has been scheduled for ${selectedDate.toLocaleDateString('en-GB')} at ${timeSlot.time}`,
        [
          { text: 'OK',
            onPress: () => router.back()},
        ]
      ); } catch (error) { toast.error('Failed to schedule order. Please try again.'); } };
  const isDateSelected = (date: Date | null) =>  {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString(); };
  const isToday = (date: Date | null) =>  {
    if (!date) return false;
  const today = new Date();
    return date.toDateString() === today.toDateString(); };
  const isPastDate = (date: Date | null) =>  {
    if (!date) return false;
  const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today; };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Schedule Delivery</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handlePreviousMonth} className="p-2">
              <Feather name="chevron-left" size={24} color="#009688" />
            </Pressable>
            <Text className="text-lg font-semibold text-foreground">
              {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </Text>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleNextMonth} className="p-2">
              <Feather name="chevron-right" size={24} color="#009688" />
            </Pressable>
          </View>

          {/* Day Headers */}
          <View className="flex-row mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-xs font-medium text-muted">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap">
            {calendarDays.map((date, index) => (
              <View key={index} className="w-[14.28%] aspect-square p-1">
                {date ? (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDateSelect(date)}
                    disabled={isPastDate(date)}
                    className={`flex-1 items-center justify-center rounded-xl ${ isDateSelected(date)
                        ? 'bg-primary'
                        : isToday(date)
                        ? 'bg-primary/10 border border-primary'
                        : isPastDate(date)
                        ? 'bg-muted/5'
                        : 'bg-surface' }`}
                  >
                    <Text
                      className={`text-sm font-medium ${ isDateSelected(date)
                          ? 'text-white'
                          : isPastDate(date)
                          ? 'text-muted/40'
                          : isToday(date)
                          ? 'text-primary'
                          : 'text-foreground' }`}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                ) : (
                  <View className="flex-1" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Time Slots */}
        {selectedDate && (
          <View className="mt-6">
            <Text className="text-base font-semibold text-foreground mb-3">Select Time Slot</Text>
            <View className="flex-row flex-wrap gap-2">
              {TIME_SLOTS.map(slot => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={slot.id}
                  onPress={() => { setSelectedTimeSlot(slot.id);
                    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
                  className={`flex-1 min-w-[45%] p-4 rounded-xl border ${ selectedTimeSlot === slot.id
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border' }`}
                >
                  <Text
                    className={`text-sm font-medium ${ selectedTimeSlot === slot.id ? 'text-white' : 'text-foreground' }`}
                  >
                    {slot.label}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${ selectedTimeSlot === slot.id ? 'text-white/80' : 'text-muted' }`}
                  >
                    {slot.time}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Recurring Options */}
        {selectedDate && selectedTimeSlot && (
          <View className="mt-6 mb-6">
            <Text className="text-base font-semibold text-foreground mb-3">Repeat Order</Text>
            <View className="flex-row flex-wrap gap-2">
              {RECURRING_OPTIONS.map(option => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={option.id}
                  onPress={() => { setRecurring(option.id as any);
                    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
                  className={`flex-1 min-w-[45%] p-4 rounded-xl border flex-row items-center ${ recurring === option.id
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border' }`}
                >
                  <Feather
                    name={option.icon as any}
                    size={20}
                    color={recurring === option.id ? '#FFFFFF' : '#009688'}
                  />
                  <Text
                    className={`text-sm font-medium ml-2 ${ recurring === option.id ? 'text-white' : 'text-foreground' }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Summary */}
        {selectedDate && selectedTimeSlot && (
          <View className="bg-primary/5 rounded-xl p-4 mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Order Summary</Text>
            <View className="flex-row items-center mb-1">
              <Feather name="calendar" size={16} color="#6B7280" />
              <Text className="text-sm text-muted ml-2">
                {selectedDate.toLocaleDateString('en-GB', { weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'})}
              </Text>
            </View>
            <View className="flex-row items-center mb-1">
              <Feather name="clock" size={16} color="#6B7280" />
              <Text className="text-sm text-muted ml-2">
                {TIME_SLOTS.find(t => t.id === selectedTimeSlot)?.time}
              </Text>
            </View>
            {recurring !== 'none' && (
              <View className="flex-row items-center">
                <Feather name="repeat" size={16} color="#6B7280" />
                <Text className="text-sm text-muted ml-2">
                  Repeats {recurring}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Schedule Button */}
      {selectedDate && selectedTimeSlot && (
        <View className="px-4 pb-4 border-t border-border bg-background">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSchedule}
            className="bg-primary py-4 rounded-xl mt-4"
          >
            <Text className="text-center text-white font-semibold text-base">
              Schedule Order
            </Text>
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

