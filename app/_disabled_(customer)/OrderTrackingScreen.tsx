// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { useEffect, useState, useRef } from 'react';
import { View, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOrderStore } from '@/src/store';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SmartMapView } from '@/components/SmartMapView';

const OrderSteps = [
  { id: 'confirmed', label: 'Order Confirmed', icon: 'check-circle' },
  { id: 'preparing', label: 'Being Prepared', icon: 'clock' },
  { id: 'ready', label: 'Ready for Pickup', icon: 'package' },
  { id: 'on_way', label: 'On the Way', icon: 'truck' },
  { id: 'delivered', label: 'Delivered', icon: 'home' },
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const colors = useColors();
  const { orderId } = useLocalSearchParams();
  const { getOrderDetail, selectedOrder, isLoading } = useOrderStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [driverLocation, setDriverLocation] = useState({
    latitude: -15.3900,
    longitude: 28.3200,
  });
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (orderId) {
      getOrderDetail(orderId as string);
    }
  }, [orderId]);

  useEffect(() => {
    if (selectedOrder) {
      const stepIndex = OrderSteps.findIndex(s => s.id === selectedOrder.status);
      setCurrentStep(Math.max(0, stepIndex));
    }
  }, [selectedOrder]);

  // Simulate driver movement
  useEffect(() => {
    if (selectedOrder && (selectedOrder.status === 'on_way' || selectedOrder.status === 'ready')) {
      simulationInterval.current = setInterval(() => {
        setDriverLocation(prev => ({
          latitude: prev.latitude + (Math.random() - 0.5) * 0.002,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.002,
        }));
      }, 3000);

      return () => {
        if (simulationInterval.current) {
          clearInterval(simulationInterval.current);
        }
      };
    }
  }, [selectedOrder?.status]);

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleLiveTracking = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(customer)/LiveTrackingScreen?orderId=${orderId}`);
  };

  if (isLoading || !selectedOrder) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading order details...</Text>
      </ScreenContainer>
    );
  }

  const estimatedDelivery = new Date(selectedOrder.estimatedDeliveryTime);
  const isDelivered = selectedOrder.status === 'delivered';
  const isOnWay = selectedOrder.status === 'on_way' || selectedOrder.status === 'ready';
  const deliveryLocation = {
    latitude: -15.3875,
    longitude: 28.3228,
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-6 py-4 border-b border-border flex-row items-center justify-between">
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={handleBack}
          className="p-1 -ml-1"
        >
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-bold text-foreground">Order Tracking</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1">
        {/* Live Map Tracking - Show when order is on the way */}
        {isOnWay && !isDelivered && (
          <View className="relative">
            <SmartMapView
              driverLocation={driverLocation}
              destinationLocation={deliveryLocation}
              driverName={selectedOrder.driver?.name || 'Your Driver'}
              height={220}
              showRoute={true}
              interactive={true}
            />
            
            {/* ETA Badge */}
            <View className="absolute top-4 left-4 bg-background rounded-xl px-4 py-2 shadow-lg border border-border flex-row items-center">
              <Feather name="clock" size={16} color={colors.primary} />
              <Text className="text-sm font-bold text-foreground ml-2">
                {Math.floor(Math.random() * 10) + 10} min away
              </Text>
            </View>
            
            {/* Live Tracking Button */}
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              onPress={handleLiveTracking}
              className="absolute bottom-4 right-4 bg-primary rounded-full px-4 py-3 shadow-lg flex-row items-center"
            >
              <Feather name="navigation" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Live Track</Text>
            </Pressable>
          </View>
        )}

        {/* Status Card */}
        <View className="px-6 py-6 bg-surface border-b border-border">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-sm text-muted">Order #{selectedOrder.id?.slice(-8)}</Text>
              <Text className="text-xl font-bold text-foreground mt-1">
                {isDelivered ? 'Delivered!' : OrderSteps[currentStep]?.label}
              </Text>
            </View>
            <View className={`px-4 py-2 rounded-full ${isDelivered ? 'bg-success/20' : 'bg-primary/20'}`}>
              <Text className={`text-sm font-semibold ${isDelivered ? 'text-success' : 'text-primary'}`}>
                {isDelivered ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>

          {!isDelivered && (
            <View className="flex-row items-center bg-background rounded-xl p-4 border border-border">
              <Feather name="clock" size={20} color={colors.primary} />
              <View className="ml-3">
                <Text className="text-xs text-muted">Estimated Delivery</Text>
                <Text className="text-base font-semibold text-foreground">
                  {estimatedDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Order Progress Steps */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-foreground mb-4">Order Progress</Text>
          
          {OrderSteps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <View key={step.id} className="flex-row items-start mb-1">
                {/* Step Indicator */}
                <View className="items-center mr-4">
                  <View 
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isCompleted ? 'bg-primary' : 'bg-surface border-2 border-border'
                    }`}
                  >
                    <Feather 
                      name={isCompleted ? 'check' : step.icon as any} 
                      size={18} 
                      color={isCompleted ? 'white' : colors.muted} 
                    />
                  </View>
                  {index < OrderSteps.length - 1 && (
                    <View 
                      className={`w-0.5 h-8 ${isCompleted ? 'bg-primary' : 'bg-border'}`}
                    />
                  )}
                </View>
                
                {/* Step Content */}
                <View className="flex-1 pb-4">
                  <Text className={`text-base font-semibold ${isCompleted ? 'text-foreground' : 'text-muted'}`}>
                    {step.label}
                  </Text>
                  {isCurrent && !isDelivered && (
                    <Text className="text-sm text-primary mt-1">In progress...</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Driver Info - Show when on the way */}
        {isOnWay && selectedOrder.driver && (
          <View className="mx-6 mb-6 bg-surface rounded-2xl p-5 border border-border">
            <Text className="text-base font-bold text-foreground mb-4">Your Driver</Text>
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
                <Text className="text-xl font-bold text-primary">
                  {selectedOrder.driver.name?.charAt(0) || 'D'}
                </Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {selectedOrder.driver.name || 'Driver'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Feather name="star" size={14} color="#F59E0B" />
                  <Text className="text-sm text-muted ml-1">
                    {selectedOrder.driver.rating || '4.8'}
                  </Text>
                  <Text className="text-muted mx-2">•</Text>
                  <Text className="text-sm text-muted">
                    {selectedOrder.driver.vehicle || 'Motorcycle'}
                  </Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="w-12 h-12 rounded-full bg-primary items-center justify-center"
              >
                <Feather name="phone" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View className="mx-6 mb-6 bg-surface rounded-2xl p-5 border border-border">
          <Text className="text-base font-bold text-foreground mb-4">Order Items</Text>
          
          {selectedOrder.items?.map((item: any, index: number) => (
            <View 
              key={index} 
              className={`flex-row items-center py-3 ${
                index < selectedOrder.items.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
                <Text className="text-sm font-bold text-primary">{item.quantity}x</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-foreground">{item.name}</Text>
                {item.options && (
                  <Text className="text-xs text-muted mt-0.5">{item.options}</Text>
                )}
              </View>
              <Text className="text-sm font-semibold text-foreground">
                K{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View className="mt-4 pt-4 border-t border-border flex-row justify-between">
            <Text className="text-base font-bold text-foreground">Total</Text>
            <Text className="text-base font-bold text-primary">
              K{selectedOrder.total?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View className="mx-6 mb-6 bg-surface rounded-2xl p-5 border border-border">
          <Text className="text-base font-bold text-foreground mb-3">Delivery Address</Text>
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center">
              <Feather name="map-pin" size={18} color={colors.success} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-foreground">
                {selectedOrder.deliveryAddress?.street || 'Your Address'}
              </Text>
              <Text className="text-xs text-muted mt-1">
                {selectedOrder.deliveryAddress?.city || 'Lusaka'}, {selectedOrder.deliveryAddress?.state || 'Zambia'}
              </Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View className="mx-6 mb-8">
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            className="flex-row items-center justify-center py-4 bg-surface rounded-xl border border-border"
          >
            <Feather name="help-circle" size={20} color={colors.muted} />
            <Text className="text-muted font-medium ml-2">Need help with your order?</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

