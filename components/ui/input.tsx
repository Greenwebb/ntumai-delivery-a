// @ts-nocheck
import React, { useState, forwardRef } from 'react';
import { View, TextInput, TextInputProps, Platform } from 'react-native';
import { Text } from './text';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label displayed above the field
   */
  label?: string;
  
  /**
   * Helper text or error message displayed below the field
   */
  helperText?: string;
  
  /**
   * Error text (overrides helperText and shows error state)
   */
  errorText?: string;
  
  /**
   * Error state - shows red border and error text
   */
  error?: boolean;
  
  /**
   * Success state - shows green border
   */
  success?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Left icon or component
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Right icon or component
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Left element (alias for leftIcon)
   */
  leftElement?: React.ReactNode;
  
  /**
   * Right element (alias for rightIcon)
   */
  rightElement?: React.ReactNode;
  
  /**
   * Additional className for the container
   */
  containerClassName?: string;
  
  /**
   * Additional className for the input field
   */
  className?: string;
  
  /**
   * Show character count (requires maxLength prop)
   */
  showCount?: boolean;
}

/**
 * Input component with consistent styling, validation states, and icons.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={!!emailError}
 *   helperText={emailError}
 *   leftIcon={<Mail size={20} color={colors.muted} />}
 * />
 * ```
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      error = false,
      success = false,
      disabled = false,
      size = 'md',
      leftIcon,
      rightIcon,
      leftElement,
      rightElement,
      containerClassName,
      className,
      showCount = false,
      value,
      maxLength,
      editable,
      ...props
    },
    ref
  ) => {
    const colors = useColors();
    const [isFocused, setIsFocused] = useState(false);
    
    const hasError = error || !!errorText;
    const displayText = errorText || helperText;
    const leftContent = leftIcon || leftElement;
    const rightContent = rightIcon || rightElement;
    const isEditable = editable !== false && !disabled;

    const sizeStyles = {
      sm: 'min-h-[36px] px-3 text-sm',
      md: 'min-h-[48px] px-4 text-base',
      lg: 'min-h-[56px] px-4 text-lg',
    };

    const borderColor = hasError
      ? 'border-error'
      : success
      ? 'border-success'
      : isFocused
      ? 'border-primary'
      : 'border-border';

    return (
      <View className={cn('w-full', containerClassName)}>
        {/* Label */}
        {label && (
          <Text
            variant="body"
            weight="medium"
            className={cn(
              'mb-2',
              hasError ? 'text-error' : disabled ? 'text-muted' : 'text-foreground'
            )}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View
          className={cn(
            'flex-row items-center rounded-xl border',
            isEditable ? 'bg-background' : 'bg-surface',
            borderColor,
            disabled && 'opacity-50',
            sizeStyles[size]
          )}
        >
          {/* Left Icon */}
          {leftContent && <View className="mr-2">{leftContent}</View>}

          {/* Text Input */}
          <TextInput
            ref={ref}
            value={value}
            maxLength={maxLength}
            editable={isEditable}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              'flex-1 text-foreground',
              Platform.OS === 'ios' ? 'py-3' : 'py-2',
              Platform.OS === 'web' && 'outline-none',
              className
            )}
            placeholderTextColor={colors.muted}
            accessible={true}
            accessibilityLabel={props.accessibilityLabel || label || props.placeholder}
            accessibilityHint={props.accessibilityHint || helperText}
            accessibilityRole="none"
            {...props}
          />

          {/* Right Icon */}
          {rightContent && <View className="ml-2">{rightContent}</View>}
        </View>

        {/* Helper Text / Error Message / Character Count */}
        {(displayText || showCount) && (
          <View className="flex-row justify-between items-center mt-1.5">
            {displayText && (
              <Text
                variant="caption"
                className={cn(
                  'flex-1',
                  hasError ? 'text-error' : success ? 'text-success' : 'text-muted'
                )}
              >
                {displayText}
              </Text>
            )}
            {showCount && maxLength && (
              <Text variant="caption" className="text-muted">
                {value?.length || 0}/{maxLength}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea variant with multiline support
 */
export interface TextareaProps extends InputProps {
  /**
   * Number of lines to display
   */
  numberOfLines?: number;
  
  /**
   * Minimum height in pixels
   */
  minHeight?: number;
}

export const Textarea = forwardRef<TextInput, TextareaProps>(
  ({ numberOfLines = 4, minHeight = 100, className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        className={cn('py-3', className)}
        style={{ minHeight }}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Search input with built-in search icon
 */
export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  /**
   * Callback when search is cleared
   */
  onClear?: () => void;
}

export const SearchInput = forwardRef<TextInput, SearchInputProps>(
  ({ value, onClear, rightIcon, ...props }, ref) => {
    const colors = useColors();
    
    return (
      <Input
        ref={ref}
        value={value}
        leftIcon={
          <View className="w-5 h-5 items-center justify-center">
            <Text className="text-muted">🔍</Text>
          </View>
        }
        rightIcon={
          value && onClear ? (
            <View
              className="w-5 h-5 items-center justify-center active:opacity-50"
              onTouchEnd={onClear}
            >
              <Text className="text-muted">✕</Text>
            </View>
          ) : (
            rightIcon
          )
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

/**
 * Password input with show/hide toggle
 */
export const PasswordInput = forwardRef<TextInput, InputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const colors = useColors();

  return (
    <Input
      ref={ref}
      secureTextEntry={!showPassword}
      rightIcon={
        <View
          className="w-6 h-6 items-center justify-center active:opacity-50"
          onTouchEnd={() => setShowPassword(!showPassword)}
        >
          <Text className="text-base">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </View>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

/**
 * Phone input with country code support
 */
export interface PhoneInputProps extends InputProps {
  /**
   * Country code (e.g., "+260")
   */
  countryCode?: string;
  
  /**
   * Callback when country code is changed
   */
  onCountryCodeChange?: (code: string) => void;
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  ({ countryCode = '+260', onCountryCodeChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        keyboardType="phone-pad"
        leftIcon={
          <View className="flex-row items-center">
            <Text variant="body" className="text-foreground">
              {countryCode}
            </Text>
            <View className="w-px h-5 bg-border mx-2" />
          </View>
        }
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

/**
 * OTP input with auto-focus and validation
 */
export interface OTPInputProps extends Omit<InputProps, 'value' | 'onChangeText'> {
  /**
   * Number of OTP digits
   */
  length?: number;
  
  /**
   * OTP value
   */
  value: string;
  
  /**
   * Callback when OTP changes
   */
  onChangeText: (value: string) => void;
  
  /**
   * Callback when OTP is complete
   */
  onComplete?: (value: string) => void;
}

export const OTPInput = forwardRef<TextInput, OTPInputProps>(
  ({ length = 6, value, onChangeText, onComplete, ...props }, ref) => {
    const handleChange = (text: string) => {
      // Only allow numbers
      const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
      onChangeText(cleaned);
      
      if (cleaned.length === length && onComplete) {
        onComplete(cleaned);
      }
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        textAlign="center"
        className="text-2xl font-bold tracking-widest"
        {...props}
      />
    );
  }
);

OTPInput.displayName = 'OTPInput';
