/**
 * DeliveryTimeSlotPicker - Time slot selection for delivery scheduling
 * Allows customers to choose preferred delivery windows
 */
import React, { useState } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  available: boolean;
  price?: number; // Additional fee for express slots
}

interface DeliveryTimeSlotPickerProps {
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  className?: string;
}

// Generate time slots for today and tomorrow
const generateTimeSlots = (): { today: TimeSlot[]; tomorrow: TimeSlot[] } => {
  const now = new Date();
  const currentHour = now.getHours();

  const allSlots: TimeSlot[] = [
    { id: 'morning-1', label: '8:00 - 10:00 AM', startTime: '08:00', endTime: '10:00', available: true },
    { id: 'morning-2', label: '10:00 AM - 12:00 PM', startTime: '10:00', endTime: '12:00', available: true },
    { id: 'afternoon-1', label: '12:00 - 2:00 PM', startTime: '12:00', endTime: '14:00', available: true },
    { id: 'afternoon-2', label: '2:00 - 4:00 PM', startTime: '14:00', endTime: '16:00', available: true },
    { id: 'evening-1', label: '4:00 - 6:00 PM', startTime: '16:00', endTime: '18:00', available: true },
    { id: 'evening-2', label: '6:00 - 8:00 PM', startTime: '18:00', endTime: '20:00', available: true },
    { id: 'express', label: 'Express (30 mins)', startTime: 'express', endTime: 'express', available: true, price: 20 },
  ];

  // Filter today's slots (only future slots)
  const todaySlots = allSlots.map(slot => {
    if (slot.id === 'express') {
      return { ...slot, available: currentHour < 19 }; // Express available until 7 PM
    }
    const slotHour = parseInt(slot.startTime.split(':')[0]);
    return {
      ...slot,
      available: slotHour > currentHour + 1, // Need at least 1 hour lead time
    };
  });

  // All slots available tomorrow
  const tomorrowSlots = allSlots.map(slot => ({ ...slot, available: true }));

  return { today: todaySlots, tomorrow: tomorrowSlots };
};

export function DeliveryTimeSlotPicker({
  selectedSlot,
  onSelectSlot,
  className,
}: DeliveryTimeSlotPickerProps) {
  const colors = useColors();
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const { today, tomorrow } = generateTimeSlots();

  const slots = selectedDay === 'today' ? today : tomorrow;

  const handleSelectSlot = (slot: TimeSlot) => {
    if (!slot.available) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectSlot(slot);
  };

  return (
    <View className={cn('', className)}>
      {/* Day Selector */}
      <View className="flex-row gap-3 mb-4">
        <Pressable
          onPress={() => setSelectedDay('today')}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, flex: 1 })}
        >
          <View
            className="py-3 rounded-xl items-center"
            style={{
              backgroundColor: selectedDay === 'today' ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: selectedDay === 'today' ? colors.primary : colors.border,
            }}
          >
            <Text
              className="font-semibold"
              style={{ color: selectedDay === 'today' ? '#FFFFFF' : colors.foreground }}
            >
              Today
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setSelectedDay('tomorrow')}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, flex: 1 })}
        >
          <View
            className="py-3 rounded-xl items-center"
            style={{
              backgroundColor: selectedDay === 'tomorrow' ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: selectedDay === 'tomorrow' ? colors.primary : colors.border,
            }}
          >
            <Text
              className="font-semibold"
              style={{ color: selectedDay === 'tomorrow' ? '#FFFFFF' : colors.foreground }}
            >
              Tomorrow
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Time Slots */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {slots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id;
          const isExpress = slot.id === 'express';

          return (
            <Pressable
              key={slot.id}
              onPress={() => handleSelectSlot(slot)}
              disabled={!slot.available}
              style={({ pressed }) => ({
                opacity: !slot.available ? 0.4 : pressed ? 0.7 : 1,
              })}
            >
              <View
                className="px-4 py-3 rounded-xl min-w-[140px]"
                style={{
                  backgroundColor: isSelected
                    ? colors.primary
                    : slot.available
                    ? colors.surface
                    : colors.border,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isSelected ? '#FFFFFF' : colors.foreground }}
                  >
                    {slot.label}
                  </Text>
                  {isSelected && <Feather name="check-circle" size={16} color="#FFFFFF" />}
                </View>

                {isExpress && (
                  <View className="flex-row items-center gap-1 mt-1">
                    <Feather
                      name="zap"
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.warning}
                    />
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: isSelected ? '#FFFFFF' : colors.warning }}
                    >
                      +K{slot.price}
                    </Text>
                  </View>
                )}

                {!slot.available && (
                  <Text className="text-xs text-muted mt-1">Unavailable</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Info */}
      {selectedSlot && (
        <View className="mt-4 bg-primary/10 rounded-lg p-3">
          <View className="flex-row items-center gap-2">
            <Feather name="clock" size={16} color={colors.primary} />
            <Text className="text-sm text-foreground flex-1">
              {selectedSlot.id === 'express'
                ? 'Your order will arrive in approximately 30 minutes'
                : `Delivery scheduled for ${selectedDay === 'today' ? 'today' : 'tomorrow'} ${selectedSlot.label}`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
