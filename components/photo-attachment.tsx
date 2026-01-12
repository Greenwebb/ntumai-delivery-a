// @ts-nocheck
import React from 'react';
import { View, Pressable, Image, ScrollView, Platform, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export interface PhotoAttachmentItem {
  id: string;
  uri: string;
  type: 'camera' | 'gallery';
}

interface PhotoAttachmentProps {
  photos: PhotoAttachmentItem[];
  onPhotosChange: (photos: PhotoAttachmentItem[]) => void;
  maxPhotos?: number;
  title?: string;
  description?: string;
}

/**
 * PhotoAttachment Component
 * 
 * Blueprint requirement: "Attach photos" for Do a Task service
 * Allows users to attach reference photos for their task.
 */
export function PhotoAttachment({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  title = 'Reference Photos',
  description = 'Add photos to help your tasker understand the task',
}: PhotoAttachmentProps) {
  const colors = useColors();

  const generateId = () => `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and photo library permissions to attach photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can only attach up to ${maxPhotos} photos.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: PhotoAttachmentItem = {
          id: generateId(),
          uri: result.assets[0].uri,
          type: 'camera',
        };
        onPhotosChange([...photos, newPhoto]);

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handlePickFromGallery = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can only attach up to ${maxPhotos} photos.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxPhotos - photos.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newPhotos: PhotoAttachmentItem[] = result.assets.map(asset => ({
          id: generateId(),
          uri: asset.uri,
          type: 'gallery' as const,
        }));
        onPhotosChange([...photos, ...newPhotos].slice(0, maxPhotos));

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error picking photos:', error);
      Alert.alert('Error', 'Failed to pick photos. Please try again.');
    }
  };

  const handleRemovePhoto = (id: string) => {
    onPhotosChange(photos.filter(photo => photo.id !== id));

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="bodySmall" color="muted">
          {photos.length}/{maxPhotos}
        </Text>
      </View>

      {description && (
        <Text variant="bodySmall" color="muted" className="mb-3">
          {description}
        </Text>
      )}

      {/* Photos grid */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        <View className="flex-row gap-3">
          {/* Add photo buttons */}
          {photos.length < maxPhotos && (
            <>
              <Pressable
                onPress={handleTakePhoto}
                className="w-24 h-24 rounded-xl bg-surface border-2 border-dashed border-border items-center justify-center"
              >
                <Feather name="camera" size={24} color={colors.muted} />
                <Text variant="caption" color="muted" className="mt-1">
                  Camera
                </Text>
              </Pressable>

              <Pressable
                onPress={handlePickFromGallery}
                className="w-24 h-24 rounded-xl bg-surface border-2 border-dashed border-border items-center justify-center"
              >
                <Feather name="image" size={24} color={colors.muted} />
                <Text variant="caption" color="muted" className="mt-1">
                  Gallery
                </Text>
              </Pressable>
            </>
          )}

          {/* Photo thumbnails */}
          {photos.map((photo) => (
            <View key={photo.id} className="relative">
              <Image
                source={{ uri: photo.uri }}
                className="w-24 h-24 rounded-xl"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => handleRemovePhoto(photo.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error items-center justify-center shadow-sm"
              >
                <Feather name="x" size={14} color="white" />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Empty state hint */}
      {photos.length === 0 && (
        <View className="py-2">
          <Text variant="caption" color="muted" className="text-center">
            Photos help taskers understand your task better
          </Text>
        </View>
      )}
    </View>
  );
}

export default PhotoAttachment;
