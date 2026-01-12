// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform, Switch, KeyboardAvoidingView, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
  const CATEGORIES = [
  { id: 'main', label: 'Main Dishes', icon: 'coffee' },
  { id: 'snacks', label: 'Snacks', icon: 'box' },
  { id: 'beverages', label: 'Beverages', icon: 'droplet' },
  { id: 'desserts', label: 'Desserts', icon: 'heart' },
  { id: 'groceries', label: 'Groceries', icon: 'shopping-bag' },
  { id: 'other', label: 'Other', icon: 'grid' },
];

// Mock product data (would come from API in real app)
const MOCK_PRODUCTS = { 'prod-001': { id: 'prod-001',
    name: 'Nshima with Chicken',
    description: 'Traditional Zambian meal with grilled chicken and vegetables',
    price: 65,
    category: 'main',
    inStock: true,
    quantity: 50},
  'prod-002': { id: 'prod-002',
    name: 'Beef Stew',
    description: 'Slow-cooked beef in rich tomato gravy',
    price: 55,
    category: 'main',
    inStock: true,
    quantity: 30}};

export default function EditProductScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { productId } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inStock, setInStock] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { // Load product data
    loadProduct(); }, [productId]);
  const loadProduct = async () => { setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  const product = MOCK_PRODUCTS[productId as string];
    if (product) { setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setCategory(product.category);
      setQuantity(product.quantity.toString());
      setInStock(product.inStock); }
    setIsLoading(false); };
  const handlePickImage = async () => { const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { toast.info('Please allow access to your photo library.');
      return; }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8});

    if (!result.canceled && result.assets[0]) { setImageUri(result.assets[0].uri);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } };
  const handleTakePhoto = async () => { const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { toast.info('Please allow access to your camera.');
      return; }
  const result = await ImagePicker.launchCameraAsync({ allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8});

    if (!result.canceled && result.assets[0]) { setImageUri(result.assets[0].uri);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } };
  const handleSubmit = async () => { // Validation
    if (!name.trim()) { toast.error('Please enter a product name.');
      return; }
    if (!price.trim() || isNaN(parseFloat(price))) { toast.error('Please enter a valid price.');
      return; }
    if (!category) { toast.error('Please select a category.');
      return; }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    toast.info(
      'Product Updated',
      `${name} has been updated successfully.`,
      [{ text: 'Done', onPress: () => router.back() }]
    );

    setIsSubmitting(false); };
  const handleDelete = () => { toast.info(
      'Delete Product',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete',
          style: 'destructive',
          onPress: async () => { // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back(); }},
      ]
    ); };

  if (isLoading) { return (
      <ScreenContainer className="bg-background">
        <View className="flex-1 items-center justify-center">
          <Feather name="loader" size={32} color="#009688" />
          <Text className="text-base text-muted mt-4">Loading product...</Text>
        </View>
      </ScreenContainer>
    ); }

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Edit Product</Text>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleDelete} className="p-2 -mr-2">
          <Feather name="trash-2" size={24} color="#EF4444" />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          <View className="items-center py-6">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => { toast.info(
                  'Change Photo',
                  'Choose an option',
                  [
                    { text: 'Take Photo', onPress: handleTakePhoto },
                    { text: 'Choose from Library', onPress: handlePickImage },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                ); }}
              className="w-32 h-32 bg-surface rounded-2xl items-center justify-center border-2 border-dashed border-border"
            >
              {imageUri ? (
                <View className="w-full h-full rounded-2xl overflow-hidden">
                  <View className="w-full h-full bg-primary/10 items-center justify-center">
                    <Feather name="check" size={40} color="#009688" />
                    <Text className="text-xs text-primary mt-1">Image Selected</Text>
                  </View>
                </View>
              ) : (
                <>
                  <Feather name="image" size={32} color="#9CA3AF" />
                  <Text className="text-sm text-muted mt-2">Change Photo</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Product Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Product Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Nshima with Chicken"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your product..."
              multiline
              numberOfLines={3}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground min-h-[80px]"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Price (ZMW) *</Text>
            <View className="flex-row items-center bg-surface border border-border rounded-xl px-4">
              <Text className="text-lg font-semibold text-muted">K</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="flex-1 py-3 ml-2 text-base text-foreground"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Category *</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  className={`flex-row items-center px-4 py-2 rounded-xl border ${ category === cat.id ? 'bg-primary border-primary' : 'bg-surface border-border' }`}
                >
                  <Feather name={cat.icon} size={16} color={category === cat.id ? '#FFFFFF' : '#6B7280'} />
                  <Text className={`ml-2 text-sm font-medium ${category === cat.id ? 'text-white' : 'text-muted'}`}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Current Quantity</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g., 50"
              keyboardType="number-pad"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Stock Status */}
          <View className="flex-row items-center justify-between bg-surface rounded-xl p-4 mb-6 border border-border">
            <View>
              <Text className="text-base font-medium text-foreground">Available for Sale</Text>
              <Text className="text-sm text-muted">Toggle off to hide from customers</Text>
            </View>
            <Switch
              value={inStock}
              onValueChange={setInStock}
              trackColor={{ false: '#E5E7EB', true: '#009688' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Last Updated Info */}
          <View className="bg-surface rounded-xl p-4 mb-6 border border-border">
            <View className="flex-row items-center">
              <Feather name="clock" size={16} color="#6B7280" />
              <Text className="ml-2 text-sm text-muted">Last updated: Today at 10:30 AM</Text>
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-8">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSubmit}
          disabled={isSubmitting}
          className={`py-4 rounded-xl items-center ${isSubmitting ? 'bg-muted' : 'bg-primary'}`}
        >
          <Text className="text-base font-semibold text-white">
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

