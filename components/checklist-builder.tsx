// @ts-nocheck
import React, { useState } from 'react';
import { View, TextInput, Pressable, FlatList, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistBuilderProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  placeholder?: string;
  maxItems?: number;
  editable?: boolean;
  showCompleted?: boolean;
}

/**
 * ChecklistBuilder Component
 * 
 * Blueprint requirement: "Add checklist of items/steps" for Do a Task service
 * Allows users to create a list of steps or items for their task.
 */
export function ChecklistBuilder({
  items,
  onItemsChange,
  placeholder = 'Add a step or item...',
  maxItems = 20,
  editable = true,
  showCompleted = true,
}: ChecklistBuilderProps) {
  const colors = useColors();
  const [newItemText, setNewItemText] = useState('');

  const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddItem = () => {
    if (!newItemText.trim() || items.length >= maxItems) return;

    const newItem: ChecklistItem = {
      id: generateId(),
      text: newItemText.trim(),
      completed: false,
    };

    onItemsChange([...items, newItem]);
    setNewItemText('');

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggleItem = (id: string) => {
    if (!showCompleted) return;

    onItemsChange(
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleUpdateItem = (id: string, text: string) => {
    onItemsChange(
      items.map(item =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const renderItem = ({ item, index }: { item: ChecklistItem; index: number }) => (
    <View className="flex-row items-center bg-surface rounded-lg px-4 py-3 mb-2 border border-border">
      {/* Step number or checkbox */}
      {showCompleted ? (
        <Pressable
          onPress={() => handleToggleItem(item.id)}
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            item.completed ? 'bg-success border-success' : 'border-muted'
          }`}
        >
          {item.completed && (
            <Feather name="check" size={14} color="white" />
          )}
        </Pressable>
      ) : (
        <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center mr-3">
          <Text variant="bodySmall" weight="bold" className="text-primary">
            {index + 1}
          </Text>
        </View>
      )}

      {/* Item text */}
      {editable ? (
        <TextInput
          className={`flex-1 text-foreground ${item.completed ? 'line-through opacity-50' : ''}`}
          value={item.text}
          onChangeText={(text) => handleUpdateItem(item.id, text)}
          placeholder="Enter step description"
          placeholderTextColor={colors.muted}
        />
      ) : (
        <Text
          variant="body"
          className={`flex-1 ${item.completed ? 'line-through opacity-50' : ''}`}
        >
          {item.text}
        </Text>
      )}

      {/* Remove button */}
      {editable && (
        <Pressable
          onPress={() => handleRemoveItem(item.id)}
          className="w-8 h-8 rounded-full bg-error/10 items-center justify-center ml-2"
        >
          <Feather name="x" size={16} color={colors.error} />
        </Pressable>
      )}
    </View>
  );

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text variant="body" weight="semibold">
          Task Steps
        </Text>
        <Text variant="bodySmall" color="muted">
          {items.length}/{maxItems}
        </Text>
      </View>

      {/* Items list */}
      {items.length > 0 && (
        <View className="mb-3">
          {items.map((item, index) => (
            <View key={item.id}>
              {renderItem({ item, index })}
            </View>
          ))}
        </View>
      )}

      {/* Add new item input */}
      {editable && items.length < maxItems && (
        <View className="flex-row items-center bg-surface rounded-lg border border-border overflow-hidden">
          <View className="w-10 h-10 items-center justify-center">
            <Feather name="plus" size={20} color={colors.muted} />
          </View>
          <TextInput
            className="flex-1 py-3 pr-4 text-foreground"
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            value={newItemText}
            onChangeText={setNewItemText}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
          {newItemText.trim() && (
            <Pressable
              onPress={handleAddItem}
              className="px-4 py-3 bg-primary"
            >
              <Text variant="bodySmall" weight="semibold" className="text-white">
                Add
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <View className="py-4">
          <Text variant="bodySmall" color="muted" className="text-center">
            Add steps to help your tasker understand what needs to be done
          </Text>
        </View>
      )}
    </View>
  );
}

export default ChecklistBuilder;
