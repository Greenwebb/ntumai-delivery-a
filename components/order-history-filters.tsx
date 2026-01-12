import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

export interface OrderFilters {
  status: 'all' | 'pending' | 'completed' | 'cancelled';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  vendor: string;
  priceRange: {
    min: number;
    max: number;
  };
  searchQuery: string;
}

interface OrderHistoryFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

const DATE_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 3 Months', days: 90 },
];

export function OrderHistoryFilters({
  filters,
  onFiltersChange,
  onReset,
}: OrderHistoryFiltersProps) {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState<OrderFilters>(filters);

  const activeFilterCount = [
    filters.status !== 'all',
    filters.dateRange.start !== null,
    filters.vendor !== '',
    filters.priceRange.min > 0 || filters.priceRange.max < 10000,
  ].filter(Boolean).length;

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFiltersChange(tempFilters);
    setModalVisible(false);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const resetFilters: OrderFilters = {
      status: 'all',
      dateRange: { start: null, end: null },
      vendor: '',
      priceRange: { min: 0, max: 10000 },
      searchQuery: '',
    };
    setTempFilters(resetFilters);
    onReset();
    setModalVisible(false);
  };

  const handleDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setTempFilters({
      ...tempFilters,
      dateRange: { start, end },
    });
  };

  return (
    <>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={filters.searchQuery}
          onChangeText={(text) =>
            onFiltersChange({ ...filters, searchQuery: text })
          }
          placeholder="Search orders..."
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholderTextColor={colors.muted}
        />
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTempFilters(filters);
          setModalVisible(true);
        }}
        style={[styles.filterButton, { backgroundColor: colors.surface }]}
      >
        <Text style={styles.filterIcon}>⚙️</Text>
        <Text style={[styles.filterText, { color: colors.foreground }]}>
          Filters
        </Text>
        {activeFilterCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.background }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Filter Orders
              </Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={[styles.resetButton, { color: colors.primary }]}>
                  Reset All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Status Filter */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Order Status
                </Text>
                <View style={styles.statusOptions}>
                  {STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTempFilters({ ...tempFilters, status: option.value });
                      }}
                      style={[
                        styles.statusOption,
                        { borderColor: colors.border },
                        tempFilters.status === option.value && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          { color: colors.foreground },
                          tempFilters.status === option.value && {
                            color: colors.primary,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Range */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Date Range
                </Text>
                <View style={styles.datePresets}>
                  {DATE_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleDatePreset(preset.days);
                      }}
                      style={[
                        styles.presetButton,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text
                        style={[styles.presetText, { color: colors.foreground }]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Vendor Filter */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Vendor
                </Text>
                <TextInput
                  value={tempFilters.vendor}
                  onChangeText={(text) =>
                    setTempFilters({ ...tempFilters, vendor: text })
                  }
                  placeholder="Enter vendor name..."
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      color: colors.foreground,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholderTextColor={colors.muted}
                />
              </View>

              {/* Price Range */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Price Range (K)
                </Text>
                <View style={styles.priceInputs}>
                  <View style={styles.priceInputGroup}>
                    <Text style={[styles.priceLabel, { color: colors.muted }]}>
                      Min
                    </Text>
                    <TextInput
                      value={String(tempFilters.priceRange.min)}
                      onChangeText={(text) =>
                        setTempFilters({
                          ...tempFilters,
                          priceRange: {
                            ...tempFilters.priceRange,
                            min: Number(text) || 0,
                          },
                        })
                      }
                      keyboardType="numeric"
                      placeholder="0"
                      style={[
                        styles.priceInput,
                        {
                          backgroundColor: colors.surface,
                          color: colors.foreground,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                  <Text style={[styles.priceSeparator, { color: colors.muted }]}>
                    —
                  </Text>
                  <View style={styles.priceInputGroup}>
                    <Text style={[styles.priceLabel, { color: colors.muted }]}>
                      Max
                    </Text>
                    <TextInput
                      value={String(tempFilters.priceRange.max)}
                      onChangeText={(text) =>
                        setTempFilters({
                          ...tempFilters,
                          priceRange: {
                            ...tempFilters.priceRange,
                            max: Number(text) || 10000,
                          },
                        })
                      }
                      keyboardType="numeric"
                      placeholder="10000"
                      style={[
                        styles.priceInput,
                        {
                          backgroundColor: colors.surface,
                          color: colors.foreground,
                          borderColor: colors.border,
                        },
                      ]}
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={handleApply}
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '500',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  resetButton: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  statusOptionText: {
    fontSize: 14,
  },
  datePresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  presetText: {
    fontSize: 13,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputGroup: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  priceInput: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  priceSeparator: {
    fontSize: 18,
    marginTop: 20,
  },
  applyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
