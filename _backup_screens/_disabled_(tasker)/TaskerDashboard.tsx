// @ts-nocheck
import AppText from '@/components/AppText';
import { useEffect, useState } from 'react';
import { TaskerBadge, BadgeProgress, calculateBadgeTier, TaskerStats } from '@/components/tasker-badge';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';





import { View, TouchableOpacity, ScrollView, Image, FlatList, ActivityIndicator, Switch } from 'react-native';





import { useRouter } from 'expo-router';





import { useAuthStore, useTaskerStore } from '@/src/store';





import { Feather } from '@expo/vector-icons';











export default function TaskerDashboard() {





  const router = useRouter();





  const { user } = useAuthStore();





  const {





    isOnline,





    setOnlineStatus,





    activeOrder,





    availableOrders,





    earnings,





    stats,





    goOnlineAsync,





    goOfflineAsync,





    fetchAvailableJobs,





    fetchEarnings,





    fetchStats,





    isLoading,





  } = useTaskerStore();











  const [refreshing, setRefreshing] = useState(false);











  useEffect(() => {





    if (user?.id) {





      fetchEarnings(user.id, 'today');





      fetchStats(user.id);





    }





  }, [user]);











  const handleToggleOnline = async () => {
    // Haptic feedback on toggle
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (user?.id) {
      if (isOnline) {
        await goOfflineAsync(user.id);
        // Additional haptic feedback on successful offline
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        await goOnlineAsync(user.id);
        // Additional haptic feedback on successful online
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
  };











  const handleRefresh = async () => {





    setRefreshing(true);





    if (user?.id) {





      await fetchAvailableJobs(user.id, 0, 0); // Mock location





      await fetchEarnings(user.id, 'today');





      await fetchStats(user.id);





    }





    setRefreshing(false);





  };











  return (





    <ScrollView className="flex-1 bg-gray-50">





      {/* Header with Status Toggle */}





      <View className="bg-white px-6 py-6 border-b border-gray-200">





        <View className="flex-row items-center justify-between mb-4">





          <View className="flex-row items-center">
            <View className="flex-1">
              <AppText className="text-sm text-gray-600">Welcome back</AppText>
              <AppText className="text-2xl font-bold text-gray-900">{user?.firstName}</AppText>
            </View>
            {/* Tasker Badge */}
            <TaskerBadge
              tier={calculateBadgeTier({
                totalDeliveries: stats?.totalDeliveries || 0,
                completionRate: stats?.completionRate || 0,
                averageRating: stats?.averageRating || 0,
                onTimeRate: stats?.onTimeRate || 0,
                acceptanceRate: stats?.acceptanceRate || 0,
              })}
              size="small"
            />
          </View>





          <TouchableOpacity onPress={() => router.push('/(shared)/ProfileScreen')}>





            <Image





              source={{ uri: user?.avatar }}





              className="w-12 h-12 rounded-full"





            />





          </TouchableOpacity>





        </View>











        {/* Online Status Toggle */}





        <View className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 flex-row items-center justify-between">





          <View>





            <AppText className="text-gray-600 text-sm mb-1">Status</AppText>





            <AppText className={`text-lg font-bold ${





              isOnline ? 'text-green-600' : 'text-gray-600'





            }`}>





              {isOnline ? 'ð¢ Online' : 'â« Offline'}





            </AppText>





          </View>





          <Switch





            value={isOnline}





            onValueChange={handleToggleOnline}





            disabled={isLoading}





            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}





            thumbColor={isOnline ? '#16A34A' : '#9CA3AF'}





          />





        </View>





      </View>











      {/* Earnings Card */}





      <View className="px-6 py-6">





        <AppText className="text-lg font-bold text-gray-900 mb-4">Today's Earnings</AppText>





        <View className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6">





          <View className="flex-row items-center justify-between mb-4">





            <View>





              <AppText className="text-green-100 text-sm mb-1">Total Earned</AppText>





              <AppText className="text-4xl font-bold text-white">{earnings.today}K</AppText>





            </View>





            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">





              <Feather name="trending-up" size={32} color="white" />





            </View>





          </View>





          <View className="flex-row items-center justify-between pt-4 border-t border-green-500">





            <View>





              <AppText className="text-green-100 text-xs">This Week</AppText>





              <AppText className="text-white font-bold">{earnings.week}K</AppText>





            </View>





            <View>





              <AppText className="text-green-100 text-xs">This Month</AppText>





              <AppText className="text-white font-bold">{earnings.month}K</AppText>





            </View>





          </View>





        </View>





      </View>











      {/* Stats */}





      {stats && (





        <View className="px-6 py-6">





          <AppText className="text-lg font-bold text-gray-900 mb-4">Your Stats</AppText>





          <View className="gap-3">





            <View className="bg-white rounded-lg p-4 flex-row items-center border border-gray-200">





              <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-4">





                <Feather name="package" size={24} color="#2563EB" />





              </View>





              <View className="flex-1">





                <AppText className="text-gray-600 text-sm">Total Deliveries</AppText>





                <AppText className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</AppText>





              </View>





            </View>











            <View className="bg-white rounded-lg p-4 flex-row items-center border border-gray-200">





              <View className="w-12 h-12 bg-yellow-100 rounded-lg items-center justify-center mr-4">





                <Feather name="star" size={24} color="#FCD34D" />





              </View>





              <View className="flex-1">





                <AppText className="text-gray-600 text-sm">Average Rating</AppText>





                <AppText className="text-2xl font-bold text-gray-900">{stats.averageRating}</AppText>





              </View>





            </View>











            <View className="bg-white rounded-lg p-4 flex-row items-center border border-gray-200">





              <View className="w-12 h-12 bg-green-100 rounded-lg items-center justify-center mr-4">





                <Feather name="check-circle" size={24} color="#16A34A" />





              </View>





              <View className="flex-1">





                <AppText className="text-gray-600 text-sm">Completion Rate</AppText>





                <AppText className="text-2xl font-bold text-gray-900">{stats.completionRate}%</AppText>





              </View>





            </View>





          </View>





        </View>





      )}











      {/* Active Job */}





      {activeOrder && (





        <View className="px-6 py-6">





          <AppText className="text-lg font-bold text-gray-900 mb-4">Active Delivery</AppText>





          <TouchableOpacity





            onPress={() => router.push(`/(tasker)/DeliveryDetail?orderId=${activeOrder.id}`)}





            className="bg-white rounded-lg p-4 border-2 border-green-600"





          >





            <View className="flex-row items-center justify-between mb-3">





              <AppText className="text-lg font-bold text-gray-900">Order #{activeOrder.id.slice(-4)}</AppText>





              <View className="bg-green-100 rounded-full px-3 py-1">





                <AppText className="text-green-700 font-bold text-xs">IN PROGRESS</AppText>





              </View>





            </View>





            <AppText className="text-gray-600 text-sm mb-3">Tap to view details and navigate</AppText>





            <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">





              <View>





                <AppText className="text-gray-600 text-xs">Delivery Fee</AppText>





                <AppText className="text-lg font-bold text-green-600">{activeOrder.deliveryFee}K</AppText>





              </View>





              <Feather name="chevron-right" size={24} color="#9CA3AF" />





            </View>





          </TouchableOpacity>





        </View>





      )}











      {/* Available Jobs */}





      {isOnline && availableOrders.length > 0 && (





        <View className="px-6 py-6">





          <View className="flex-row items-center justify-between mb-4">





            <AppText className="text-lg font-bold text-gray-900">Available Jobs</AppText>





            <TouchableOpacity onPress={handleRefresh}>





              {refreshing ? (





                <ActivityIndicator color="#16A34A" />





              ) : (





                <Feather name="refresh-cw" size={20} color="#16A34A" />





              )}





            </TouchableOpacity>





          </View>











          <FlatList





            data={availableOrders.slice(0, 5)}





            keyExtractor={(item) => item.id}





            scrollEnabled={false}





            renderItem={({ item }) => (





              <TouchableOpacity





                onPress={() => router.push(`/(tasker)/JobDetail?jobId=${item.id}`)}





                className="bg-white rounded-lg p-4 mb-3 border border-gray-200"





              >





                <View className="flex-row items-start justify-between mb-2">





                  <View className="flex-1">





                    <AppText className="text-lg font-bold text-gray-900 mb-1">





                      {item.title}





                    </AppText>





                    <AppText className="text-gray-600 text-sm line-clamp-2">





                      {item.description}





                    </AppText>





                  </View>





                  <View className="bg-green-100 rounded-lg px-3 py-1 ml-2">





                    <AppText className="text-green-700 font-bold">{item.estimatedPay}K</AppText>





                  </View>





                </View>





                <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">





                  <View className="flex-row items-center gap-4">





                    <View className="flex-row items-center">





                      <Feather name="map-pin" size={14} color="#6B7280" />





                      <AppText className="text-gray-600 text-xs ml-1">2.5 km away</AppText>





                    </View>





                    <View className="flex-row items-center">





                      <Feather name="clock" size={14} color="#6B7280" />





                      <AppText className="text-gray-600 text-xs ml-1">{item.estimatedTime}</AppText>





                    </View>





                  </View>





                  <Feather name="chevron-right" size={20} color="#9CA3AF" />





                </View>





              </TouchableOpacity>





            )}





          />











          {availableOrders.length > 5 && (





            <TouchableOpacity





              onPress={() => router.push('/(tasker)/AvailableJobsScreen')}





              className="bg-green-600 rounded-lg py-3 mt-2"





            >





              <AppText className="text-white text-center font-bold">View All {availableOrders.length} Jobs</AppText>





            </TouchableOpacity>





          )}





        </View>





      )}











      {/* Empty State */}





      {!isOnline && (





        <View className="px-6 py-12 items-center">





          <Feather name="pause-circle" size={64} color="#D1D5DB" />





          <AppText className="text-2xl font-bold text-gray-900 mt-4">You're Offline</AppText>





          <AppText className="text-gray-600 text-center mt-2">





            Go online to see available jobs and start earning





          </AppText>





        </View>





      )}











      {/* Quick Actions */}





      <View className="px-6 py-6">





        <AppText className="text-lg font-bold text-gray-900 mb-4">Quick Actions</AppText>





        <View className="gap-3">





          <TouchableOpacity





            onPress={() => router.push('/(tasker)/EarningsScreen')}





            className="bg-white rounded-lg p-4 flex-row items-center border border-gray-200"





          >





            <View className="w-12 h-12 bg-green-100 rounded-lg items-center justify-center mr-4">





              <Feather name="dollar-sign" size={24} color="#16A34A" />





            </View>





            <View className="flex-1">





              <AppText className="text-lg font-bold text-gray-900">Earnings</AppText>





              <AppText className="text-gray-600 text-sm">View detailed earnings</AppText>





            </View>





            <Feather name="chevron-right" size={20} color="#9CA3AF" />





          </TouchableOpacity>











          <TouchableOpacity





            onPress={() => router.push('/(tasker)/TaskerOrders')}





            className="bg-white rounded-lg p-4 flex-row items-center border border-gray-200"





          >





            <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-4">





              <Feather name="list" size={24} color="#2563EB" />





            </View>





            <View className="flex-1">





              <AppText className="text-lg font-bold text-gray-900">Delivery History</AppText>





              <AppText className="text-gray-600 text-sm">View past deliveries</AppText>





            </View>





            <Feather name="chevron-right" size={20} color="#9CA3AF" />





          </TouchableOpacity>





        </View>





      </View>





    </ScrollView>





  );





}


















export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

