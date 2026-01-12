
import { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { CountryPicker } from 'react-native-country-codes-picker';
import { ChevronDown } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';

interface CountryCodePickerProps {
  code: string;
  onSelect: (code: string) => void;
  className?: string;
}

/**
 * Country Code Picker Component
 * 
 * Features:
 * - Modal picker with search functionality
 * - Displays country code with dropdown indicator
 * - Rounded left side to match phone input
 * - Theme-aware colors
 */
export function CountryCodePicker({
  code,
  onSelect,
  className,
}: CountryCodePickerProps) {
  const [show, setShow] = useState(false);
  const colors = useColors();

  return (
    <>
      <TouchableOpacity
        className={cn(
          'bg-surface border border-border h-11 px-3 flex-row items-center justify-center gap-1',
          className
        )}
        style={{
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text className='text-base text-foreground font-medium'>{code}</Text>
        <ChevronDown size={16} color={colors.muted} />
      </TouchableOpacity>

      <CountryPicker
        show={show}
        lang='en'
        pickerButtonOnPress={(item) => {
          onSelect(item.dial_code);
          setShow(false);
        }}
        onBackdropPress={() => setShow(false)}
        style={{
          modal: { height: 400 },
        }}
      />
    </>
  );
}
