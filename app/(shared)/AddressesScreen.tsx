// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import { useState } from 'react';

import { View, ScrollView, FlatList, Pressable, Alert, Platform } from 'react-native';

import { useRouter } from 'expo-router';

import { useUserStore } from '@/src/store';
import { useToast } from '@/lib/toast-provider';

import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function AddressesScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { addresses, removeAddress, setDefaultAddress } = useUserStore();
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id);
  
  const handleDeleteAddress = (id: string, label: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${label}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeAddress(id);
            toast.success('Address deleted');
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDefaultAddress(id);
    toast.success('Default address updated');
  };

  return (

    <View className="flex-1 bg-background">

      {/* Header */}

      <View className="px-6 py-4 border-b border-border flex-row items-center">

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mr-4">

          <Feather name="chevron-left" size={24} color="#1F2937" />

        </Pressable>

        <View className="flex-1">

          <Text className="text-2xl font-bold text-foreground">Addresses</Text>

          <Text className="text-muted text-sm">{addresses.length} saved</Text>

        </View>

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(shared)/AddNewAddressScreen')}

          className="bg-primary rounded-lg p-3"

        >

          <Feather name="plus" size={20} color="white" />

        </Pressable>

      </View>

      {/* Addresses List */}

      <FlatList

        data={addresses}

        keyExtractor={(item) => item.id}

        renderItem={({ item }) => (

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setSelectedAddressId(item.id)}

            className={`px-6 py-4 border-b border-gray-100 ${ selectedAddressId === item.id ? 'bg-green-50' : '' }`}

          >

            <View className="flex-row items-start justify-between">

              <View className="flex-row items-start flex-1">

                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 mt-1 ${ selectedAddressId === item.id

                    ? 'border-green-600 bg-primary'

                    : 'border-border' }`}>

                  {selectedAddressId === item.id && (

                    <Feather name="check" size={14} color="white" />

                  )}

                </View>

                <View className="flex-1">

                  <View className="flex-row items-center mb-1">

                    <Text className="text-lg font-bold text-foreground uppercase">

                      {item.type}

                    </Text>

                    {item.isDefault && (

                      <View className="bg-blue-100 rounded-full px-2 py-1 ml-2">

                        <Text className="text-blue-700 text-xs font-bold">Default</Text>

                      </View>

                    )}

                  </View>

                  <Text className="text-foreground font-semibold">

                    {item.street}

                  </Text>

                  <Text className="text-muted text-sm">

                    {item.city}, {item.state} {item.zipCode}

                  </Text>

                  <Text className="text-muted text-sm">

                    {item.country}

                  </Text>

                </View>

              </View>

              <View className="flex-row gap-2">

                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push(`/(shared)/EditAddressScreen?addressId=${item.id}`)}

                  className="bg-blue-100 p-2 rounded-lg"

                >

                  <Feather name="edit-2" size={16} color="#2563EB" />

                </Pressable>

                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDeleteAddress(item.id, item.label || item.type)}

                  className="bg-red-100 p-2 rounded-lg"

                >

                  <Feather name="trash-2" size={16} color="#EF4444" />

                </Pressable>

              </View>

            </View>

          </Pressable>

        )}

      />

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

