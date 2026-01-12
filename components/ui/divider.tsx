// @ts-nocheck
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: 'thin' | 'normal' | 'thick';
  className?: string;
  style?: ViewStyle;
}

export function Divider({ 
  orientation = 'horizontal', 
  thickness = 'normal',
  className,
  style 
}: DividerProps) {
  const thicknessClasses = {
    thin: orientation === 'horizontal' ? 'h-px' : 'w-px',
    normal: orientation === 'horizontal' ? 'h-[1px]' : 'w-[1px]',
    thick: orientation === 'horizontal' ? 'h-[2px]' : 'w-[2px]',
  };

  const orientationClasses = orientation === 'horizontal' 
    ? 'w-full self-stretch' 
    : 'h-full self-stretch';

  return (
    <View
      className={`bg-border ${thicknessClasses[thickness]} ${orientationClasses} ${className || ''}`}
      style={style}
    />
  );
}
