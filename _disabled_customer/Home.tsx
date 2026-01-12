// @ts-nocheck

import AppText from '@/components/AppText';
import { useEffect, useState } from 'react';





import { View, TouchableOpacity, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';





import { useRouter } from 'expo-router';





import { useAuthStore, useMarketplaceStore, useOrderStore, useNotificationStore } from '@/src/store';





import { Feather } from '@expo/vector-icons';











export default function CustomerHome() {





  const router = useRouter();





  const { user } = useAuthStore();


  const { fetchVendors, vendors, isLoading } = useMarketplaceStore();


  const { getOrders, orders } = useOrderStore();

  const { notifications, unreadCount } = useNotificationStore();

  useEffect(() => {


    // Fetch initial data

    fetchVendors();

    if (user?.id) {


      getOrders(user.id);





    }





  }, [user]);








  const handleNavigateToMarketplace = () => {





    router.push('/(customer)/Marketplace');





  };

  const handleNavigateToP2P = () => {





    router.push('/(customer)/SendParcelScreen');





  };
  const handleNavigateToTask = () => {





    router.push('/(customer)/DoTaskScreen');





  };
  const handleNavigateToNotifications = () => {





    router.push('/(customer)/NotificationHistoryScreen');





  };
  const handleNavigateToProfile = () => {





    router.push('/(shared)/ProfileScreen');





  };
  const recentOrders = orders.slice(0, 3);


  return (





    <ScrollView className="flex-1 bg-gray-50">





      {/* Header */}





      <View className="bg-white px-6 py-6 flex-row items-center justify-between border-b border-gray-200">





        <View>





          <AppText className="text-sm text-gray-600">Welcome back</AppText>


          <AppText className="text-2xl font-bold text-gray-900">{user?.firstName}</AppText>

        </View>

        <TouchableOpacity
          onPress={handleNavigateToNotifications}
          className="relative">

          <Feather name="bell" size={24} color="#1F2937" />



          {unreadCount > 0 && (





            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">





              <AppText className="text-white text-xs font-bold">{unreadCount}</AppText>





            </View>





          )}





        </TouchableOpacity>





      </View>











      {/* Main Services */}





      <View className="px-6 py-6">





        <AppText className="text-lg font-bold text-gray-900 mb-4">What would you like to do?</AppText>











        <View className="gap-3">





          {/* Marketplace */}





          <TouchableOpacity





            onPress={handleNavigateToMarketplace}





            className="bg-white rounded-xl p-4 flex-row items-center border border-gray-200"





          >





            <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-4">





              <Feather name="shopping-bag" size={24} color="#2563EB" />





            </View>





            <View className="flex-1">





              <AppText className="text-lg font-semibold text-gray-900">Order Food & Goods</AppText>





              <AppText className="text-sm text-gray-600">Browse restaurants and shops</AppText>





            </View>





            <Feather name="chevron-right" size={20} color="#9CA3AF" />





          </TouchableOpacity>











          {/* P2P Delivery */}





          <TouchableOpacity





            onPress={handleNavigateToP2P}





            className="bg-white rounded-xl p-4 flex-row items-center border border-gray-200"





          >





            <View className="w-12 h-12 bg-purple-100 rounded-lg items-center justify-center mr-4">





              <Feather name="send" size={24} color="#7C3AED" />





            </View>





            <View className="flex-1">





              <AppText className="text-lg font-semibold text-gray-900">Send a Parcel</AppText>





              <AppText className="text-sm text-gray-600">Fast peer-to-peer delivery</AppText>





            </View>





            <Feather name="chevron-right" size={20} color="#9CA3AF" />





          </TouchableOpacity>











          {/* Tasks/Errands */}





          <TouchableOpacity





            onPress={handleNavigateToTask}





            className="bg-white rounded-xl p-4 flex-row items-center border border-gray-200"





          >





            <View className="w-12 h-12 bg-orange-100 rounded-lg items-center justify-center mr-4">





              <Feather name="check-square" size={24} color="#EA580C" />





            </View>





            <View className="flex-1">





              <AppText className="text-lg font-semibold text-gray-900">Do a Task</AppText>





              <AppText className="text-sm text-gray-600">Shopping, errands & more</AppText>





            </View>





            <Feather name="chevron-right" size={20} color="#9CA3AF" />





          </TouchableOpacity>





        </View>





      </View>











      {/* Featured Vendors */}





      {vendors.length > 0 && (





        <View className="px-6 py-6">





          <View className="flex-row items-center justify-between mb-4">





            <AppText className="text-lg font-bold text-gray-900">Popular Vendors</AppText>





            <TouchableOpacity onPress={handleNavigateToMarketplace}>





              <AppText className="text-blue-600 font-semibold">See all</AppText>





            </TouchableOpacity>





          </View>











          <FlatList





            data={vendors.slice(0, 3)}





            keyExtractor={(item) => item.id}





            scrollEnabled={false}





            renderItem={({ item }) => (





              <TouchableOpacity





                onPress={() => router.push(`/(customer)/Marketplace?vendorId=${item.id}`)}





                className="bg-white rounded-xl p-4 mb-3 border border-gray-200"





              >





                <View className="flex-row items-center">





                  <View className="w-16 h-16 bg-gray-200 rounded-lg mr-4 overflow-hidden">





                    <Image





                      source={{ uri: item.logo }}





                      className="w-full h-full"





                    />





                  </View>





                  <View className="flex-1">





                    <AppText className="text-lg font-semibold text-gray-900">{item.name}</AppText>





                    <View className="flex-row items-center mt-1">





                      <Feather name="star" size={16} color="#FCD34D" fill="#FCD34D" />





                      <AppText className="text-sm text-gray-600 ml-1">





                        {item.rating} ({item.reviewCount})





                      </AppText>





                    </View>





                    <AppText className="text-xs text-gray-500 mt-1">





                      {item.deliveryTime} • {item.deliveryFee}K





                    </AppText>





                  </View>





                </View>





              </TouchableOpacity>





            )}





          />





        </View>





      )}











      {/* Recent Orders */}





      {recentOrders.length > 0 && (





        <View className="px-6 py-6">





          <View className="flex-row items-center justify-between mb-4">





            <AppText className="text-lg font-bold text-gray-900">Recent Orders</AppText>





            <TouchableOpacity onPress={() => router.push('/(customer)/OrderHistoryScreen')}>





              <AppText className="text-blue-600 font-semibold">View all</AppText>





            </TouchableOpacity>





          </View>











          <FlatList





            data={recentOrders}





            keyExtractor={(item) => item.id}





            scrollEnabled={false}





            renderItem={({ item }) => (





              <TouchableOpacity





                onPress={() => router.push(`/(customer)/OrderTracking?orderId=${item.id}`)}





                className="bg-white rounded-xl p-4 mb-3 border border-gray-200"





              >





                <View className="flex-row items-center justify-between mb-2">





                  <AppText className="text-lg font-semibold text-gray-900">Order #{item.id.slice(-4)}</AppText>





                  <View className={`px-3 py-1 rounded-full ${item.status === 'delivered' ? 'bg-green-100' : 'bg-yellow-100'





                    }`}>





                    <AppText className={`text-xs font-semibold ${item.status === 'delivered' ? 'text-green-700' : 'text-yellow-700'





                      }`}>





                      {item.status.toUpperCase()}





                    </AppText>





                  </View>





                </View>





                <AppText className="text-gray-600 text-sm mb-2">{item.totalAmount}K ZMW</AppText>





                <AppText className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</AppText>





              </TouchableOpacity>





            )}





          />





        </View>





      )}











      {/* Loading State */}





      {isLoading && (





        <View className="py-12 items-center">





          <ActivityIndicator size="large" color="#16A34A" />





        </View>





      )}











      {/* Profile Button */}





      <View className="px-6 py-6">





        <TouchableOpacity





          onPress={handleNavigateToProfile}





          className="bg-white rounded-xl p-4 flex-row items-center border border-gray-200"





        >





          <View className="w-12 h-12 bg-gray-200 rounded-full mr-4 overflow-hidden">





            <Image





              source={{ uri: user?.avatar }}





              className="w-full h-full"





            />





          </View>





          <View className="flex-1">





            <AppText className="text-lg font-semibold text-gray-900">My Profile</AppText>





            <AppText className="text-sm text-gray-600">View and edit your details</AppText>





          </View>





          <Feather name="chevron-right" size={20} color="#9CA3AF" />





        </TouchableOpacity>





      </View>





    </ScrollView>





  );





}












export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

