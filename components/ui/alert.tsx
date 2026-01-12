// @ts-nocheck
import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { Text } from './text';
import { useColors } from '@/hooks/use-colors';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  style?: ViewStyle;
  className?: string;
}

export function Alert({ variant = 'info', title, message, onClose, style, className }: AlertProps) {
  const colors = useColors();

  const variantConfig: Record<AlertVariant, { icon: React.ReactNode; bgClass: string; borderClass: string }> = {
    info: {
      icon: <Info size={20} color="#3B82F6" />,
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-400',
    },
    success: {
      icon: <CheckCircle size={20} color="#10B981" />,
      bgClass: 'bg-green-50',
      borderClass: 'border-green-400',
    },
    warning: {
      icon: <AlertTriangle size={20} color="#F59E0B" />,
      bgClass: 'bg-yellow-50',
      borderClass: 'border-yellow-400',
    },
    error: {
      icon: <AlertCircle size={20} color="#EF4444" />,
      bgClass: 'bg-red-50',
      borderClass: 'border-red-400',
    },
  };

  const config = variantConfig[variant];

  return (
    <View
      className={`flex-row items-start p-4 rounded-lg border ${config.bgClass} ${config.borderClass} ${className || ''}`}
      style={style}
    >
      <View className="mr-3 pt-0.5">{config.icon}</View>
      
      <View className="flex-1">
        {title && (
          <Text variant="body" weight="medium" className="mb-1">
            {title}
          </Text>
        )}
        <Text variant="bodySmall" color="muted">
          {message}
        </Text>
      </View>

      {onClose && (
        <TouchableOpacity onPress={onClose} className="ml-3 p-0.5">
          <X size={18} color={colors.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}
