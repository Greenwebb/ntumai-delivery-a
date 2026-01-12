// @ts-nocheck
import React from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import { Briefcase, MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react-native';
import { useState, useCallback } from 'react';

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Food Delivery',
    pickup: 'Mama\'s Kitchen, Cairo Road',
    dropoff: '123 Independence Ave',
    distance: '3.2 km',
    earnings: 'K45',
    time: '15 min',
    status: 'available',
  },
  {
    id: '2',
    title: 'Parcel Delivery',
    pickup: 'Manda Hill Mall',
    dropoff: '456 Great East Road',
    distance: '5.8 km',
    earnings: 'K65',
    time: '25 min',
    status: 'available',
  },
  {
    id: '3',
    title: 'Grocery Pickup',
    pickup: 'Shoprite Arcades',
    dropoff: '789 Kafue Road',
    distance: '4.1 km',
    earnings: 'K55',
    time: '20 min',
    status: 'available',
  },
];

export default function TaskerJobsScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState(MOCK_JOBS);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const renderJob = (job: typeof MOCK_JOBS[0]) => (
    <Card key={job.id} className="mb-3 p-4">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text variant="h4" weight="bold">{job.title}</Text>
          <View className="flex-row items-center mt-1">
            <Clock size={14} color={colors.muted} />
            <Text variant="bodySmall" color="muted" className="ml-1">{job.time}</Text>
            <Text variant="bodySmall" color="muted" className="mx-2">•</Text>
            <Text variant="bodySmall" color="muted">{job.distance}</Text>
          </View>
        </View>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text variant="bodySmall" weight="bold" className="text-green-700">{job.earnings}</Text>
        </View>
      </View>

      <View className="bg-surface rounded-lg p-3 mb-3">
        <View className="flex-row items-start mb-2">
          <View className="w-3 h-3 rounded-full bg-green-500 mt-1" />
          <View className="flex-1 ml-3">
            <Text variant="bodySmall" color="muted">Pickup</Text>
            <Text variant="body" weight="medium">{job.pickup}</Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="w-3 h-3 rounded-full bg-red-500 mt-1" />
          <View className="flex-1 ml-3">
            <Text variant="bodySmall" color="muted">Dropoff</Text>
            <Text variant="body" weight="medium">{job.dropoff}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity className="bg-primary py-3 rounded-xl flex-row items-center justify-center">
        <Text variant="body" weight="bold" className="text-white">Accept Job</Text>
        <ChevronRight size={20} color="white" className="ml-1" />
      </TouchableOpacity>
    </Card>
  );

  return (
    <ScreenContainer>
      <View className="px-4 pt-6 pb-4">
        <Text variant="h1" weight="bold">Available Jobs</Text>
        <Text variant="body" color="muted" className="mt-1">
          {jobs.length} jobs near you
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {jobs.length > 0 ? (
          jobs.map(renderJob)
        ) : (
          <View className="items-center justify-center py-16">
            <Briefcase size={48} color={colors.muted} strokeWidth={1.5} />
            <Text variant="h4" weight="medium" color="muted" className="mt-4">No Jobs Available</Text>
            <Text variant="body" color="muted" className="mt-2 text-center">
              Pull down to refresh and check for new jobs
            </Text>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

