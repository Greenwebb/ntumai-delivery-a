// @ts-nocheck
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, RefreshControl, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react-native';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Nshima with Beef Stew',
    description: 'Traditional Zambian staple with tender beef',
    price: 45,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
    category: 'Main Dishes',
    available: true,
  },
  {
    id: '2',
    name: 'Chibwabwa',
    description: 'Pumpkin leaves cooked in groundnut sauce',
    price: 25,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
    category: 'Vegetables',
    available: true,
  },
  {
    id: '3',
    name: 'Chicken & Chips',
    description: 'Crispy fried chicken with golden fries',
    price: 65,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200',
    category: 'Main Dishes',
    available: false,
  },
];

export default function VendorProductsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const toggleAvailability = (id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, available: !p.available } : p))
    );
  };

  const renderProduct = (product: typeof MOCK_PRODUCTS[0]) => (
    <Card key={product.id} className="mb-3 p-4">
      <View className="flex-row">
        <Image
          source={{ uri: product.image }}
          className="w-20 h-20 rounded-lg"
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text variant="h4" weight="bold" numberOfLines={1}>{product.name}</Text>
              <Text variant="bodySmall" color="muted" numberOfLines={2}>{product.description}</Text>
            </View>
            <Switch
              value={product.available}
              onValueChange={() => toggleAvailability(product.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={product.available ? '#fff' : '#f4f3f4'}
            />
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Text variant="h4" weight="bold" className="text-primary">K{product.price}</Text>
            <View className="flex-row">
              <TouchableOpacity
                className="p-2 mr-2 bg-surface rounded-lg"
                onPress={() => router.push(`/(vendor)/EditProductScreen?id=${product.id}`)}
              >
                <Edit2 size={18} color={colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 bg-red-100 rounded-lg">
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenContainer>
      <View className="px-4 pt-6 pb-4 flex-row items-center justify-between">
        <View>
          <Text variant="h1" weight="bold">Products</Text>
          <Text variant="body" color="muted" className="mt-1">
            {products.length} items in your menu
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary p-3 rounded-xl"
          onPress={() => router.push('/(vendor)/AddProductScreen')}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={colors.primary} />
        }
      >
        {products.length > 0 ? (
          products.map(renderProduct)
        ) : (
          <View className="items-center justify-center py-16">
            <Package size={48} color={colors.muted} strokeWidth={1.5} />
            <Text variant="h4" weight="medium" color="muted" className="mt-4">No Products</Text>
            <Text variant="body" color="muted" className="mt-2 text-center">
              Add your first product to start selling
            </Text>
            <TouchableOpacity
              className="bg-primary px-6 py-3 rounded-xl mt-4"
              onPress={() => router.push('/(vendor)/AddProductScreen')}
            >
              <Text variant="body" weight="bold" className="text-white">Add Product</Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

