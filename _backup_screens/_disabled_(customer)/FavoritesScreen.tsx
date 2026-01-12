// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, FlatList, Platform, Pressable , Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { useFavoritesStore } from '@/stores/favorites-store';
import { useToast } from '@/lib/toast-provider';
import * as Haptics from 'expo-haptics';

interface FavoriteProduct { id: string;
  name: string;
  vendor: string;
  price: number;
  image?: string;
  category: string;
  inStock: boolean;
  lastOrdered?: string;
  orderCount: number; }

// Mock favorites data
const MOCK_FAVORITES: FavoriteProduct[] = [
  { id: '1', name: 'Nshima Meal Pack', vendor: 'Mama Kitchen', price: 45, category: 'Food', inStock: true, lastOrdered: '2 days ago', orderCount: 12 },
  { id: '2', name: 'Fresh Kapenta', vendor: 'Soweto Market', price: 85, category: 'Groceries', inStock: true, lastOrdered: '1 week ago', orderCount: 8 },
  { id: '3', name: 'Mosi Lager 6-Pack', vendor: 'Shoprite Manda Hill', price: 120, category: 'Drinks', inStock: true, lastOrdered: '3 days ago', orderCount: 15 },
  { id: '4', name: 'Village Chicken', vendor: 'Lusaka Farms', price: 95, category: 'Food', inStock: false, lastOrdered: '2 weeks ago', orderCount: 5 },
  { id: '5', name: 'Chibwantu', vendor: 'Traditional Brews', price: 25, category: 'Drinks', inStock: true, lastOrdered: '5 days ago', orderCount: 20 },
  { id: '6', name: 'Vitumbuwa (10 pcs)', vendor: 'Street Delights', price: 30, category: 'Snacks', inStock: true, lastOrdered: '1 day ago', orderCount: 25 },
];

type SortOption = 'recent' | 'frequent' | 'name' | 'price';

export default function FavoritesScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(MOCK_FAVORITES);
  const [sortBy, setSortBy] = useState<SortOption>('frequent');
  const [showSortModal, setShowSortModal] = useState(false);
  const sortOptions: { id: SortOption; label: string; icon: string }[] = [
    { id: 'frequent', label: 'Most Ordered', icon: 'trending-up' },
    { id: 'recent', label: 'Recently Ordered', icon: 'clock' },
    { id: 'name', label: 'Name (A-Z)', icon: 'type' },
    { id: 'price', label: 'Price (Low to High)', icon: 'dollar-sign' },
  ];
  const getSortedFavorites = () => { const sorted = [...favorites];
    switch (sortBy) { case 'frequent':
        return sorted.sort((a, b) => b.orderCount - a.orderCount);
      case 'recent':
        return sorted; // Already sorted by recent in mock
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      default:
        return sorted; } };
  const handleAddToCart = (product: FavoriteProduct) =>  {
    if (!product.inStock) { toast.info('This item is currently unavailable');
      return; }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toast.info('Added to Cart', `${product.name} has been added to your cart`); };
  const handleRemoveFavorite = (productId: string) => { toast.info(
      'Remove Favorite',
      'Are you sure you want to remove this item from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove',
          style: 'destructive',
          onPress: () =>  {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFavorites(prev => prev.filter(f => f.id !== productId)); }},
      ]
    ); };
  const handleQuickReorder = (product: FavoriteProduct) =>  {
    if (!product.inStock) { toast.info('This item is currently unavailable');
      return; }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.info(
      'Quick Reorder',
      `Order ${product.name} from ${product.vendor}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Order Now', onPress: () => router.push('/(customer)/CheckoutScreen') },
      ]
    ); };
  const formatCurrency = (amount: number) => `K${amount.toFixed(2)}`;
  const renderFavoriteItem = ({ item }: { item: FavoriteProduct }) => (
    <View className={`mx-4 mb-3 bg-surface rounded-2xl overflow-hidden border border-border ${!item.inStock ? 'opacity-60' : ''}`}>
      <View className="flex-row p-4">
        {/* Product Image Placeholder */}
        <View className="w-20 h-20 bg-primary/10 rounded-xl items-center justify-center">
          <Feather name="package" size={32} color="#009688" />
        </View>

        {/* Product Info */}
        <View className="flex-1 ml-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-base font-semibold text-foreground" numberOfLines={1}>{item.name}</Text>
              <Text className="text-sm text-muted mt-0.5">{item.vendor}</Text>
            </View>
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleRemoveFavorite(item.id)}
              className="p-1"
            >
              <Feather name="heart" size={20} color="#EF4444" />
            </Pressable>
          </View>

          <View className="flex-row items-center mt-2">
            <Text className="text-lg font-bold text-primary">{formatCurrency(item.price)}</Text>
            {!item.inStock && (
              <View className="ml-2 bg-error/10 px-2 py-0.5 rounded">
                <Text className="text-xs text-error font-medium">Out of Stock</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center mt-1">
            <Feather name="repeat" size={12} color="#6B7280" />
            <Text className="text-xs text-muted ml-1">Ordered {item.orderCount} times</Text>
            {item.lastOrdered && (
              <>
                <Text className="text-xs text-muted mx-1">•</Text>
                <Text className="text-xs text-muted">Last: {item.lastOrdered}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row border-t border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleAddToCart(item)}
          disabled={!item.inStock}
          className="flex-1 flex-row items-center justify-center py-3 border-r border-border"
        >
          <Feather name="shopping-cart" size={16} color={item.inStock ? '#009688' : '#9CA3AF'} />
          <Text className={`ml-2 text-sm font-medium ${item.inStock ? 'text-primary' : 'text-muted'}`}>Add to Cart</Text>
        </Pressable>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleQuickReorder(item)}
          disabled={!item.inStock}
          className="flex-1 flex-row items-center justify-center py-3"
        >
          <Feather name="zap" size={16} color={item.inStock ? '#F59E0B' : '#9CA3AF'} />
          <Text className={`ml-2 text-sm font-medium ${item.inStock ? 'text-warning' : 'text-muted'}`}>Quick Reorder</Text>
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
        <Text className="text-lg font-semibold text-foreground">My Favorites</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowSortModal(true)} className="p-2 -mr-2">
          <Feather name="sliders" size={20} color="#6B7280" />
        </Pressable>
      </View>

      {/* Stats Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <View className="flex-row items-center">
          <Feather name="heart" size={16} color="#EF4444" />
          <Text className="ml-2 text-sm text-muted">{favorites.length} favorites</Text>
        </View>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowSortModal(true)} className="flex-row items-center">
          <Text className="text-sm text-primary mr-1">
            {sortOptions.find(o => o.id === sortBy)?.label}
          </Text>
          <Feather name="chevron-down" size={16} color="#009688" />
        </Pressable>
      </View>

      {/* Favorites List */}
      {favorites.length > 0 ? (
        <FlatList
          data={getSortedFavorites()}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4">
            <Feather name="heart" size={40} color="#D1D5DB" />
          </View>
          <Text className="text-lg font-semibold text-foreground text-center">No Favorites Yet</Text>
          <Text className="text-sm text-muted text-center mt-2">
            Tap the heart icon on products to add them to your favorites for quick reordering
          </Text>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.push('/(customer)/Marketplace')}
            className="mt-6 bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-base font-semibold text-white">Browse Marketplace</Text>
          </Pressable>
        </View>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl">
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-border rounded-full" />
            </View>
            <Text className="text-lg font-semibold text-foreground px-4 mb-2">Sort By</Text>
            {sortOptions.map((option) => (
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={option.id}
                onPress={() => { setSortBy(option.id);
                  setShowSortModal(false);
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                className={`flex-row items-center px-4 py-4 ${sortBy === option.id ? 'bg-primary/5' : ''}`}
              >
                <Feather name={option.icon} size={20} color={sortBy === option.id ? '#009688' : '#6B7280'} />
                <Text className={`flex-1 ml-3 text-base ${sortBy === option.id ? 'text-primary font-medium' : 'text-foreground'}`}>
                  {option.label}
                </Text>
                {sortBy === option.id && <Feather name="check" size={20} color="#009688" />}
              </Pressable>
            ))}
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowSortModal(false)}
              className="mx-4 my-4 py-3 rounded-xl bg-surface items-center"
            >
              <Text className="text-base font-semibold text-foreground">Cancel</Text>
            </Pressable>
            <View className="h-8" />
          </View>
        </View>
      )}
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

