// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, ModalInput, Platform, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Button, PrimaryButton, SecondaryButton, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricCard, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { useShiftSchedulingStore, Shift } from '@/stores/shift-scheduling-store';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Trash2, DollarSign } from 'lucide-react-native';
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ShiftSchedulingScreen() { const colors = useColors();
  const { shifts,
    templates,
    addShift,
    deleteShift,
    loadShifts,
    calculateWeeklyEarnings,
    createShiftFromTemplate} = useShiftSchedulingStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [newShiftData, setNewShiftData] = useState({ startTime: '09:00',
    endTime: '17:00',
    estimatedEarnings: 200});

  useEffect(() => { loadShifts(); }, []);
  const weeklyEarnings = calculateWeeklyEarnings();
  const handleHaptic = (style = Haptics.ImpactFeedbackStyle.Light) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(style); } };
  const getWeekDates = () => { const dates: Date[] = [];
  const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) { const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date); }

    return dates; };
  const weekDates = getWeekDates();
  const getShiftsForDate = (date: Date) => { const dateStr = date.toDateString();
    return shifts.filter(
      (shift) => new Date(shift.date).toDateString() === dateStr
    ); };
  const handleAddShift = async () => { handleHaptic(Haptics.ImpactFeedbackStyle.Medium);
    
    await addShift({ date: selectedDate,
      startTime: newShiftData.startTime,
      endTime: newShiftData.endTime,
      isRecurring: false,
      estimatedEarnings: newShiftData.estimatedEarnings,
      status: 'scheduled'});

    setModalVisible(false);
    setNewShiftData({ startTime: '09:00',
      endTime: '17:00',
      estimatedEarnings: 200}); };
  const handleDeleteShift = async (id: string) => { handleHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    await deleteShift(id); };
  const handleUseTemplate = async (templateId: string) => { handleHaptic(Haptics.ImpactFeedbackStyle.Medium);
    await createShiftFromTemplate(templateId, selectedDate);
    setModalVisible(false); };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView 
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center">
          <Text variant="h2" weight="bold" className="text-foreground">
            Shift Schedule
          </Text>
          <Button
            title="+ Add Shift"
            onPress={() => { handleHaptic();
              setModalVisible(true); }}
            size="sm"
          />
        </View>

        {/* Weekly Earnings */}
        <Card variant="flat" padding="md">
          <Text variant="caption" className="text-muted mb-1">
            This Week's Projected Earnings
          </Text>
          <Text variant="h2" weight="bold" className="text-primary">
            K{weeklyEarnings.toFixed(2)}
          </Text>
        </Card>

        {/* Calendar */}
        <Card variant="flat" padding="sm">
          <View className="flex-row">
            {weekDates.map((date, index) => { const isSelected = date.toDateString() === selectedDate.toDateString();
  const dayShifts = getShiftsForDate(date);
  const isToday = date.toDateString() === new Date().toDateString();

              return (
                <Button
                  key={index}
                  onPress={() => { handleHaptic();
                    setSelectedDate(date); }}
                  variant={isSelected ? 'primary' : 'ghost'}
                  className={cn(
                    'flex-1 flex-col items-center py-3 rounded-xl',
                    isSelected && 'bg-primary/20'
                  )}
                >
                  <Text 
                    variant="caption" 
                    className={cn(
                      'text-muted',
                      isSelected && 'text-primary font-semibold'
                    )}
                  >
                    {DAYS[date.getDay()]}
                  </Text>
                  <Text 
                    variant="body" 
                    weight={isToday ? 'bold' : 'regular'}
                    className={cn(
                      'text-foreground',
                      isToday && 'text-primary'
                    )}
                  >
                    {date.getDate()}
                  </Text>
                  {dayShifts.length > 0 && (
                    <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                  )}
                </Button>
              ); })}
          </View>
        </Card>

        {/* Shifts for Selected Date */}
        <View className="gap-3">
          <Text variant="body" weight="semibold" className="text-foreground">
            Shifts for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>

          {getShiftsForDate(selectedDate).length === 0 ? (
            <Card variant="flat" padding="lg" className="items-center">
              <Text variant="body" className="text-muted">
                No shifts scheduled for this day
              </Text>
            </Card>
          ) : (
            getShiftsForDate(selectedDate).map((shift) => (
              <Card key={shift.id} variant="flat" padding="md">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                      <Clock size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text variant="body" weight="semibold" className="text-foreground">
                        {shift.startTime} - {shift.endTime}
                      </Text>
                      <Text variant="caption" className="text-muted">
                        Est. K{shift.estimatedEarnings}
                      </Text>
                    </View>
                  </View>
                  <IconButton
                    icon={<Trash2 size={18} color={colors.error} />}
                    onPress={() => handleDeleteShift(shift.id)}
                    variant="ghost"
                    size="sm"
                  />
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Templates */}
        {templates.length > 0 && (
          <View className="gap-3">
            <Text variant="body" weight="semibold" className="text-foreground">
              Quick Templates
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  title={template.name}
                  onPress={() => handleUseTemplate(template.id)}
                  variant="outline"
                  size="sm"
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Shift Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-5">
            <Text variant="h3" weight="bold" className="text-foreground mb-2">
              Add New Shift
            </Text>
            <Text variant="body" className="text-muted mb-5">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>

            {/* Start Time */}
            <Text variant="caption" weight="semibold" className="text-muted mb-2">
              Start Time
            </Text>
            <TextInput
              value={newShiftData.startTime}
              onChangeText={(text) => setNewShiftData({ ...newShiftData, startTime: text })}
              placeholder="09:00"
              className="bg-surface text-foreground border border-border rounded-xl p-3 mb-4"
              placeholderTextColor={colors.muted}
            />

            {/* End Time */}
            <Text variant="caption" weight="semibold" className="text-muted mb-2">
              End Time
            </Text>
            <TextInput
              value={newShiftData.endTime}
              onChangeText={(text) => setNewShiftData({ ...newShiftData, endTime: text })}
              placeholder="17:00"
              className="bg-surface text-foreground border border-border rounded-xl p-3 mb-4"
              placeholderTextColor={colors.muted}
            />

            {/* Estimated Earnings */}
            <Text variant="caption" weight="semibold" className="text-muted mb-2">
              Estimated Earnings (K)
            </Text>
            <TextInput
              value={newShiftData.estimatedEarnings.toString()}
              onChangeText={(text) => setNewShiftData({ ...newShiftData, estimatedEarnings: Number(text) || 0 })}
              keyboardType="numeric"
              placeholder="200"
              className="bg-surface text-foreground border border-border rounded-xl p-3 mb-6"
              placeholderTextColor={colors.muted}
            />

            <View className="flex-row gap-3">
              <SecondaryButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                className="flex-1"
              />
              <PrimaryButton
                title="Add Shift"
                onPress={handleAddShift}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

