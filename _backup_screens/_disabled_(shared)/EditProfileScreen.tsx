// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import { useState } from 'react';

import { View, ScrollView, Image, Pressable, TextInput } from 'react-native';

import { useRouter } from 'expo-router';

import { useAuthStore } from '@/src/store';
import { useToast } from '@/lib/toast-provider';

import { Feather } from '@expo/vector-icons';

export default function EditProfileScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: user?.firstName || '',

    lastName: user?.lastName || '',

    email: user?.email || '',

    phone: user?.phone || '',

    bio: user?.bio || ''});
  const handleSave = async () =>  {
    if (!formData.firstName || !formData.lastName || !formData.email) { toast.error('Please fill in all required fields');

      return; }

    setIsLoading(true);

    try { await updateProfile(formData);

      toast.success('Profile updated successfully');

      router.back(); } catch (error: any) { toast.error(error.message || 'Failed to update profile'); } finally { setIsLoading(false); } };

  return (

    <View className="flex-1 bg-background">

      {/* Header */}

      <View className="px-6 py-4 border-b border-border flex-row items-center">

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mr-4">

          <Feather name="chevron-left" size={24} color="#1F2937" />

        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Edit Profile</Text>

      </View>

      <ScrollView className="flex-1">

        {/* Profile Picture */}

        <View className="px-6 py-8 items-center border-b border-border">

          <View className="relative mb-4">

            <Image

              source={{ uri: user?.avatar }}

              className="w-24 h-24 rounded-full"

            />

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="absolute bottom-0 right-0 bg-primary rounded-full p-3">

              <Feather name="camera" size={16} color="white" />

            </Pressable>

          </View>

          <Text className="text-muted text-sm">Tap to change photo</Text>

        </View>

        {/* Form Fields */}

        <View className="px-6 py-6">

          {/* First Name */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">First Name *</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="First name"

              value={formData.firstName}

              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Last Name */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Last Name *</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="Last name"

              value={formData.lastName}

              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Email */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Email *</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="Email address"

              value={formData.email}

              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}

              keyboardType="email-address"

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Phone */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Phone</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="Phone number"

              value={formData.phone}

              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}

              keyboardType="phone-pad"

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Bio */}

          <View className="mb-8">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Bio</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3 h-24"

              placeholder="Tell us about yourself"

              value={formData.bio}

              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}

              multiline

              placeholderTextColor="#9CA3AF"

            />

          </View>

        </View>

      </ScrollView>

      {/* Action Buttons */}

      <View className="px-6 py-6 border-t border-border gap-3">

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSave}

          disabled={isLoading}

          className={`rounded-lg py-4 flex-row items-center justify-center ${ isLoading ? 'bg-gray-300' : 'bg-primary' }`}

        >

          {isLoading ? (

            <ActivityIndicator color="white" />

          ) : (

            <>

              <Feather name="save" size={20} color="white" />

              <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>

            </>

          )}

        </Pressable>

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()}

          className="bg-surface rounded-lg py-4"

        >

          <Text className="text-foreground text-center font-bold text-lg">Cancel</Text>

        </Pressable>

      </View>

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

