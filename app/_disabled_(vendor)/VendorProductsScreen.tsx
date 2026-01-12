// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, FlatList, Switch, Platform, Image, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Product { id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  inStock: boolean;
  quantity: number; }

// Mock products for vendor
const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-001',
    name: 'Nshima with Chicken',
    description: 'Traditional Zambian meal with grilled chicken and vegetables',
    price: 65,
    category: 'Main Dishes',
    inStock: true,
    quantity: 50},
  { id: 'prod-002',
    name: 'Beef Stew',
    description: 'Slow-cooked beef in rich tomato gravy',
    price: 55,
    category: 'Main Dishes',
    inStock: true,
    quantity: 30},
  { id: 'prod-003',
    name: 'Kapenta with Rice',
    description: 'Dried fish served with steamed rice',
    price: 45,
    category: 'Main Dishes',
    inStock: false,
    quantity: 0},
  { id: 'prod-004',
    name: 'Vitumbuwa',
    description: 'Sweet fried dough balls',
    price: 15,
    category: 'Snacks',
    inStock: true,
    quantity: 100},
  { id: 'prod-005',
    name: 'Maheu',
    description: 'Traditional fermented drink',
    price: 10,
    category: 'Beverages',
    inStock: true,
    quantity: 40},
];
  const CATEGORIES = ['All', 'Main Dishes', 'Snacks', 'Beverages', 'Desserts'];

export default function VendorProductsScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const filteredProducts = products.filter(product => { const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
  const matchesStock = showOutOfStock || product.inStock;
    return matchesSearch && matchesCategory && matchesStock; });
  const handleToggleStock = (productId: string) => { setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, inStock: !p.inStock } : p
      )
    );
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const handleDeleteProduct = (productId: string) => { toast.info(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete',
          style: 'destructive',
          onPress: () => { setProducts(prev => prev.filter(p => p.id !== productId));
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }},
      ]
    ); };
  const inStockCount = products.filter(p => p.inStock).length;
  const outOfStockCount = products.filter(p => !p.inStock).length;
  const renderProduct = ({ item }: { item: Product }) => (
    <View className={`bg-surface rounded-xl p-4 mb-3 border ${item.inStock ? 'border-border' : 'border-error/30'}`}>
      <View className="flex-row">
        {/* Product Image Placeholder */}
        <View className="w-20 h-20 bg-primary/10 rounded-xl items-center justify-center">
          <Feather name="package" size={32} color="#009688" />
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-sm text-muted mt-0.5" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-lg font-bold text-primary">K{item.price.toFixed(2)}</Text>
            <View className="flex-row items-center">
              <Text className={`text-xs mr-2 ${item.inStock ? 'text-success' : 'text-error'}`}>
                {item.inStock ? `In Stock (${item.quantity})` : 'Out of Stock'}
              </Text>
              <Switch
                value={item.inStock}
                onValueChange={() => handleToggleStock(item.id)}
                trackColor={{ false: '#E5E7EB', true: '#009688' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row mt-3 pt-3 border-t border-border gap-2">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push(`/(vendor)/EditProductScreen?productId=${item.id}`)}
          className="flex-1 flex-row items-center justify-center py-2 bg-primary/10 rounded-lg"
        >
          <Feather name="edit-2" size={16} color="#009688" />
          <Text className="ml-1 text-sm text-primary font-medium">Edit</Text>
        </Pressable>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDeleteProduct(item.id)}
          className="flex-1 flex-row items-center justify-center py-2 bg-error/10 rounded-lg"
        >
          <Feather name="trash-2" size={16} color="#EF4444" />
          <Text className="ml-1 text-sm text-error font-medium">Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">My Products</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(vendor)/AddProductScreen')}
          className="p-2 -mr-2"
        >
          <Feather name="plus" size={24} color="#009688" />
        </Pressable>
      </View>

      {/* Stats Bar */}
      <View className="flex-row px-4 py-3 bg-surface border-b border-border">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-foreground">{products.length}</Text>
          <Text className="text-xs text-muted">Total Products</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-success">{inStockCount}</Text>
          <Text className="text-xs text-muted">In Stock</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-error">{outOfStockCount}</Text>
          <Text className="text-xs text-muted">Out of Stock</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-surface rounded-xl px-3 py-2 border border-border">
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            className="flex-1 ml-2 text-base text-foreground"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pb-3"
        contentContainerStyle={{ gap: 8 }}
      >
        {CATEGORIES.map((category) => (
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={category}
            onPress={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full ${ selectedCategory === category ? 'bg-primary' : 'bg-surface border border-border' }`}
          >
            <Text className={`text-sm font-medium ${selectedCategory === category ? 'text-white' : 'text-muted'}`}>
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Show Out of Stock Toggle */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-border">
        <Text className="text-sm text-muted">Show out of stock items</Text>
        <Switch
          value={showOutOfStock}
          onValueChange={setShowOutOfStock}
          trackColor={{ false: '#E5E7EB', true: '#009688' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ <View className="items-center justify-center py-16">
            <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4">
              <Feather name="package" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">No Products Found</Text>
            <Text className="text-sm text-muted text-center">
              {searchQuery ? 'Try a different search term' : 'Add your first product to get started'}
            </Text>
          </View> }
      />
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

