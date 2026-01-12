// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { WorkflowStepper } from '@/components/workflow-stepper';
import { CommitmentAmount } from '@/components/commitment-amount';
import { ChecklistBuilder, ChecklistItem } from '@/components/checklist-builder';
import { PhotoAttachment, PhotoAttachmentItem } from '@/components/photo-attachment';
import { useState } from 'react';

import { View, ScrollView, Pressable, TextInput } from 'react-native';

import { useRouter } from 'expo-router';

import { useTaskStore } from '@/src/store';
import { useToast } from '@/lib/toast-provider';

import { Feather } from '@expo/vector-icons';

type TaskStep = 'category' | 'details' | 'budget' | 'confirmation';
  const TASK_CATEGORIES = [

  { id: 'shopping', label: 'Shopping', icon: 'ðï¸', description: 'Buy items from stores' },

  { id: 'cleaning', label: 'Cleaning', icon: 'ð§¹', description: 'Home cleaning services' },

  { id: 'moving', label: 'Moving', icon: 'ð¦', description: 'Help with moving' },

  { id: 'handyman', label: 'Handyman', icon: 'ð§', description: 'Repairs & maintenance' },

  { id: 'delivery', label: 'Delivery', icon: 'ð®', description: 'Deliver items' },

  { id: 'other', label: 'Other', icon: 'â­', description: 'Other tasks' },

];

export default function DoTaskScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { createTask, isLoading } = useTaskStore();
  const [step, setStep] = useState<TaskStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [taskDetails, setTaskDetails] = useState({ title: '',

    description: '',

    location: '',

    dueDate: '',

    dueTime: ''});
  const [budget, setBudget] = useState({ min: '',
    max: ''});

  // Financial commitment for errands requiring upfront money
  // Blueprint: "For errands requiring an upfront purchase, the Customer MUST commit to the estimated cost"
  const [requiresCommitment, setRequiresCommitment] = useState(false);
  const [commitmentAmount, setCommitmentAmount] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<PhotoAttachmentItem[]>([]);
  const handleCreateTask = async () =>  {
    if (!selectedCategory || !taskDetails.title || !taskDetails.description) { toast.error('Please fill in all required fields');

      return; }

    if (!budget.min || !budget.max) { toast.error('Please set a budget range');

      return; }

    try { const task = await createTask({ category: selectedCategory,

        title: taskDetails.title,

        description: taskDetails.description,

        location: taskDetails.location,

        dueDate: taskDetails.dueDate,

        dueTime: taskDetails.dueTime,

        budgetMin: parseInt(budget.min),

        budgetMax: parseInt(budget.max)});

      if (task) { toast.success('Task posted! Taskers will start bidding soon.');

        router.replace(`/(customer)/TaskDetail?taskId=${task.id}`); } } catch (error: any) { toast.error(error.message); } };

  // Step 1: Category Selection

  if (step === 'category') { return (

      <ScrollView className="flex-1 bg-background">

        <View className="px-6 py-8">

          {/* Header */}

          <View className="mb-8">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="mb-4">

              <Feather name="chevron-left" size={24} color="#1F2937" />

            </Pressable>

            <View className="flex-row items-center mb-4">

              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">

                <Text className="text-white font-bold text-sm">1</Text>

              </View>

              <Text className="text-sm font-semibold text-muted">Task Category</Text>

            </View>

            <Text className="text-3xl font-bold text-foreground">What do you need help with?</Text>

          </View>

          {/* Category Grid */}

          <View className="gap-3 mb-8">

            {TASK_CATEGORIES.map(category => (

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={category.id}

                onPress={() => { setSelectedCategory(category.id);

                  setStep('details'); }}

                className={`border-2 rounded-lg p-4 flex-row items-center ${ selectedCategory === category.id

                    ? 'border-green-600 bg-green-50'

                    : 'border-border' }`}

              >

                <Text className="text-3xl mr-4">{category.icon}</Text>

                <View className="flex-1">

                  <Text className="text-lg font-bold text-foreground">{category.label}</Text>

                  <Text className="text-muted text-sm">{category.description}</Text>

                </View>

                {selectedCategory === category.id && (

                  <Feather name="check-circle" size={24} color="#16A34A" />

                )}

              </Pressable>

            ))}

          </View>

        </View>

      </ScrollView>

    ); }

  // Step 2: Task Details

  if (step === 'details') { const category = TASK_CATEGORIES.find(c => c.id === selectedCategory);

    return (

      <ScrollView className="flex-1 bg-background">

        <View className="px-6 py-8">

          {/* Header */}

          <View className="mb-8">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('category')} className="mb-4">

              <Feather name="chevron-left" size={24} color="#1F2937" />

            </Pressable>

            <View className="flex-row items-center mb-4">

              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">

                <Text className="text-white font-bold text-sm">2</Text>

              </View>

              <Text className="text-sm font-semibold text-muted">Task Details</Text>

            </View>

            <Text className="text-3xl font-bold text-foreground">Tell us more about your task</Text>

          </View>

          {/* Category Badge */}

          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex-row items-center">

            <Text className="text-2xl mr-3">{category?.icon}</Text>

            <Text className="text-blue-900 font-semibold">{category?.label}</Text>

          </View>

          {/* Task Title */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Task Title</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="e.g., Buy groceries from Shoprite"

              value={taskDetails.title}

              onChangeText={(text) => setTaskDetails(prev => ({ ...prev, title: text }))}

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Description */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3 h-24"

              placeholder="Provide detailed instructions..."

              value={taskDetails.description}

              onChangeText={(text) => setTaskDetails(prev => ({ ...prev, description: text }))}

              multiline

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Location */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Location</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="Where should the task be done?"

              value={taskDetails.location}

              onChangeText={(text) => setTaskDetails(prev => ({ ...prev, location: text }))}

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Checklist */}
          <View className="mb-6">
            <ChecklistBuilder
              items={checklistItems}
              onItemsChange={setChecklistItems}
              placeholder="Add a step (e.g., Buy milk, bread, eggs)"
              maxItems={10}
            />
          </View>

          {/* Photos */}
          <View className="mb-6">
            <PhotoAttachment
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={5}
              title="Reference Photos"
              description="Add photos to help your tasker understand the task"
            />
          </View>

          {/* Due Date */}

          <View className="mb-6 flex-row gap-4">

            <View className="flex-1">

              <Text className="text-sm font-semibold text-gray-700 mb-2">Due Date</Text>

              <TextInput

                className="border border-border rounded-lg px-4 py-3"

                placeholder="YYYY-MM-DD"

                value={taskDetails.dueDate}

                onChangeText={(text) => setTaskDetails(prev => ({ ...prev, dueDate: text }))}

                placeholderTextColor="#9CA3AF"

              />

            </View>

            <View className="flex-1">

              <Text className="text-sm font-semibold text-gray-700 mb-2">Time</Text>

              <TextInput

                className="border border-border rounded-lg px-4 py-3"

                placeholder="HH:MM"

                value={taskDetails.dueTime}

                onChangeText={(text) => setTaskDetails(prev => ({ ...prev, dueTime: text }))}

                placeholderTextColor="#9CA3AF"

              />

            </View>

          </View>

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('budget')}

            disabled={!taskDetails.title || !taskDetails.description}

            className={`rounded-lg py-4 ${ !taskDetails.title || !taskDetails.description ? 'bg-gray-300' : 'bg-primary' }`}

          >

            <Text className="text-white text-center font-bold text-lg">Continue</Text>

          </Pressable>

        </View>

      </ScrollView>

    ); }

  // Step 3: Budget

  if (step === 'budget') { return (

      <ScrollView className="flex-1 bg-background">

        <View className="px-6 py-8">

          {/* Header */}

          <View className="mb-8">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('details')} className="mb-4">

              <Feather name="chevron-left" size={24} color="#1F2937" />

            </Pressable>

            <View className="flex-row items-center mb-4">

              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">

                <Text className="text-white font-bold text-sm">3</Text>

              </View>

              <Text className="text-sm font-semibold text-muted">Budget</Text>

            </View>

            <Text className="text-3xl font-bold text-foreground">What's your budget?</Text>

          </View>

          {/* Budget Info */}

          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">

            <Text className="text-blue-900 font-semibold mb-2">ð¡ Budget Tips</Text>

            <Text className="text-blue-800 text-sm">

              Set a realistic budget range. Higher budgets attract more taskers and get completed faster.

            </Text>

          </View>

          {/* Min Budget */}

          <View className="mb-6">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Minimum Budget (K)</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="e.g., 50"

              value={budget.min}

              onChangeText={(text) => setBudget(prev => ({ ...prev, min: text }))}

              keyboardType="numeric"

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Max Budget */}

          <View className="mb-8">

            <Text className="text-sm font-semibold text-gray-700 mb-2">Maximum Budget (K)</Text>

            <TextInput

              className="border border-border rounded-lg px-4 py-3"

              placeholder="e.g., 150"

              value={budget.max}

              onChangeText={(text) => setBudget(prev => ({ ...prev, max: text }))}

              keyboardType="numeric"

              placeholderTextColor="#9CA3AF"

            />

          </View>

          {/* Budget Summary */}
          {budget.min && budget.max && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <Text className="text-green-900 font-semibold mb-2">Budget Range</Text>
              <Text className="text-2xl font-bold text-primary">
                {budget.min}K - {budget.max}K
              </Text>
            </View>
          )}

          {/* Financial Commitment - Blueprint requirement */}
          {/* "For errands requiring an upfront purchase, the Customer MUST commit to the estimated cost" */}
          <CommitmentAmount
            enabled={requiresCommitment}
            amount={commitmentAmount}
            onEnabledChange={setRequiresCommitment}
            onAmountChange={setCommitmentAmount}
            className="mb-8"
          />

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('confirmation')}

            disabled={!budget.min || !budget.max}

            className={`rounded-lg py-4 ${ !budget.min || !budget.max ? 'bg-gray-300' : 'bg-primary' }`}

          >

            <Text className="text-white text-center font-bold text-lg">Continue</Text>

          </Pressable>

        </View>

      </ScrollView>

    ); }

  // Step 4: Confirmation

  return (

    <ScrollView className="flex-1 bg-background">

      <View className="px-6 py-8">

        {/* Header */}

        <View className="mb-8">

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setStep('budget')} className="mb-4">

            <Feather name="chevron-left" size={24} color="#1F2937" />

          </Pressable>

          <View className="flex-row items-center mb-4">

            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">

              <Text className="text-white font-bold text-sm">4</Text>

            </View>

            <Text className="text-sm font-semibold text-muted">Review & Post</Text>

          </View>

          <Text className="text-3xl font-bold text-foreground">Review your task</Text>

        </View>

        {/* Summary */}

        <View className="bg-surface rounded-lg p-6 mb-8">

          <View className="mb-4 pb-4 border-b border-border">

            <Text className="text-muted text-sm">Category</Text>

            <Text className="text-lg font-bold text-foreground">

              {TASK_CATEGORIES.find(c => c.id === selectedCategory)?.label}

            </Text>

          </View>

          <View className="mb-4 pb-4 border-b border-border">

            <Text className="text-muted text-sm">Title</Text>

            <Text className="text-lg font-bold text-foreground">{taskDetails.title}</Text>

          </View>

          <View className="mb-4 pb-4 border-b border-border">

            <Text className="text-muted text-sm">Description</Text>

            <Text className="text-foreground">{taskDetails.description}</Text>

          </View>

          <View className="mb-4 pb-4 border-b border-border">

            <Text className="text-muted text-sm">Location</Text>

            <Text className="text-foreground">{taskDetails.location}</Text>

          </View>

          <View className="mb-4 pb-4 border-b border-border">

            <Text className="text-muted text-sm">Due Date & Time</Text>

            <Text className="text-foreground">

              {taskDetails.dueDate} at {taskDetails.dueTime}

            </Text>

          </View>

          <View>

            <Text className="text-muted text-sm">Budget</Text>

            <Text className="text-2xl font-bold text-primary">

              {budget.min}K - {budget.max}K

            </Text>

          </View>

        </View>

        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCreateTask}

          disabled={isLoading}

          className={`rounded-lg py-4 flex-row items-center justify-center ${ isLoading ? 'bg-gray-300' : 'bg-primary' }`}

        >

          {isLoading ? (

            <ActivityIndicator color="white" />

          ) : (

            <Text className="text-white text-center font-bold text-lg">Post Task</Text>

          )}

        </Pressable>

      </View>

    </ScrollView>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

