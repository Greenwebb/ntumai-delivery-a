// @ts-nocheck
/**
 * DeliveryProofCapture - Photo and signature capture for delivery proof
 * Taskers use this to document successful deliveries
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export interface DeliveryProof {
  photos: string[];
  signature?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: string;
  notes?: string;
}

interface DeliveryProofCaptureProps {
  onProofCaptured: (proof: DeliveryProof) => void;
  onCancel: () => void;
}

export function DeliveryProofCapture({
  onProofCaptured,
  onCancel,
}: DeliveryProofCaptureProps) {
  const colors = useColors();
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to take delivery photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const captureSignature = () => {
    // TODO: Implement signature capture with react-native-signature-canvas or similar
    // For now, show a placeholder
    Alert.alert(
      'Signature Capture',
      'Signature capture will be implemented with a signature pad component.',
      [
        {
          text: 'Mock Signature',
          onPress: () => setSignature('mock-signature-data'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const captureGPSLocation = async (): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null> => {
    try {
      setIsCapturingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to verify delivery location.'
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
      };
    } catch (error) {
      console.error('Error capturing GPS location:', error);
      Alert.alert('Error', 'Failed to get GPS location. Please try again.');
      return null;
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please take at least one photo of the delivery.');
      return;
    }

    const gpsLocation = await captureGPSLocation();
    if (!gpsLocation) {
      Alert.alert(
        'GPS Required',
        'GPS verification is required for delivery proof. Please enable location services.',
        [{ text: 'OK' }]
      );
      return;
    }

    const proof: DeliveryProof = {
      photos,
      signature: signature || undefined,
      gpsLocation,
      timestamp: new Date().toISOString(),
      notes: notes || undefined,
    };

    onProofCaptured(proof);
  };

  const isValid = photos.length > 0;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-3 border-b border-border">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-lg font-bold text-foreground">Delivery Proof</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Instructions */}
        <View className="bg-primary/10 rounded-lg p-4 mb-6">
          <View className="flex-row gap-2">
            <Feather name="info" size={20} color={colors.primary} style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-1">
                Delivery Verification Required
              </Text>
              <Text className="text-xs text-muted">
                • Take photos of the delivered items{'\n'}
                • Capture customer signature (optional){'\n'}
                • GPS location will be automatically recorded
              </Text>
            </View>
          </View>
        </View>

        {/* Photos Section */}
        <View className="mb-6">
          <Text className="text-base font-bold text-foreground mb-3">
            Delivery Photos *
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {/* Existing Photos */}
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <Pressable
                  onPress={() => removePhoto(index)}
                  style={[styles.removeButton, { backgroundColor: colors.error }]}
                >
                  <Feather name="x" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}

            {/* Add Photo Button */}
            {photos.length < 4 && (
              <Pressable
                onPress={takePhoto}
                style={({ pressed }) => [
                  styles.addPhotoButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="camera" size={32} color={colors.muted} />
                <Text className="text-xs text-muted mt-2">Add Photo</Text>
              </Pressable>
            )}
          </View>

          <Text className="text-xs text-muted mt-2">
            {photos.length}/4 photos • At least 1 photo required
          </Text>
        </View>

        {/* Signature Section */}
        <View className="mb-6">
          <Text className="text-base font-bold text-foreground mb-3">
            Customer Signature (Optional)
          </Text>

          {signature ? (
            <View style={[styles.signaturePreview, { backgroundColor: colors.surface }]}>
              <Text className="text-sm text-success mb-2">✓ Signature Captured</Text>
              <Pressable
                onPress={() => setSignature(null)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-sm text-error">Remove Signature</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={captureSignature}
              style={({ pressed }) => [
                styles.signatureButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="edit-3" size={24} color={colors.primary} />
              <Text className="text-sm text-foreground mt-2">Capture Signature</Text>
            </Pressable>
          )}
        </View>

        {/* Notes Section */}
        <View className="mb-6">
          <Text className="text-base font-bold text-foreground mb-3">
            Delivery Notes (Optional)
          </Text>
          <View
            style={[
              styles.notesInput,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text className="text-sm text-foreground">
              {notes || 'Add any additional notes about the delivery...'}
            </Text>
          </View>
        </View>

        {/* GPS Info */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <View className="flex-row items-center gap-2">
            <Feather name="map-pin" size={20} color={colors.success} />
            <Text className="text-sm text-foreground flex-1">
              GPS location will be captured when you submit
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="px-4 py-4 border-t border-border">
        <Pressable
          onPress={handleSubmit}
          disabled={!isValid || isCapturingLocation}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: isValid && !isCapturingLocation ? colors.primary : colors.muted,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text className="text-base font-semibold text-white text-center">
            {isCapturingLocation ? 'Capturing GPS Location...' : 'Submit Delivery Proof'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signaturePreview: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signatureButton: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 80,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
  },
});
