// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useColors } from '@/hooks/use-colors';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  MessageCircle,
  CheckCircle,
  User,
  Star,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { isDemoMode } from '@/lib/config/demo-mode';
import { demoApi } from '@/lib/api/demo-api';

export default function TaskDetail() {
  const router = useRouter();
  const colors = useColors();
  const { taskId } = useLocalSearchParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      if (isDemoMode()) {
        // Mock task data
        const mockTask = {
          id: taskId,
          category: 'Shopping',
          title: 'Buy groceries from Shoprite',
          description: 'Need someone to buy groceries and deliver to my home',
          budget: 150,
          status: 'in_progress',
          createdAt: new Date().toISOString(),
          location: 'Kabulonga, Lusaka',
          tasker: {
            id: '1',
            name: 'John Mwale',
            phone: '+260971234567',
            rating: 4.8,
            completedTasks: 156,
            photo: 'https://i.pravatar.cc/150?img=12',
      },
          timeline: [
            { status: 'created', time: '10:30 AM', completed: true },
            { status: 'accepted', time: '10:35 AM', completed: true },
            { status: 'in_progress', time: '10:45 AM', completed: true },
            { status: 'completed', time: 'Pending', completed: false },
          ],
        };
        setTask(mockTask);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (task?.tasker?.phone) {
      Linking.openURL(`tel:${task.tasker.phone}`);
    }
  };

  const handleMessage = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(shared)/ChatScreen?userId=${task?.tasker?.id}&userName=${task?.tasker?.name}`);
  };

  const handleCompleteTask = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(
      'Complete Task',
      'Mark this task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            // TODO: Update task status
            router.push(`/(customer)/RateTaskerScreen?taskId=${taskId}&taskerId=${task?.tasker?.id}`);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text variant="body" color="muted">Loading task details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!task) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="h3" weight="bold" className="mb-2">Task Not Found</Text>
          <Text variant="body" color="muted" className="text-center mb-6">
            The task you're looking for doesn't exist.
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text variant="body" weight="bold" className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in_progress':
        return colors.primary;
      case 'pending':
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-6 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="h2" weight="bold">Task Details</Text>
          <Text variant="bodySmall" color="muted">#{task.id}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Status Card */}
        <Card className="p-4 mb-4" style={{ backgroundColor: `${getStatusColor(task.status)}20` }}>
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: getStatusColor(task.status) }}
            >
              <CheckCircle size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text variant="h4" weight="bold" style={{ color: getStatusColor(task.status) }}>
                {getStatusLabel(task.status)}
              </Text>
              <Text variant="bodySmall" color="muted">
                {task.status === 'in_progress' ? 'Your tasker is working on it' : 'Task status'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Task Info */}
        <Card className="p-4 mb-4">
          <Text variant="h4" weight="bold" className="mb-3">{task.title}</Text>
          <Text variant="body" color="muted" className="mb-4">{task.description}</Text>

          <View className="flex-row items-center mb-2">
            <MapPin size={16} color={colors.muted} />
            <Text variant="bodySmall" color="muted" className="ml-2">{task.location}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <DollarSign size={16} color={colors.success} />
            <Text variant="body" weight="bold" className="text-success ml-2">
              K {task.budget}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Clock size={16} color={colors.muted} />
            <Text variant="bodySmall" color="muted" className="ml-2">
              Created at {new Date(task.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        </Card>

        {/* Tasker Info */}
        {task.tasker && (
          <Card className="p-4 mb-4">
            <Text variant="h4" weight="bold" className="mb-3">Assigned Tasker</Text>
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: task.tasker.photo }}
                className="w-16 h-16 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text variant="body" weight="bold">{task.tasker.name}</Text>
                <View className="flex-row items-center mt-1">
                  <Star size={14} color={colors.warning} fill={colors.warning} />
                  <Text variant="bodySmall" color="muted" className="ml-1">
                    {task.tasker.rating} ({task.tasker.completedTasks} tasks)
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center"
                onPress={handleCall}
              >
                <Phone size={18} color="white" />
                <Text variant="bodySmall" weight="bold" className="text-white ml-2">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-surface py-3 rounded-xl flex-row items-center justify-center border border-border"
                onPress={handleMessage}
              >
                <MessageCircle size={18} color={colors.primary} />
                <Text variant="bodySmall" weight="bold" className="text-primary ml-2">Message</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Timeline */}
        <Card className="p-4 mb-4">
          <Text variant="h4" weight="bold" className="mb-4">Progress</Text>
          {task.timeline.map((item, index) => (
            <View key={index} className="flex-row items-start mb-4">
              <View className="items-center mr-3">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    item.completed ? 'bg-success' : 'bg-surface border-2 border-border'
                  }`}
                >
                  {item.completed && <CheckCircle size={16} color="white" />}
                </View>
                {index < task.timeline.length - 1 && (
                  <View className={`w-0.5 h-8 ${item.completed ? 'bg-success' : 'bg-border'}`} />
                )}
              </View>
              <View className="flex-1">
                <Text variant="body" weight="medium" className="capitalize">
                  {item.status.replace('_', ' ')}
                </Text>
                <Text variant="bodySmall" color="muted">{item.time}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Complete Button */}
        {task.status === 'in_progress' && (
          <TouchableOpacity
            className="bg-success py-4 rounded-xl items-center mb-6"
            onPress={handleCompleteTask}
          >
            <Text variant="body" weight="bold" className="text-white">Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

