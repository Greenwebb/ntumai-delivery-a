// @ts-nocheck

import AppText from '@/components/AppText';
import { useEffect, useState } from 'react';





import { View, TouchableOpacity, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';





import { useRouter, useLocalSearchParams } from 'expo-router';





import { useMarketplaceStore, useCartStore } from '@/src/store';





import { Feather } from '@expo/vector-icons';











export default function VendorDetail() {





  const router = useRouter();





  const { vendorId } = useLocalSearchParams();





  const { selectedVendor, getVendorDetail, fetchProducts, products, fetchCategories, categories, isLoading } = useMarketplaceStore();





  const { addItem } = useCartStore();





  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);











  useEffect(() => {





    if (vendorId) {





      getVendorDetail(vendorId as string);





      fetchProducts(vendorId as string);





      fetchCategories(vendorId as string);





    }





  }, [vendorId]);











  const handleAddToCart = (product: any) => {





    addItem({





      product,





      quantity: 1,





      specialInstructions: '',





    });





    // Show toast or confirmation





    alert('Added to cart!');





  };











  const filteredProducts = selectedCategory





    ? products.filter(p => p.category === selectedCategory)





    : products;











  if (isLoading || !selectedVendor) {





    return (





      <View className="flex-1 items-center justify-center bg-white">





        <ActivityIndicator size="large" color="#16A34A" />





      </View>





    );





  }











  return (





    <View className="flex-1 bg-white">





      {/* Header */}





      <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-6 py-4 bg-white/90 border-b border-gray-200">





        <TouchableOpacity onPress={() => router.back()}>





          <Feather name="chevron-left" size={24} color="#1F2937" />





        </TouchableOpacity>





        <TouchableOpacity onPress={() => router.push('/(customer)/Cart')}>





          <Feather name="shopping-cart" size={24} color="#1F2937" />





        </TouchableOpacity>





      </View>











      <ScrollView className="flex-1 pt-16">





        {/* Vendor Header Image */}





        <Image





          source={{ uri: selectedVendor.logo }}





          className="w-full h-48"





        />











        {/* Vendor Info */}





        <View className="px-6 py-6 border-b border-gray-200">





          <AppText className="text-3xl font-bold text-gray-900 mb-2">{selectedVendor.name}</AppText>





          <AppText className="text-gray-600 mb-4">{selectedVendor.description}</AppText>











          {/* Rating and Info */}





          <View className="flex-row items-center justify-between mb-4">





            <View className="flex-row items-center">





              <Feather name="star" size={18} color="#FCD34D" fill="#FCD34D" />





              <AppText className="text-gray-900 font-bold ml-2">{selectedVendor.rating}</AppText>





              <AppText className="text-gray-600 text-sm ml-1">({selectedVendor.reviewCount})</AppText>





            </View>





            <View className="flex-row items-center gap-4">





              <View className="flex-row items-center">





                <Feather name="clock" size={16} color="#6B7280" />





                <AppText className="text-gray-600 text-sm ml-1">{selectedVendor.deliveryTime}</AppText>





              </View>





              <View className="flex-row items-center">





                <Feather name="truck" size={16} color="#6B7280" />





                <AppText className="text-gray-600 text-sm ml-1">{selectedVendor.deliveryFee}K</AppText>





              </View>





            </View>





          </View>











          {/* Status */}





          <View className="flex-row items-center justify-between">





            <AppText className={`font-semibold ${





              selectedVendor.isOpen ? 'text-green-600' : 'text-red-600'





            }`}>





              {selectedVendor.isOpen ? 'â Open Now' : 'â Closed'}





            </AppText>





            <AppText className="text-gray-600 text-sm">Min order: {selectedVendor.minimumOrder}K</AppText>





          </View>





        </View>











        {/* Categories */}





        {categories.length > 0 && (





          <View className="px-6 py-4 border-b border-gray-200">





            <AppText className="text-sm font-semibold text-gray-700 mb-3">Categories</AppText>





            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">





              <TouchableOpacity





                onPress={() => setSelectedCategory(null)}





                className={`px-4 py-2 rounded-full ${





                  selectedCategory === null





                    ? 'bg-green-600'





                    : 'bg-gray-100'





                }`}





              >





                <AppText className={`font-semibold ${





                  selectedCategory === null ? 'text-white' : 'text-gray-700'





                }`}>





                  All





                </AppText>





              </TouchableOpacity>





              {categories.map(cat => (





                <TouchableOpacity





                  key={cat.id}





                  onPress={() => setSelectedCategory(cat.name)}





                  className={`px-4 py-2 rounded-full ${





                    selectedCategory === cat.name





                      ? 'bg-green-600'





                      : 'bg-gray-100'





                  }`}





                >





                  <AppText className={`font-semibold ${





                    selectedCategory === cat.name ? 'text-white' : 'text-gray-700'





                  }`}>





                    {cat.name}





                  </AppText>





                </TouchableOpacity>





              ))}





            </ScrollView>





          </View>





        )}











        {/* Products */}





        <View className="px-6 py-6">





          {filteredProducts.length > 0 ? (





            <FlatList





              data={filteredProducts}





              keyExtractor={(item) => item.id}





              scrollEnabled={false}





              renderItem={({ item }) => (





                <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">





                  <View className="flex-row">





                    <Image





                      source={{ uri: item.image }}





                      className="w-24 h-24 rounded-lg mr-4"





                    />





                    <View className="flex-1">





                      <AppText className="text-lg font-bold text-gray-900 mb-1">{item.name}</AppText>





                      <AppText className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</AppText>





                      <View className="flex-row items-center justify-between">





                        <AppText className="text-xl font-bold text-green-600">{item.price}K</AppText>





                        <View className="flex-row items-center">





                          <Feather name="star" size={14} color="#FCD34D" fill="#FCD34D" />





                          <AppText className="text-xs text-gray-600 ml-1">{item.rating}</AppText>





                        </View>





                      </View>





                    </View>





                  </View>





                  <TouchableOpacity





                    onPress={() => handleAddToCart(item)}





                    className="bg-green-600 rounded-lg py-3 mt-4"





                  >





                    <AppText className="text-white text-center font-bold">Add to Cart</AppText>





                  </TouchableOpacity>





                </View>





              )}





            />





          ) : (





            <View className="items-center justify-center py-12">





              <Feather name="inbox" size={48} color="#D1D5DB" />





              <AppText className="text-gray-600 text-center mt-4">No products available</AppText>





            </View>





          )}





        </View>





      </ScrollView>





    </View>





  );





}


















export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

