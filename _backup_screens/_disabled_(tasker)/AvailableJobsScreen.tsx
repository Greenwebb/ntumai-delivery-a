// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, EmptyStateView } from '@/components/ui/shared-components';
import { SkeletonList } from '@/components/ui/skeleton';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { useEffect, useState } from 'react';

import { View, ScrollView, FlatList, RefreshControl, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { useAuthStore, useTaskerStore } from '@/src/store';

import { Feather } from '@expo/vector-icons';

export default function AvailableJobsScreen() { const router = useRouter();
  const colors = useColors();
  const { user } = useAuthStore();
  const { availableOrders, fetchAvailableJobs, isLoading } = useTaskerStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'task'>('all');

  useEffect(() =>  {
    if (user?.id) { fetchAvailableJobs(user.id, 0, 0); } }, [user]);
  const handleRefresh = async () => { setRefreshing(true);

    if (user?.id) { await fetchAvailableJobs(user.id, 0, 0); }

    setRefreshing(false); };
  const filteredJobs = availableOrders.filter(job =>  {
    if (filterType === 'all') return true;

    return job.type === filterType; });

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

          <Text className="text-2xl font-bold text-foreground">Available Jobs</Text>

          <Text className="text-muted text-sm">{filteredJobs.length} jobs available</Text>

        </View>

      </View>

      {/* Filter Tabs */}

      <View className="bg-background flex-row border-b border-border px-6">

        {[

          { id: 'all', label: 'All Jobs' },

          { id: 'delivery', label: 'Deliveries' },

          { id: 'task', label: 'Tasks' },

        ].map(tab => (

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={tab.id}

            onPress={() => setFilterType(tab.id as any)}

            className={`py-4 px-4 border-b-2 ${ filterType === tab.id ? 'border-green-600' : 'border-transparent' }`}

          >

            <Text className={`font-semibold ${ filterType === tab.id ? 'text-primary' : 'text-muted' }`}>

              {tab.label}

            </Text>

          </Pressable>

        ))}

      </View>

      {/* Jobs List */}

      {isLoading && !refreshing ? (
        <View className="flex-1 px-6 pt-4">
          <SkeletonList count={5} />
        </View>
      ) : filteredJobs.length > 0 ? (

        <FlatList

          data={filteredJobs}

          keyExtractor={(item) => item.id}

          refreshControl={ <RefreshControl

              refreshing={refreshing}

              onRefresh={handleRefresh}

              colors={['#16A34A']}

            /> }

          renderItem={({ item }) => (

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push(`/(tasker)/JobDetail?jobId=${item.id}`)}

              className="px-6 py-4 border-b border-gray-100"

            >

              <View className="flex-row items-start justify-between mb-3">

                <View className="flex-1">

                  <View className="flex-row items-center mb-2">

                    <Text className="text-lg font-bold text-foreground flex-1">{item.title}</Text>

                    <View className={`px-3 py-1 rounded-full ${ item.type === 'delivery' ? 'bg-blue-100' : 'bg-purple-100' }`}>

                      <Text className={`text-xs font-bold ${ item.type === 'delivery' ? 'text-blue-700' : 'text-purple-700' }`}>

                        {item.type.toUpperCase()}

                      </Text>

                    </View>

                  </View>

                  <Text className="text-muted text-sm line-clamp-2">

                    {item.description}

                  </Text>

                </View>

              </View>

              {/* Location and Details */}

              <View className="bg-surface rounded-lg p-3 mb-3">

                <View className="flex-row items-center mb-2">

                  <Feather name="map-pin" size={14} color="#6B7280" />

                  <Text className="text-muted text-xs ml-2 flex-1">

                    {item.pickupLocation}

                  </Text>

                </View>

                <View className="flex-row items-center">

                  <Feather name="arrow-down" size={14} color="#9CA3AF" />

                  <Text className="text-muted text-xs ml-2 flex-1">

                    {item.dropoffLocation}

                  </Text>

                </View>

              </View>

              {/* Footer */}

              <View className="flex-row items-center justify-between">

                <View className="flex-row items-center gap-4">

                  <View className="flex-row items-center">

                    <Feather name="clock" size={14} color="#6B7280" />

                    <Text className="text-muted text-xs ml-1">{item.estimatedTime}</Text>

                  </View>

                  <View className="flex-row items-center">

                    <Feather name="navigation" size={14} color="#6B7280" />

                    <Text className="text-muted text-xs ml-1">{item.distance || '2.5 km'}</Text>

                  </View>

                </View>

                <View className="items-end">

                  <Text className="text-2xl font-bold text-primary">{item.estimatedPay}K</Text>

                  <Text className="text-muted text-xs">Est. earnings</Text>

                </View>

              </View>

            </Pressable>

          )}

        />

      ) : (

        <View className="flex-1 items-center justify-center">

          <Feather name="inbox" size={64} color="#D1D5DB" />

          <Text className="text-2xl font-bold text-foreground mt-4">No jobs available</Text>

          <Text className="text-muted text-center mt-2 px-6">

            Check back soon or adjust your location to see more opportunities

          </Text>

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleRefresh}

            className="bg-primary rounded-lg px-8 py-3 mt-6"

          >

            <Text className="text-white font-bold">Refresh</Text>

          </Pressable>

        </View>

      )}

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

