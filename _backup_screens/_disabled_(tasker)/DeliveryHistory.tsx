// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import { ArrowLeft, Package, DollarSign, Calendar, Filter } from 'lucide-react-native';

export default function DeliveryHistory() {
  const router = useRouter();
  const colors = useColors();
  const [filter, setFilter] = useState('all');

  const deliveries = [
    {
      id: 1,
      customer: 'John Mwale',
      pickup: 'Cairo Road',
      dropoff: 'Kabulonga',
      amount: 'K 35',
      status: 'completed',
      date: '2024-01-15',
      time: '14:30',
    },
    {
      id: 2,
      customer: 'Mary Banda',
      pickup: 'Woodlands',
      dropoff: 'Roma',
      amount: 'K 28',
      status: 'completed',
      date: '2024-01-15',
      time: '12:15',
    },
    {
      id: 3,
      customer: 'Peter Phiri',
      pickup: 'Longacres',
      dropoff: 'Chelston',
      amount: 'K 42',
      status: 'completed',
      date: '2024-01-14',
      time: '16:45',
    },
    {
      id: 4,
      customer: 'Grace Mulenga',
      pickup: 'Northmead',
      dropoff: 'Kalundu',
      amount: 'K 38',
      status: 'completed',
      date: '2024-01-14',
      time: '11:20',
    },
    {
      id: 5,
      customer: 'David Tembo',
      pickup: 'Chilenje',
      dropoff: 'Kalingalinga',
      amount: 'K 25',
      status: 'completed',
      date: '2024-01-13',
      time: '09:30',
    },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const renderDeliveryItem = ({ item }) => (
    <Card className="p-4 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text variant="body" weight="bold">{item.customer}</Text>
          <View className="flex-row items-center mt-1">
            <Calendar size={14} color={colors.muted} />
            <Text variant="caption" color="muted" className="ml-1">
              {item.date} at {item.time}
            </Text>
          </View>
        </View>
        <View className="bg-success/10 px-3 py-1 rounded-full">
          <Text variant="caption" className="text-success capitalize">{item.status}</Text>
        </View>
      </View>

      <View className="border-t border-border pt-3">
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 rounded-full bg-primary mr-2" />
          <Text variant="bodySmall" color="muted" className="flex-1">{item.pickup}</Text>
        </View>
        <View className="flex-row items-center mb-3">
          <View className="w-2 h-2 rounded-full bg-success mr-2" />
          <Text variant="bodySmall" color="muted" className="flex-1">{item.dropoff}</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <DollarSign size={16} color={colors.success} />
            <Text variant="body" weight="bold" className="text-success ml-1">
              {item.amount}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/(tasker)/JobDetailScreen?id=${item.id}`)}
          >
            <Text variant="bodySmall" className="text-primary">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text variant="h2" weight="bold">Delivery History</Text>
            <Text variant="bodySmall" color="muted">{deliveries.length} total deliveries</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {filters.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full ${
                  filter === f.id ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <Text
                  variant="bodySmall"
                  weight="medium"
                  className={filter === f.id ? 'text-white' : 'text-muted'}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Summary Card */}
        <Card className="p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="bodySmall" color="muted">Total Earnings</Text>
              <Text variant="h3" weight="bold" className="text-success">K 168</Text>
            </View>
            <View className="items-end">
              <Text variant="bodySmall" color="muted">Deliveries</Text>
              <Text variant="h3" weight="bold">{deliveries.length}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Delivery List */}
      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

