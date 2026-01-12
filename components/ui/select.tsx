// @ts-nocheck
import React, { useState } from 'react';
import { View, Pressable, ScrollView, Modal as RNModal, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from './text';
import { SearchInput } from './input';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string | string[];
  options: SelectOption[];
  onChange: (value: string | string[]) => void;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  error,
  disabled = false,
  searchable = false,
  multiple = false,
  className,
}: SelectProps) {
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedValues = multiple
    ? (Array.isArray(value) ? value : [])
    : (value ? [value as string] : []);

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleOpen = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    
    if (multiple) {
      if (selectedValues.length === 1) {
        return options.find(opt => opt.value === selectedValues[0])?.label || placeholder;
      }
      return `${selectedValues.length} selected`;
    }
    
    return options.find(opt => opt.value === selectedValues[0])?.label || placeholder;
  };

  return (
    <View className={cn('w-full', className)}>
      {label && (
        <Text variant="bodySmall" weight="medium" className="mb-2 text-foreground">
          {label}
        </Text>
      )}

      {/* Select Trigger */}
      <Pressable
        onPress={handleOpen}
        disabled={disabled}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
        className={cn(
          'flex-row items-center justify-between',
          'bg-surface border rounded-xl px-4 py-3',
          error ? 'border-error' : 'border-border',
          disabled && 'opacity-50'
        )}
      >
        <Text
          variant="body"
          className={cn(
            selectedValues.length === 0 ? 'text-muted' : 'text-foreground'
          )}
        >
          {getDisplayText()}
        </Text>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.muted}
        />
      </Pressable>

      {error && (
        <Text variant="bodySmall" className="mt-1 text-error">
          {error}
        </Text>
      )}

      {/* Select Modal */}
      <RNModal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl max-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <Text variant="h4" weight="bold">
                {label || 'Select'}
              </Text>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Feather name="x" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Search */}
            {searchable && (
              <View className="px-4 pt-4">
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search..."
                />
              </View>
            )}

            {/* Options List */}
            <ScrollView className="px-4 py-2" showsVerticalScrollIndicator={false}>
              {filteredOptions.length === 0 ? (
                <View className="py-8 items-center">
                  <Text variant="body" color="muted">
                    No options found
                  </Text>
                </View>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                      })}
                      className={cn(
                        'flex-row items-center py-3 px-4 rounded-xl mb-2',
                        isSelected ? 'bg-primary/10 border border-primary' : 'bg-surface',
                        option.disabled && 'opacity-50'
                      )}
                    >
                      {option.icon && (
                        <Feather
                          name={option.icon as any}
                          size={20}
                          color={isSelected ? colors.primary : colors.foreground}
                          style={{ marginRight: 12 }}
                        />
                      )}
                      
                      <Text
                        variant="body"
                        weight={isSelected ? 'medium' : 'regular'}
                        className={cn(
                          'flex-1',
                          isSelected ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {option.label}
                      </Text>

                      {multiple && isSelected && (
                        <Feather name="check" size={20} color={colors.primary} />
                      )}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {/* Done Button (for multiple select) */}
            {multiple && (
              <View className="p-4 border-t border-border">
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.9 : 1,
                  })}
                  className="bg-primary py-4 rounded-xl items-center"
                >
                  <Text variant="body" weight="bold" className="text-white">
                    Done ({selectedValues.length})
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </RNModal>
    </View>
  );
}

// Convenience exports
export function SearchableSelect(props: Omit<SelectProps, 'searchable'>) {
  return <Select {...props} searchable />;
}

export function MultiSelect(props: Omit<SelectProps, 'multiple'>) {
  return <Select {...props} multiple />;
}

export function SearchableMultiSelect(props: Omit<SelectProps, 'searchable' | 'multiple'>) {
  return <Select {...props} searchable multiple />;
}
