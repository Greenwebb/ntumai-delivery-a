// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';


import { useState, useEffect } from 'react';

import { View, ScrollView, Pressable, TextInput } from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { shoppingListMockService } from '@/src/api/mockServices.extended';
import { useToast } from '@/lib/toast-provider';

interface ShoppingList { id: string;

  name: string;

  itemCount: number;

  lastUsed: string;

  estimatedCost: number; }

export default function ShoppingListsScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => { loadLists(); }, []);
  const loadLists = async () => { try { const response = await shoppingListMockService.getLists('user_1');

      if (response.success) { setLists(response.data); } } catch (error) { toast.error('Failed to load shopping lists'); } finally { setLoading(false); } };
  const handleCreateList = async () =>  {
    if (!newListName.trim()) { toast.error('Please enter a list name');

      return; }

    try { const response = await shoppingListMockService.createList({ name: newListName,

        items: []});

      if (response.success) { setLists([...lists, response.data]);

        setNewListName('');

        setShowCreateForm(false);

        toast.success('Shopping list created'); } } catch (error) { toast.error('Failed to create list'); } };
  const handleUseList = (list: ShoppingList) => { router.push({ pathname: '/(customer)/DoTaskScreen',

      params: { shoppingListId: list.id,

        shoppingListName: list.name}}); };
  const handleDeleteList = (listId: string) => { toast.info('Are you sure you want to delete this list?'); };

  if (loading) { return (

      <View className="flex-1 justify-center items-center bg-background">

        <LoadingState />

      </View>

    ); }

  return (

    <View className="flex-1 bg-surface">

      {/* Header */}

      <View className="bg-background border-b border-border px-4 py-4">

        <Text className="text-2xl font-bold text-foreground">Shopping Lists</Text>

        <Text className="text-sm text-muted mt-1">

          Create and reuse shopping lists for errands

        </Text>

      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

        {/* Create New List Form */}

        {showCreateForm && (

          <View className="bg-background rounded-lg p-4 mb-4 border border-blue-200">

            <Text className="text-lg font-bold text-foreground mb-3">Create New List</Text>

            <TextInput

              value={newListName}

              onChangeText={setNewListName}

              placeholder="List name (e.g., Weekly Groceries)"

              className="bg-surface rounded-lg px-4 py-3 text-foreground mb-3"

              placeholderTextColor="#999"

            />

            <View className="flex-row gap-2">

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCreateList}

                className="flex-1 bg-blue-500 py-2 rounded-lg"

              >

                <Text className="text-center text-white font-semibold">Create</Text>

              </Pressable>

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => { setShowCreateForm(false);

                  setNewListName(''); }}

                className="flex-1 bg-gray-200 py-2 rounded-lg"

              >

                <Text className="text-center text-foreground font-semibold">Cancel</Text>

              </Pressable>

            </View>

          </View>

        )}

        {/* Lists */}

        {lists.length === 0 ? (

          <View className="items-center justify-center py-12">

            <Ionicons name="list" size={48} color="#D1D5DB" />

            <Text className="text-muted mt-4 text-center">

              No shopping lists yet. Create one to get started!

            </Text>

          </View>

        ) : (

          lists.map((list) => (

            <View

              key={list.id}

              className="bg-background rounded-lg p-4 mb-3 border border-border"

            >

              <View className="flex-row justify-between items-start mb-2">

                <View className="flex-1">

                  <Text className="text-lg font-bold text-foreground">{list.name}</Text>

                  <Text className="text-sm text-muted mt-1">

                    {list.itemCount} items â¢ â­{list.estimatedCost.toFixed(2)}

                  </Text>

                </View>

                <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleDeleteList(list.id)}

                  className="p-2"

                >

                  <Ionicons name="trash" size={20} color="#EF4444" />

                </Pressable>

              </View>

              <Text className="text-xs text-muted mb-3">

                Last used: {new Date(list.lastUsed).toLocaleDateString()}

              </Text>

              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => handleUseList(list)}

                className="bg-blue-500 py-2 rounded-lg"

              >

                <Text className="text-center text-white font-semibold">Use This List</Text>

              </Pressable>

            </View>

          ))

        )}

      </ScrollView>

      {/* Create Button */}

      {!showCreateForm && (

        <View className="px-4 py-4 border-t border-border bg-background">

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => setShowCreateForm(true)}

            className="bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"

          >

            <Ionicons name="add" size={24} color="white" />

            <Text className="text-white font-bold ml-2">Create New List</Text>

          </Pressable>

        </View>

      )}

    </View>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

