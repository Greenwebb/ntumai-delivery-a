// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';

import { useState } from 'react';

import { View, ScrollView, FlatList, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { Feather } from '@expo/vector-icons';

export default function PaymentMethodsScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [paymentMethods, setPaymentMethods] = useState([

    { id: '1',

      type: 'card',

      cardType: 'Visa',

      lastFour: '4242',

      expiryDate: '12/25',

      holderName: 'John Doe',

      isDefault: true},

    { id: '2',

      type: 'card',

      cardType: 'Mastercard',

      lastFour: '5555',

      expiryDate: '08/26',

      holderName: 'John Doe',

      isDefault: false},

    { id: '3',

      type: 'wallet',

      walletName: 'Mobile Money',

      walletNumber: '0712345678',

      provider: 'MTN',

      isDefault: false},

  ]);
  const [selectedMethodId, setSelectedMethodId] = useState('1');
  const handleDeleteMethod = (id: string) => { toast.info('Are you sure?'); };
  const handleSetDefault = (id: string) => { setPaymentMethods(paymentMethods.map(m => ({ ...m,

      isDefault: m.id === id}))); };

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

          <Text className="text-2xl font-bold text-foreground">Payment Methods</Text>

          <Text className="text-muted text-sm">{paymentMethods.length} saved</Text>

        </View>

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(shared)/AddPaymentMethodScreen')}

          className="bg-primary rounded-lg p-3"

        >

          <Feather name="plus" size={20} color="white" />

        </Pressable>

      </View>

      {/* Payment Methods List */}

      <FlatList

        data={paymentMethods}

        keyExtractor={(item) => item.id}

        renderItem={({ item }) => { const isCard = item.type === 'card';

          return (

            <View className="px-6 py-4 border-b border-gray-100">

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setSelectedMethodId(item.id)}

                className={`border-2 rounded-lg p-4 ${ selectedMethodId === item.id

                    ? 'border-green-600 bg-green-50'

                    : 'border-border' }`}

              >

                <View className="flex-row items-start justify-between mb-3">

                  <View className="flex-row items-center flex-1">

                    <View className={`w-12 h-12 rounded-lg items-center justify-center mr-3 ${ isCard ? 'bg-blue-100' : 'bg-purple-100' }`}>

                      <Feather

                        name={isCard ? 'credit-card' : 'smartphone'}

                        size={24}

                        color={isCard ? '#2563EB' : '#7C3AED'}

                      />

                    </View>

                    <View className="flex-1">

                      {isCard ? (

                        <>

                          <Text className="text-lg font-bold text-foreground">

                            {item.cardType} â¢â¢â¢â¢ {item.lastFour}

                          </Text>

                          <Text className="text-muted text-sm">

                            Expires {item.expiryDate}

                          </Text>

                        </>

                      ) : (

                        <>

                          <Text className="text-lg font-bold text-foreground">

                            {item.provider} {item.walletName}

                          </Text>

                          <Text className="text-muted text-sm">

                            {item.walletNumber}

                          </Text>

                        </>

                      )}

                    </View>

                  </View>

                  {selectedMethodId === item.id && (

                    <Feather name="check-circle" size={24} color="#16A34A" />

                  )}

                </View>

                {/* Actions */}

                <View className="flex-row items-center justify-between pt-3 border-t border-border">

                  <View className="flex-row items-center gap-2">

                    {item.isDefault && (

                      <View className="bg-blue-100 rounded-full px-3 py-1">

                        <Text className="text-blue-700 text-xs font-bold">Default</Text>

                      </View>

                    )}

                  </View>

                  <View className="flex-row gap-2">

                    {!item.isDefault && (

                      <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleSetDefault(item.id)}

                        className="bg-green-100 px-3 py-2 rounded-lg"

                      >

                        <Text className="text-green-700 text-xs font-bold">Set Default</Text>

                      </Pressable>

                    )}

                    <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDeleteMethod(item.id)}

                      className="bg-red-100 p-2 rounded-lg"

                    >

                      <Feather name="trash-2" size={16} color="#EF4444" />

                    </Pressable>

                  </View>

                </View>

              </Pressable>

            </View>

          ); }}

      />

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

