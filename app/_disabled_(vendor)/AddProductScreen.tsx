// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useState } from 'react';
import { View, ScrollView, Platform, Switch, KeyboardAvoidingView, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter } from 'expo-router';
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

export default function AddProductScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [inStock, setInStock] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      'Product Added',
      `${name} has been added to your catalog.`,
      [{ text: 'Done', onPress: () => router.back() }]
    );

    setIsSubmitting(false); };

  return (
    <ScreenContainer className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
          <Feather name="x" size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Add Product</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          <View className="items-center py-6">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => { toast.info(
                  'Add Photo',
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
                  <Feather name="camera" size={32} color="#9CA3AF" />
                  <Text className="text-sm text-muted mt-2">Add Photo</Text>
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
            <Text className="text-sm font-medium text-foreground mb-2">Initial Quantity</Text>
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

          {/* Tips */}
          <View className="bg-primary/10 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Feather name="info" size={16} color="#009688" />
              <Text className="ml-2 text-sm font-semibold text-primary">Tips for better sales</Text>
            </View>
            <Text className="text-sm text-foreground leading-5">
              • Use clear, high-quality photos{'\n'}
              • Write detailed descriptions{'\n'}
              • Set competitive prices{'\n'}
              • Keep stock levels updated
            </Text>
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
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

