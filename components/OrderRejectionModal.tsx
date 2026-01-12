// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import {
  X,
  PackageX,
  Clock,
  DoorClosed,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface OrderRejectionModalProps {
  visible: boolean;
  orderNumber: string;
  onClose: () => void;
  onReject: (reason: string, customReason?: string) => void;
}

const REJECTION_REASONS = [
  {
    id: 'out_of_stock',
    label: 'Out of Stock',
    description: 'One or more items are unavailable',
    icon: PackageX,
  },
  {
    id: 'too_busy',
    label: 'Too Busy',
    description: 'Cannot handle more orders right now',
    icon: Clock,
  },
  {
    id: 'closed_early',
    label: 'Closed Early',
    description: 'Restaurant closed earlier than scheduled',
    icon: DoorClosed,
  },
  {
    id: 'other',
    label: 'Other Reason',
    description: 'Specify a custom reason',
    icon: AlertCircle,
  },
];

export function OrderRejectionModal({
  visible,
  orderNumber,
  onClose,
  onReject,
}: OrderRejectionModalProps) {
  const colors = useColors();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  const handleReasonSelect = (reasonId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedReason(reasonId);
    if (reasonId !== 'other') {
      setCustomReason('');
    }
  };

  const handleReject = () => {
    if (!selectedReason) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    const reason = REJECTION_REASONS.find((r) => r.id === selectedReason);
    onReject(
      selectedReason,
      selectedReason === 'other' ? customReason : reason?.label
    );
    
    // Reset state
    setSelectedReason(null);
    setCustomReason('');
  };

  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason('');
    onClose();
  };

  const canSubmit = selectedReason && (selectedReason !== 'other' || customReason.trim().length > 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View className="bg-background rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <View className="flex-1">
              <Text variant="h3" weight="bold">Reject Order</Text>
              <Text variant="bodySmall" color="muted" className="mt-1">
                Order {orderNumber}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <X size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="max-h-96"
          >
            <View className="px-6 py-4">
              <Text variant="body" color="muted" className="mb-4">
                Please select a reason for rejecting this order. The customer will be notified.
              </Text>

              {/* Rejection Reasons */}
              {REJECTION_REASONS.map((reason) => {
                const Icon = reason.icon;
                const isSelected = selectedReason === reason.id;

                return (
                  <TouchableOpacity
                    key={reason.id}
                    onPress={() => handleReasonSelect(reason.id)}
                    className={`mb-3 p-4 rounded-xl border-2 ${
                      isSelected
                        ? 'border-error bg-error/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                          isSelected ? 'bg-error/20' : 'bg-background'
                        }`}
                      >
                        <Icon
                          size={20}
                          color={isSelected ? colors.error : colors.muted}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          variant="body"
                          weight="bold"
                          style={{ color: isSelected ? colors.error : colors.foreground }}
                        >
                          {reason.label}
                        </Text>
                        <Text variant="bodySmall" color="muted">
                          {reason.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="w-6 h-6 rounded-full bg-error items-center justify-center">
                          <Text variant="bodySmall" weight="bold" className="text-white">
                            ✓
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Custom Reason Input */}
              {selectedReason === 'other' && (
                <View className="mt-2 mb-4">
                  <Text variant="bodySmall" weight="bold" className="mb-2">
                    Please specify the reason:
                  </Text>
                  <TextInput
                    value={customReason}
                    onChangeText={setCustomReason}
                    placeholder="Enter custom reason..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                    className="bg-surface border border-border rounded-xl p-4 text-base"
                    style={{ color: colors.foreground, textAlignVertical: 'top' }}
                    maxLength={200}
                  />
                  <Text variant="bodySmall" color="muted" className="mt-1 text-right">
                    {customReason.length}/200
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="px-6 py-4 border-t border-border gap-3">
            <TouchableOpacity
              onPress={handleReject}
              disabled={!canSubmit}
              className={`py-4 rounded-xl ${
                canSubmit ? 'bg-error' : 'bg-surface'
              }`}
            >
              <Text
                variant="body"
                weight="bold"
                className={`text-center ${
                  canSubmit ? 'text-white' : 'text-muted'
                }`}
              >
                Reject Order
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClose}
              className="py-4 rounded-xl bg-surface border border-border"
            >
              <Text variant="body" weight="bold" className="text-center text-foreground">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
