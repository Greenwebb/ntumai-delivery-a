// @ts-nocheck
import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Text } from './text';
import { Modal } from './modal';
import { PrimaryButton, SecondaryButton } from './button';
import { useColors } from '@/hooks/use-colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
}

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (startDate: Date, endDate: Date) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
}

/**
 * DatePicker - Single date selection
 */
export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  error,
}: DatePickerProps) {
  const colors = useColors();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    onChange(selectedDate);
    setShowModal(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View>
      {label && (
        <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      )}
      
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        onPress={handlePress}
        disabled={disabled}
        className={`flex-row items-center justify-between h-12 px-4 rounded-lg border ${
          error ? 'border-error bg-error/5' : 'border-border bg-surface'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <Text className={value ? 'text-foreground' : 'text-muted'}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Feather
          name="calendar"
          size={20}
          color={error ? colors.error : colors.muted}
        />
      </Pressable>

      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Select Date"
      >
        <View className="gap-4">
          <SimpleDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={minDate}
            maxDate={maxDate}
          />
          
          <View className="flex-row gap-3">
            <View className="flex-1">
              <SecondaryButton onPress={() => setShowModal(false)}>
                Cancel
              </SecondaryButton>
            </View>
            <View className="flex-1">
              <PrimaryButton onPress={handleConfirm}>
                Confirm
              </PrimaryButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/**
 * DateRangePicker - Date range selection
 */
export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  label,
  placeholder = 'Select date range',
  minDate,
  maxDate,
  disabled = false,
  error,
}: DateRangePickerProps) {
  const colors = useColors();
  const [showModal, setShowModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate || new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(endDate || new Date());

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    onChange(tempStartDate, tempEndDate);
    setShowModal(false);
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
    const endStr = end.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <View>
      {label && (
        <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>
      )}
      
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        onPress={handlePress}
        disabled={disabled}
        className={`flex-row items-center justify-between h-12 px-4 rounded-lg border ${
          error ? 'border-error bg-error/5' : 'border-border bg-surface'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <Text className={startDate && endDate ? 'text-foreground' : 'text-muted'}>
          {startDate && endDate ? formatDateRange(startDate, endDate) : placeholder}
        </Text>
        <Feather
          name="calendar"
          size={20}
          color={error ? colors.error : colors.muted}
        />
      </Pressable>

      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Select Date Range"
      >
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Start Date</Text>
            <SimpleDatePicker
              value={tempStartDate}
              onChange={setTempStartDate}
              minDate={minDate}
              maxDate={tempEndDate}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">End Date</Text>
            <SimpleDatePicker
              value={tempEndDate}
              onChange={setTempEndDate}
              minDate={tempStartDate}
              maxDate={maxDate}
            />
          </View>
          
          <View className="flex-row gap-3">
            <View className="flex-1">
              <SecondaryButton onPress={() => setShowModal(false)}>
                Cancel
              </SecondaryButton>
            </View>
            <View className="flex-1">
              <PrimaryButton onPress={handleConfirm}>
                Confirm
              </PrimaryButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/**
 * SimpleDatePicker - Internal calendar component
 */
function SimpleDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
}: {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) {
  const colors = useColors();
  const [currentMonth, setCurrentMonth] = useState(value.getMonth());
  const [currentYear, setCurrentYear] = useState(value.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayPress = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(newDate);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (day: number) => {
    return (
      value.getDate() === day &&
      value.getMonth() === currentMonth &&
      value.getFullYear() === currentYear
    );
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isDateSelected(day);
      
      days.push(
        <Pressable
          key={day}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={() => handleDayPress(day)}
          disabled={disabled}
          className={`w-10 h-10 items-center justify-center rounded-lg ${
            selected ? 'bg-primary' : ''
          } ${disabled ? 'opacity-30' : ''}`}
        >
          <Text
            className={`text-sm ${
              selected ? 'text-white font-bold' : 'text-foreground'
            }`}
          >
            {day}
          </Text>
        </Pressable>
      );
    }
    
    return days;
  };

  return (
    <View className="bg-surface rounded-lg p-4">
      {/* Month/Year Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={handlePrevMonth}
          className="w-8 h-8 items-center justify-center"
        >
          <Feather name="chevron-left" size={20} color={colors.foreground} />
        </Pressable>
        
        <Text className="text-base font-bold text-foreground">
          {monthNames[currentMonth]} {currentYear}
        </Text>
        
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={handleNextMonth}
          className="w-8 h-8 items-center justify-center"
        >
          <Feather name="chevron-right" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Day Names */}
      <View className="flex-row mb-2">
        {dayNames.map((day) => (
          <View key={day} className="w-10 items-center">
            <Text className="text-xs font-medium text-muted">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="flex-row flex-wrap">
        {renderCalendarDays()}
      </View>
    </View>
  );
}
