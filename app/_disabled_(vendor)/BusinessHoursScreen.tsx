// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Switch, Pressable , ModalInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import * as Haptics from 'expo-haptics';
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BusinessHoursScreen() { const colors = useColors();
  const { hours,
    holidays,
    autoOffline,
    updateDayHours,
    addHoliday,
    deleteHoliday,
    setAutoOffline,
    loadBusinessHours,
    isCurrentlyOpen} = useBusinessHoursStore();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [tempHours, setTempHours] = useState<DayHours | null>(null);
  const [holidayModalVisible, setHolidayModalVisible] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  useEffect(() => { loadBusinessHours(); }, []);
  const currentlyOpen = isCurrentlyOpen();
  const handleToggleDay = async (day: number, isOpen: boolean) => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateDayHours(day, { isOpen }); };
  const handleEditHours = (dayHours: DayHours) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempHours(dayHours);
    setEditingDay(dayHours.day); };
  const handleSaveHours = async () =>  {
    if (tempHours) { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateDayHours(tempHours.day, { openTime: tempHours.openTime,
        closeTime: tempHours.closeTime});
      setEditingDay(null);
      setTempHours(null); } };
  const handleAddHoliday = async () =>  {
    if (!holidayName.trim() || !holidayDate.trim()) { return; }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Parse date (expecting YYYY-MM-DD format)
    const [year, month, day] = holidayDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

    await addHoliday({ name: holidayName,
      date,
      isRecurring: false});

    setHolidayModalVisible(false);
    setHolidayName('');
    setHolidayDate(''); };
  const handleDeleteHoliday = async (id: string) => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await deleteHoliday(id); };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          Business Hours
        </Text>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.foreground }]}>
              Currently
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: currentlyOpen
                    ? '#22C55E20'
                    : '#EF444420'},
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: currentlyOpen ? '#22C55E' : '#EF4444' },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: currentlyOpen ? '#22C55E' : '#EF4444' },
                ]}
              >
                {currentlyOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          <View style={styles.autoOfflineRow}>
            <View style={styles.autoOfflineInfo}>
              <Text style={[styles.autoOfflineLabel, { color: colors.foreground }]}>
                Auto Offline
              </Text>
              <Text style={[styles.autoOfflineDesc, { color: colors.muted }]}>
                Automatically go offline outside business hours
              </Text>
            </View>
            <Switch
              value={autoOffline}
              onValueChange={(value) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAutoOffline(value); }}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={autoOffline ? colors.primary : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Weekly Hours */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Weekly Schedule
        </Text>
        {hours.map((dayHours) => (
          <View
            key={dayHours.day}
            style={[styles.dayCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.dayRow}>
              <View style={styles.dayInfo}>
                <Text style={[styles.dayName, { color: colors.foreground }]}>
                  {DAYS[dayHours.day]}
                </Text>
                {dayHours.isOpen ? (
                  <Text style={[styles.dayTime, { color: colors.muted }]}>
                    {dayHours.openTime} - {dayHours.closeTime}
                  </Text>
                ) : (
                  <Text style={[styles.dayClosed, { color: '#EF4444' }]}>
                    Closed
                  </Text>
                )}
              </View>

              <View style={styles.dayActions}>
                {dayHours.isOpen && (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleEditHours(dayHours)}
                    style={[styles.editButton, { backgroundColor: colors.background }]}
                  >
                    <Text style={styles.editIcon}>✏️</Text>
                  </Pressable>
                )}
                <Switch
                  value={dayHours.isOpen}
                  onValueChange={(value) => handleToggleDay(dayHours.day, value)}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={dayHours.isOpen ? colors.primary : '#F3F4F6'}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Holidays */}
        <View style={styles.holidaysSection}>
          <View style={styles.holidaysHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Holidays
            </Text>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHolidayModalVisible(true); }}
              style={[styles.addHolidayButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.addHolidayText}>+ Add</Text>
            </Pressable>
          </View>

          {holidays.length === 0 ? (
            <View style={[styles.emptyHolidays, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                No holidays added
              </Text>
            </View>
          ) : (
            holidays.map((holiday) => (
              <View
                key={holiday.id}
                style={[styles.holidayCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.holidayInfo}>
                  <Text style={[styles.holidayName, { color: colors.foreground }]}>
                    {holiday.name}
                  </Text>
                  <Text style={[styles.holidayDate, { color: colors.muted }]}>
                    {new Date(holiday.date).toLocaleDateString('en-US', { month: 'long',
                      day: 'numeric',
                      year: 'numeric'})}
                  </Text>
                </View>
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDeleteHoliday(holiday.id)}
                  style={[styles.deleteButton, { backgroundColor: colors.background }]}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Hours Modal */}
      {tempHours && (
        <Modal
          visible={editingDay !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setEditingDay(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.background }]}
            >
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Edit {DAYS[tempHours.day]} Hours
              </Text>

              <View style={styles.timeInputs}>
                <View style={styles.timeInputGroup}>
                  <Text style={[styles.timeLabel, { color: colors.muted }]}>
                    Open Time
                  </Text>
                  <TextInput
                    value={tempHours.openTime}
                    onChangeText={(text) =>
                      setTempHours({ ...tempHours, openTime: text }) }
                    placeholder="08:00"
                    style={[
                      styles.timeInput,
                      { backgroundColor: colors.surface,
                        color: colors.foreground,
                        borderColor: colors.border},
                    ]}
                    placeholderTextColor={colors.muted}
                  />
                </View>

                <View style={styles.timeInputGroup}>
                  <Text style={[styles.timeLabel, { color: colors.muted }]}>
                    Close Time
                  </Text>
                  <TextInput
                    value={tempHours.closeTime}
                    onChangeText={(text) =>
                      setTempHours({ ...tempHours, closeTime: text }) }
                    placeholder="20:00"
                    style={[
                      styles.timeInput,
                      { backgroundColor: colors.surface,
                        color: colors.foreground,
                        borderColor: colors.border},
                    ]}
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setEditingDay(null)}
                  style={[styles.modalButton, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.modalButtonText, { color: colors.foreground }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSaveHours}
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add Holiday Modal */}
      <Modal
        visible={holidayModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHolidayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Add Holiday
            </Text>

            <Text style={[styles.inputLabel, { color: colors.muted }]}>
              Holiday Name
            </Text>
            <TextInput
              value={holidayName}
              onChangeText={setHolidayName}
              placeholder="e.g., Christmas"
              style={[
                styles.input,
                { backgroundColor: colors.surface,
                  color: colors.foreground,
                  borderColor: colors.border},
              ]}
              placeholderTextColor={colors.muted}
            />

            <Text style={[styles.inputLabel, { color: colors.muted }]}>
              Date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={holidayDate}
              onChangeText={setHolidayDate}
              placeholder="2025-12-25"
              style={[
                styles.input,
                { backgroundColor: colors.surface,
                  color: colors.foreground,
                  borderColor: colors.border},
              ]}
              placeholderTextColor={colors.muted}
            />

            <View style={styles.modalButtons}>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setHolidayModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.foreground }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleAddHoliday}
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Add
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }
  const styles = StyleSheet.create({ title: { fontSize: 24,
    fontWeight: '700',
    marginBottom: 16},
  statusCard: { padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 16},
  statusRow: { flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  statusLabel: { fontSize: 15,
    fontWeight: '500'},
  statusBadge: { flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6},
  statusDot: { width: 8,
    height: 8,
    borderRadius: 4},
  statusText: { fontSize: 14,
    fontWeight: '600'},
  autoOfflineRow: { flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  autoOfflineInfo: { flex: 1,
    marginRight: 12},
  autoOfflineLabel: { fontSize: 15,
    fontWeight: '500',
    marginBottom: 2},
  autoOfflineDesc: { fontSize: 12,
    lineHeight: 16},
  sectionTitle: { fontSize: 16,
    fontWeight: '600',
    marginBottom: 12},
  dayCard: { padding: 14,
    borderRadius: 10,
    marginBottom: 8},
  dayRow: { flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  dayInfo: { flex: 1},
  dayName: { fontSize: 15,
    fontWeight: '500',
    marginBottom: 2},
  dayTime: { fontSize: 13},
  dayClosed: { fontSize: 13,
    fontWeight: '500'},
  dayActions: { flexDirection: 'row',
    alignItems: 'center',
    gap: 8},
  editButton: { width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'},
  editIcon: { fontSize: 14},
  holidaysSection: { marginTop: 20},
  holidaysHeader: { flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12},
  addHolidayButton: { paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16},
  addHolidayText: { color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'},
  emptyHolidays: { padding: 24,
    borderRadius: 10,
    alignItems: 'center'},
  emptyText: { fontSize: 14},
  holidayCard: { flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8},
  holidayInfo: { flex: 1},
  holidayName: { fontSize: 15,
    fontWeight: '500',
    marginBottom: 2},
  holidayDate: { fontSize: 13},
  deleteButton: { width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'},
  deleteIcon: { fontSize: 14},
  modalOverlay: { flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'},
  modalContent: { borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20},
  modalTitle: { fontSize: 20,
    fontWeight: '700',
    marginBottom: 20},
  timeInputs: { flexDirection: 'row',
    gap: 12,
    marginBottom: 12},
  timeInputGroup: { flex: 1},
  timeLabel: { fontSize: 13,
    marginBottom: 6},
  timeInput: { padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15},
  inputLabel: { fontSize: 13,
    marginBottom: 6,
    marginTop: 8},
  input: { padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12},
  modalButtons: { flexDirection: 'row',
    gap: 12,
    marginTop: 20},
  modalButton: { flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'},
  modalButtonText: { fontSize: 16,
    fontWeight: '600'}});

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

