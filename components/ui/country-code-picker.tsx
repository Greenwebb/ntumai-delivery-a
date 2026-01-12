import { useState } from 'react';
import { TouchableOpacity, Text, Modal, View, FlatList, TextInput, SafeAreaView } from 'react-native';
import { ChevronDown, X, Search } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';

// Country data with dial codes
const COUNTRIES = [
  { code: 'ZM', name: 'Zambia', dialCode: '+260' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263' },
  { code: 'MW', name: 'Malawi', dialCode: '+265' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'BW', name: 'Botswana', dialCode: '+267' },
  { code: 'NA', name: 'Namibia', dialCode: '+264' },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258' },
  { code: 'AO', name: 'Angola', dialCode: '+244' },
  { code: 'CD', name: 'Congo (DRC)', dialCode: '+243' },
].sort((a, b) => a.name.localeCompare(b.name));

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
 * - TypeScript-safe implementation
 */
export function CountryCodePicker({
  code,
  onSelect,
  className,
}: CountryCodePickerProps) {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const colors = useColors();

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.dialCode.includes(search)
  );

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

      <Modal
        visible={show}
        transparent
        animationType="slide"
        onRequestClose={() => setShow(false)}
      >
        <SafeAreaView className="flex-1 bg-black/50">
          <View className="flex-1 justify-end">
            <View className="bg-background rounded-t-3xl" style={{ height: '80%' }}>
              {/* Header */}
              <View className="flex-row items-center justify-between p-4 border-b border-border">
                <Text className="text-lg font-semibold text-foreground">Select Country</Text>
                <TouchableOpacity
                  onPress={() => setShow(false)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <X size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View className="px-4 py-3">
                <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 h-11">
                  <Search size={20} color={colors.muted} />
                  <TextInput
                    className="flex-1 ml-2 text-base text-foreground"
                    placeholder="Search country..."
                    placeholderTextColor={colors.muted}
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>
              </View>

              {/* Country List */}
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row items-center justify-between px-4 py-3 border-b border-border"
                    onPress={() => {
                      onSelect(item.dialCode);
                      setShow(false);
                      setSearch('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text className="text-base text-foreground">{item.name}</Text>
                    <Text className="text-base text-muted font-medium">{item.dialCode}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View className="p-8 items-center">
                    <Text className="text-base text-muted">No countries found</Text>
                  </View>
                }
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
