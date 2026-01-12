// @ts-nocheck
/**
 * SubstitutionApprovalModal - Customer approval for item substitutions
 * Displays side-by-side comparison when tasker requests to substitute an item
 */
import React, { useState } from 'react';
import { View, Modal, Pressable, Image, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface SubstitutionItem {
  id: string;
  name: string;
  brand?: string;
  price: number;
  image?: string;
  reason?: string;
}

interface SubstitutionRequest {
  id: string;
  orderId: string;
  taskerId: string;
  taskerName: string;
  originalItem: SubstitutionItem;
  proposedItem: SubstitutionItem;
  reason: string;
  timestamp: string;
}

interface SubstitutionApprovalModalProps {
  visible: boolean;
  request: SubstitutionRequest | null;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onClose: () => void;
}

export function SubstitutionApprovalModal({
  visible,
  request,
  onApprove,
  onReject,
  onClose
}: SubstitutionApprovalModalProps) {
  const colors = useColors();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!request) return null;

  const priceDifference = request.proposedItem.price - request.originalItem.price;
  const isMoreExpensive = priceDifference > 0;
  const isCheaper = priceDifference < 0;

  const handleApprove = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsProcessing(true);
    
    try {
      await onApprove(request.id);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve substitution. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsProcessing(true);
    
    try {
      await onReject(request.id);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject substitution. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl max-h-[85%]">
          {/* Header */}
          <View className="p-6 border-b border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Substitution Request</Text>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                className="w-8 h-8 rounded-full bg-surface items-center justify-center"
              >
                <Feather name="x" size={20} color={colors.foreground} />
              </Pressable>
            </View>
            <Text className="text-sm text-muted">
              {request.taskerName} is requesting to substitute an item
            </Text>
          </View>

          <ScrollView className="flex-1">
            {/* Reason */}
            <View className="p-6 bg-warning/10 border-b border-warning/20">
              <View className="flex-row items-start">
                <Feather name="alert-circle" size={20} color={colors.warning} style={{ marginTop: 2 }} />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold text-warning mb-1">Reason for Substitution</Text>
                  <Text className="text-sm text-foreground">{request.reason}</Text>
                </View>
              </View>
            </View>

            {/* Comparison */}
            <View className="p-6">
              <View className="flex-row gap-4">
                {/* Original Item */}
                <View className="flex-1">
                  <View className="bg-error/10 rounded-lg p-3 mb-3">
                    <Text className="text-xs font-semibold text-error text-center">ORIGINAL ITEM</Text>
                  </View>
                  
                  <View className="bg-surface rounded-2xl p-4 border border-border">
                    {request.originalItem.image ? (
                      <Image
                        source={{ uri: request.originalItem.image }}
                        className="w-full h-32 rounded-lg mb-3"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-32 rounded-lg mb-3 bg-muted/20 items-center justify-center">
                        <Feather name="package" size={40} color={colors.muted} />
                      </View>
                    )}
                    
                    <Text className="text-sm font-bold text-foreground mb-1" numberOfLines={2}>
                      {request.originalItem.name}
                    </Text>
                    
                    {request.originalItem.brand && (
                      <Text className="text-xs text-muted mb-2">{request.originalItem.brand}</Text>
                    )}
                    
                    <View className="flex-row items-center justify-between pt-3 border-t border-border">
                      <Text className="text-xs text-muted">Price</Text>
                      <Text className="text-base font-bold text-foreground">
                        K{request.originalItem.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Arrow */}
                <View className="items-center justify-center pt-12">
                  <Feather name="arrow-right" size={24} color={colors.primary} />
                </View>

                {/* Proposed Item */}
                <View className="flex-1">
                  <View className="bg-primary/10 rounded-lg p-3 mb-3">
                    <Text className="text-xs font-semibold text-primary text-center">PROPOSED ITEM</Text>
                  </View>
                  
                  <View className="bg-surface rounded-2xl p-4 border-2 border-primary">
                    {request.proposedItem.image ? (
                      <Image
                        source={{ uri: request.proposedItem.image }}
                        className="w-full h-32 rounded-lg mb-3"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-32 rounded-lg mb-3 bg-muted/20 items-center justify-center">
                        <Feather name="package" size={40} color={colors.muted} />
                      </View>
                    )}
                    
                    <Text className="text-sm font-bold text-foreground mb-1" numberOfLines={2}>
                      {request.proposedItem.name}
                    </Text>
                    
                    {request.proposedItem.brand && (
                      <Text className="text-xs text-muted mb-2">{request.proposedItem.brand}</Text>
                    )}
                    
                    <View className="flex-row items-center justify-between pt-3 border-t border-border">
                      <Text className="text-xs text-muted">Price</Text>
                      <Text className="text-base font-bold text-foreground">
                        K{request.proposedItem.price.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Price Difference */}
              {priceDifference !== 0 && (
                <View className={cn(
                  "mt-4 p-4 rounded-xl",
                  isMoreExpensive ? "bg-warning/10" : "bg-success/10"
                )}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Feather 
                        name={isMoreExpensive ? "trending-up" : "trending-down"} 
                        size={20} 
                        color={isMoreExpensive ? colors.warning : colors.success} 
                      />
                      <Text className={cn(
                        "text-sm font-semibold ml-2",
                        isMoreExpensive ? "text-warning" : "text-success"
                      )}>
                        {isMoreExpensive ? 'More Expensive' : 'Cheaper'}
                      </Text>
                    </View>
                    <Text className={cn(
                      "text-base font-bold",
                      isMoreExpensive ? "text-warning" : "text-success"
                    )}>
                      {isMoreExpensive ? '+' : ''}K{Math.abs(priceDifference).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-6 border-t border-border">
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleReject}
                disabled={isProcessing}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="flex-1 py-4 rounded-xl bg-error/10 border border-error items-center"
              >
                <Text className="text-error font-semibold">Reject</Text>
              </Pressable>

              <Pressable
                onPress={handleApprove}
                disabled={isProcessing}
                style={({ pressed }) => ({ 
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                })}
                className="flex-[2] py-4 rounded-xl bg-success items-center"
              >
                <Text className="text-white font-bold text-base">
                  {isProcessing ? 'Processing...' : 'Approve Substitution'}
                </Text>
              </Pressable>
            </View>
            
            {isMoreExpensive && (
              <Text className="text-xs text-muted text-center mt-3">
                You will be charged K{Math.abs(priceDifference).toFixed(2)} extra for this substitution
              </Text>
            )}
            {isCheaper && (
              <Text className="text-xs text-success text-center mt-3">
                You will save K{Math.abs(priceDifference).toFixed(2)} with this substitution
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
