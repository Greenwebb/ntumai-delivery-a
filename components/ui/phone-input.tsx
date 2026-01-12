
import { View, TextInput as RNTextInput, Platform } from 'react-native';
import { CountryCodePicker } from './country-code-picker';
import { Text } from './text';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';

interface PhoneInputProps {
  label?: string;
  phone: string;
  countryCode: string;
  onPhoneChange: (phone: string) => void;
  onCountryChange: (code: string) => void;
  errorText?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  onSubmitEditing?: () => void;
}

/**
 * Phone Input Component with Country Code Picker
 * 
 * Features:
 * - Integrated country code picker on the left
 * - Phone number input on the right
 * - Error state with message
 * - Theme-aware colors
 * - NativeWind styling
 */
export function PhoneInput({
  label,
  phone,
  countryCode,
  onPhoneChange,
  onCountryChange,
  errorText,
  placeholder = 'Enter your mobile no.',
  className,
  maxLength = 15,
  onSubmitEditing,
}: PhoneInputProps) {
  const colors = useColors();
  const hasError = !!errorText;

  return (
    <View className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <Text className="text-sm font-medium text-foreground mb-2">
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View className="flex-row items-center w-full">
        {/* Country Code Picker */}
        <CountryCodePicker
          code={countryCode}
          onSelect={onCountryChange}
        />

        {/* Phone Number Input */}
        <RNTextInput
          value={phone}
          onChangeText={onPhoneChange}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          maxLength={maxLength}
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
          className={cn(
            'flex-1 h-11 px-4 text-base text-foreground bg-surface border border-border',
            hasError && 'border-error'
          )}
          style={{
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderLeftWidth: 0,
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          }}
        />
      </View>

      {/* Error Message */}
      {hasError && (
        <Text className="text-sm text-error mt-1">
          {errorText}
        </Text>
      )}
    </View>
  );
}
