// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import { useState, useEffect } from 'react';
import { TrackingMap } from '@/components/tracking-map';

import { View, ScrollView, Dimensions, Pressable } from 'react-native';

import { useRouter, useRoute } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { locationService } from '@/src/services/location';
import { useToast } from '@/lib/toast-provider';
  const { width } = Dimensions.get('window');

interface JobStep { id: string;

  title: string;

  description: string;

  completed: boolean;

  timestamp?: string; }

export default function ActiveJobScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const route = useRoute();
  const { jobId } = route.params as any;
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [steps, setSteps] = useState<JobStep[]>([

    { id: '1',

      title: 'Navigate to Pickup',

      description: 'Head to the pickup location',

      completed: false},

    { id: '2',

      title: 'Arrive at Pickup',

      description: 'Confirm arrival at pickup location',

      completed: false},

    { id: '3',

      title: 'Collect Items',

      description: 'Collect items from customer',

      completed: false},

    { id: '4',

      title: 'Navigate to Dropoff',

      description: 'Head to the dropoff location',

      completed: false},

    { id: '5',

      title: 'Deliver Items',

      description: 'Deliver items to customer',

      completed: false},

  ]);
  const jobData = { jobId,

    pickupLocation: 'Downtown Market',

    pickupAddress: '123 Main St, Downtown',

    dropoffLocation: 'Residential Area',

    dropoffAddress: '456 Oak Ave, Suburbs',

    customerName: 'John Doe',

    customerPhone: '+1 (555) 123-4567',

    estimatedEarnings: 2.5,

    distance: 3.2,

    status: 'in_progress'};

  useEffect(() => { startTracking();

    return () => { locationService.stopTracking(); }; }, []);
  const startTracking = async () => { const location = await locationService.getCurrentLocation();

    if (location) { setCurrentLocation(location);

      setIsTracking(true);

      // Start continuous tracking

      await locationService.startTracking((location) => { setCurrentLocation(location); }); } };
  const handleCompleteStep = (stepId: string) => { setSteps(

      steps.map((step) =>

        step.id === stepId

          ? { ...step,

              completed: true,

              timestamp: new Date().toLocaleTimeString()}

          : step

      )

    ); };
  const handleArriveAtPickup = () => { toast.info('Are you at the pickup location?'); };
  const handleCollectItems = () => { toast.info('Have you collected all items?'); };
  const handleDelivery = () => { toast.info('Have you delivered all items?'); };
  const handleCancelJob = () => {
    toast.info('Are you sure you want to cancel this job? This may affect your rating.');
    // TODO: Add confirmation dialog
  };
  const completedSteps = steps.filter((s) => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (

    <View className="flex-1 bg-background">

      {/* Header */}

      <View className="bg-background border-b border-border px-4 py-4 flex-row items-center justify-between">

        <View>

          <Text className="text-2xl font-bold text-foreground">Active Job</Text>

          <Text className="text-sm text-muted mt-1">Job ID: {jobId}</Text>

        </View>

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCancelJob}

          className="p-2"

        >

          <Ionicons name="close" size={24} color="#EF4444" />

        </Pressable>

      </View>

      {/* Live Navigation Map */}
      <View style={{ height: 200 }}>
        <TrackingMap
          trackingData={{ taskerLocation: { latitude: currentLocation?.latitude || -15.4012,
              longitude: currentLocation?.longitude || -15.4012,
              address: 'Your Location'},
            pickupLocation: { latitude: -15.3982,
              longitude: 28.3132,
              address: jobData.pickupAddress},
            dropoffLocation: { latitude: -15.4312,
              longitude: 28.3156,
              address: jobData.dropoffAddress},
            status: steps[0].completed && !steps[3].completed ? 'heading_to_dropoff' : 'heading_to_pickup',
            estimatedArrival: '12 mins',
            taskerName: 'You'}}
          showInfoCard={false}
        />
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

        {/* Progress */}

        <View className="mb-6">

          <View className="flex-row justify-between items-center mb-2">

            <Text className="text-sm font-semibold text-foreground">Progress</Text>

            <Text className="text-sm text-muted">{completedSteps}/{steps.length}</Text>

          </View>

          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">

            <View

              className="h-full bg-green-500"

              style={{ width: `${progress}%` }}

            />

          </View>

        </View>

        {/* Current Location */}

        {currentLocation && (

          <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">

            <Text className="text-sm text-blue-900 font-semibold mb-2">ð Current Location</Text>

            <Text className="text-xs text-blue-700">

              Lat: {currentLocation.latitude.toFixed(4)}, Lon: {currentLocation.longitude.toFixed(4)}

            </Text>

          </View>

        )}

        {/* Job Details */}

        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">

          <Text className="text-lg font-bold text-foreground mb-4">Job Details</Text>

          {/* Pickup */}

          <View className="mb-4">

            <View className="flex-row items-start mb-2">

              <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-3 mt-0.5">

                <Text className="text-white text-xs">ð</Text>

              </View>

              <View className="flex-1">

                <Text className="text-sm text-muted">Pickup</Text>

                <Text className="text-base font-semibold text-foreground">

                  {jobData.pickupLocation}

                </Text>

                <Text className="text-xs text-muted mt-1">

                  {jobData.pickupAddress}

                </Text>

              </View>

            </View>

          </View>

          {/* Divider */}

          <View className="ml-3 mb-4 border-l-2 border-border h-4" />

          {/* Dropoff */}

          <View className="mb-4">

            <View className="flex-row items-start">

              <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-3 mt-0.5">

                <Text className="text-white text-xs">ð</Text>

              </View>

              <View className="flex-1">

                <Text className="text-sm text-muted">Dropoff</Text>

                <Text className="text-base font-semibold text-foreground">

                  {jobData.dropoffLocation}

                </Text>

                <Text className="text-xs text-muted mt-1">

                  {jobData.dropoffAddress}

                </Text>

              </View>

            </View>

          </View>

          {/* Earnings */}

          <View className="flex-row justify-between items-center p-3 bg-background rounded-lg border border-border mt-4">

            <Text className="text-muted font-semibold">Estimated Earnings</Text>

            <Text className="text-2xl font-bold text-primary">

              â­{jobData.estimatedEarnings}

            </Text>

          </View>

        </View>

        {/* Steps */}

        <Text className="text-lg font-bold text-foreground mb-3">Delivery Steps</Text>

        {steps.map((step, index) => (

          <View key={step.id} className="mb-3">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() =>  {
    if (step.id === '2') handleArriveAtPickup();

                else if (step.id === '3') handleCollectItems();

                else if (step.id === '5') handleDelivery(); }}

              disabled={step.completed}

              className={`p-4 rounded-lg border-2 ${ step.completed

                  ? 'bg-green-50 border-green-300'

                  : 'bg-background border-border' }`}

            >

              <View className="flex-row items-start">

                <View

                  className={`w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5 ${ step.completed ? 'bg-green-500' : 'bg-gray-300' }`}

                >

                  {step.completed ? (

                    <Ionicons name="checkmark" size={16} color="white" />

                  ) : (

                    <Text className="text-white text-xs font-bold">{index + 1}</Text>

                  )}

                </View>

                <View className="flex-1">

                  <Text

                    className={`font-semibold ${ step.completed ? 'text-green-900' : 'text-foreground' }`}

                  >

                    {step.title}

                  </Text>

                  <Text

                    className={`text-sm mt-1 ${ step.completed ? 'text-green-700' : 'text-muted' }`}

                  >

                    {step.description}

                  </Text>

                  {step.timestamp && (

                    <Text className="text-xs text-primary mt-1">

                      Completed at {step.timestamp}

                    </Text>

                  )}

                </View>

              </View>

            </Pressable>

          </View>

        ))}

        {/* Customer Info */}

        <View className="bg-surface rounded-lg p-4 mt-6 border border-border">

          <Text className="text-lg font-bold text-foreground mb-3">Customer Info</Text>

          <View className="flex-row items-center justify-between mb-3">

            <Text className="text-foreground font-semibold">{jobData.customerName}</Text>

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="p-2 bg-green-500 rounded-full">

              <Ionicons name="call" size={20} color="white" />

            </Pressable>

          </View>

          <Text className="text-sm text-muted">{jobData.customerPhone}</Text>

        </View>

      </ScrollView>

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

