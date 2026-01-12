// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useChatStore, ChatMessage } from '@/stores/chat-store';
  const QUICK_REPLIES = [
  'Where is my order?',
  'Cancel my order',
  'Change delivery address',
  'Payment issue',
];

export default function SupportChatScreen() { const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const conversationId = params.conversationId as string;
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');
  const { activeConversation,
    isLoading,
    loadConversation,
    sendMessage} = useChatStore();

  useEffect(() =>  {
    if (conversationId) { loadConversation(conversationId); } }, [conversationId]);

  useEffect(() => { // Scroll to bottom when messages update
    if (scrollViewRef.current) { setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100); } }, [activeConversation?.messages]);
  const handleSend = async () =>  {
    if (!messageText.trim() || !conversationId) return;
    
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    
    await sendMessage(conversationId, messageText.trim());
    setMessageText(''); };
  const handleQuickReply = async (text: string) =>  {
    if (!conversationId) return;
    
    if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
    
    await sendMessage(conversationId, text); };
  const formatTime = (date: Date) => { return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit',
      minute: '2-digit'}); };
  const renderMessage = (message: ChatMessage, index: number) => { const isOwnMessage = message.senderType === 'customer';
  const showAvatar = index === 0 || 
      activeConversation?.messages[index - 1]?.senderId !== message.senderId;

    return (
      <View
        key={message.id}
        className={`flex-row mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwnMessage && showAvatar && (
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
            <Text className="text-sm font-bold text-primary">
              {message.senderName.charAt(0)}
            </Text>
          </View>
        )}
        {!isOwnMessage && !showAvatar && <View className="w-8 mr-2" />}

        <View className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {showAvatar && !isOwnMessage && (
            <Text className="text-xs text-muted mb-1">{message.senderName}</Text>
          )}
          <View
            className={`rounded-2xl px-4 py-2 ${ isOwnMessage ? 'bg-primary' : 'bg-surface border border-border' }`}
          >
            <Text className={`text-base ${isOwnMessage ? 'text-white' : 'text-foreground'}`}>
              {message.text}
            </Text>
          </View>
          <Text className="text-xs text-muted mt-1">{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    ); };

  if (isLoading || !activeConversation) { return (
      <ScreenContainer className="bg-background items-center justify-center">
        <Text className="text-base text-muted">Loading conversation...</Text>
      </ScreenContainer>
    ); }

  return (
    <ScreenContainer edges={['top', 'left', 'right']} className="bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <View className="flex-row items-center flex-1">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
            <Feather name="arrow-left" size={24} color="#1F2937" />
          </Pressable>
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center ml-2">
            <Feather name="headphones" size={20} color="#009688" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-foreground">
              {activeConversation.participantName}
            </Text>
            <Text className="text-xs text-success">Online</Text>
          </View>
        </View>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="p-2">
          <Feather name="more-vertical" size={20} color="#6B7280" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        >
          {/* Date Separator */}
          <View className="items-center mb-4">
            <View className="bg-muted/10 px-3 py-1 rounded-full">
              <Text className="text-xs text-muted">Today</Text>
            </View>
          </View>

          {/* Messages */}
          {activeConversation.messages.map((message, index) =>
            renderMessage(message, index)
          )}

          {/* Quick Replies (show at the end if no recent messages) */}
          {activeConversation.messages.length < 3 && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-muted mb-2">Quick replies:</Text>
              <View className="flex-row flex-wrap gap-2">
                {QUICK_REPLIES.map((reply) => (
                  <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={reply}
                    onPress={() => handleQuickReply(reply)}
                    className="px-4 py-2 bg-surface border border-border rounded-full"
                  >
                    <Text className="text-sm text-foreground">{reply}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3 border-t border-border bg-background">
          <View className="flex-row items-center gap-2">
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="w-10 h-10 rounded-full bg-surface items-center justify-center">
              <Feather name="plus" size={20} color="#6B7280" />
            </Pressable>
            
            <View className="flex-1 flex-row items-center bg-surface rounded-full px-4 py-2">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-base text-foreground"
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="ml-2">
                <Feather name="smile" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSend}
              disabled={!messageText.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${ messageText.trim() ? 'bg-primary' : 'bg-muted/20' }`}
            >
              <Feather name="send" size={18} color={messageText.trim() ? '#FFFFFF' : '#9CA3AF'} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

