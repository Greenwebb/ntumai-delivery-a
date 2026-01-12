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

import { View, ScrollView, FlatList, Image, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { Feather } from '@expo/vector-icons';

export default function ManageProductsScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [products, setProducts] = useState([

    { id: '1',

      name: 'Burger Deluxe',

      price: 25,

      image: 'https://via.placeholder.com/100',

      category: 'Burgers',

      inStock: true,

      rating: 4.8,

      orders: 245},

    { id: '2',

      name: 'Fried Chicken',

      price: 20,

      image: 'https://via.placeholder.com/100',

      category: 'Chicken',

      inStock: true,

      rating: 4.6,

      orders: 189},

    { id: '3',

      name: 'Pizza Margherita',

      price: 30,

      image: 'https://via.placeholder.com/100',

      category: 'Pizza',

      inStock: false,

      rating: 4.9,

      orders: 312},

  ]);
  const [filterCategory, setFilterCategory] = useState('all');
  const categories = ['all', 'Burgers', 'Chicken', 'Pizza', 'Drinks'];
  const filteredProducts = filterCategory === 'all'

    ? products

    : products.filter(p => p.category === filterCategory);
  const handleToggleStock = (id: string) => { setProducts(products.map(p =>

      p.id === id ? { ...p, inStock: !p.inStock } : p

    )); };
  const handleDeleteProduct = (id: string) => { toast.info('Are you sure you want to delete this product?'); };

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

          <Text className="text-2xl font-bold text-foreground">Products</Text>

          <Text className="text-muted text-sm">{filteredProducts.length} items</Text>

        </View>

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(vendor)/AddProductScreen')}

          className="bg-primary rounded-lg p-3"

        >

          <Feather name="plus" size={20} color="white" />

        </Pressable>

      </View>

      {/* Category Filter */}

      <View className="bg-background border-b border-border px-6 py-4">

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">

          {categories.map(cat => (

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={cat}

              onPress={() => setFilterCategory(cat)}

              className={`px-4 py-2 rounded-full ${ filterCategory === cat

                  ? 'bg-primary'

                  : 'bg-surface' }`}

            >

              <Text className={`font-semibold capitalize ${ filterCategory === cat ? 'text-white' : 'text-gray-700' }`}>

                {cat}

              </Text>

            </Pressable>

          ))}

        </ScrollView>

      </View>

      {/* Products List */}

      <FlatList

        data={filteredProducts}

        keyExtractor={(item) => item.id}

        renderItem={({ item }) => (

          <View className="px-6 py-4 border-b border-gray-100">

            <View className="flex-row items-start">

              {/* Product Image */}

              <Image

                source={{ uri: item.image }}

                className="w-20 h-20 rounded-lg mr-4 bg-gray-200"

              />

              {/* Product Info */}

              <View className="flex-1">

                <View className="flex-row items-start justify-between mb-2">

                  <View className="flex-1">

                    <Text className="text-lg font-bold text-foreground">{item.name}</Text>

                    <Text className="text-muted text-sm">{item.category}</Text>

                  </View>

                  <Text className="text-2xl font-bold text-primary">{item.price}K</Text>

                </View>

                {/* Stats */}

                <View className="flex-row items-center gap-4 mb-3">

                  <View className="flex-row items-center">

                    <Feather name="star" size={14} color="#FCD34D" fill="#FCD34D" />

                    <Text className="text-gray-700 text-xs ml-1">{item.rating}</Text>

                  </View>

                  <View className="flex-row items-center">

                    <Feather name="shopping-bag" size={14} color="#6B7280" />

                    <Text className="text-muted text-xs ml-1">{item.orders} orders</Text>

                  </View>

                </View>

                {/* Stock Toggle */}

                <View className="flex-row items-center justify-between">

                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleToggleStock(item.id)}

                    className={`flex-1 py-2 rounded-lg mr-2 flex-row items-center justify-center ${ item.inStock ? 'bg-green-100' : 'bg-red-100' }`}

                  >

                    <Feather

                      name={item.inStock ? 'check-circle' : 'x-circle'}

                      size={16}

                      color={item.inStock ? '#16A34A' : '#EF4444'}

                    />

                    <Text className={`text-xs font-bold ml-1 ${ item.inStock ? 'text-green-700' : 'text-red-700' }`}>

                      {item.inStock ? 'In Stock' : 'Out of Stock'}

                    </Text>

                  </Pressable>

                  {/* Edit Button */}

                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push(`/(vendor)/EditProductScreen?productId=${item.id}`)}

                    className="bg-blue-100 py-2 px-3 rounded-lg mr-2"

                  >

                    <Feather name="edit-2" size={16} color="#2563EB" />

                  </Pressable>

                  {/* Delete Button */}

                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDeleteProduct(item.id)}

                    className="bg-red-100 py-2 px-3 rounded-lg"

                  >

                    <Feather name="trash-2" size={16} color="#EF4444" />

                  </Pressable>

                </View>

              </View>

            </View>

          </View>

        )}

      />

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

