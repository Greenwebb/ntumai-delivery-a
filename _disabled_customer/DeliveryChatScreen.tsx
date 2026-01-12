// @ts-nocheck
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Linking, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useToast } from '@/lib/toast-provider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useDeliveryChatStore, ChatMessage, MessageSender, QuickReply } from '../../stores/delivery-chat-store';

export default function DeliveryChatScreen() { const router = useRouter();
  const toast = useToast();
  const colors = useColors();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messageText, setMessageText] = useState('');
  const { chats,
    loadChat,
    sendMessage,
    markAsRead,
    setTyping,
    getQuickReplies,
    isLoading} = useDeliveryChatStore();
  const chat = chats[orderId];
  const quickReplies = getQuickReplies('customer');

  useEffect(() =>  {
    if (orderId) { loadChat(orderId); } }, [orderId]);

  useEffect(() => { // Scroll to bottom when messages change
    setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100); }, [chat?.messages]);
  const handleSend = async () =>  {
    if (!messageText.trim() || !orderId) return;

    try { await sendMessage(orderId, 'text', messageText.trim());
      setMessageText('');
      if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } } catch (error) { toast.error('Failed to send message. Please try again.'); } };
  const handleQuickReply = async (reply: QuickReply) =>  {
    if (!orderId) return;

    try { await sendMessage(orderId, 'text', reply.text);
      if (Platform.OS !== 'web') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } } catch (error) { toast.error('Failed to send message. Please try again.'); } };
  const handleCall = () =>  {
    if (chat?.taskerPhone) { Linking.openURL(`tel:${chat.taskerPhone}`); } };
  const renderMessage = (message: ChatMessage) => { const isOwn = message.sender === 'customer';
  const isSystem = message.sender === 'system';

    if (isSystem) { return (
        <View key={message.id} className="items-center my-3">
          <View className="bg-muted/10 px-4 py-2 rounded-full">
            <Text className="text-xs text-muted text-center">{message.content}</Text>
          </View>
        </View>
      ); }

    return (
      <View
        key={message.id}
        className={`flex-row mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <View className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && (
            <Text className="text-xs text-muted mb-1 ml-3">{message.senderName}</Text>
          )}
          <View
            className={`px-4 py-3 rounded-2xl ${ isOwn
                ? 'bg-primary rounded-br-md'
                : 'bg-surface border border-border rounded-bl-md' }`}
          >
            {message.type === 'text' && (
              <Text className={`text-sm ${isOwn ? 'text-white' : 'text-foreground'}`}>
                {message.content}
              </Text>
            )}
            {message.type === 'photo' && (
              <View className="w-48 h-48 bg-muted/20 rounded-xl items-center justify-center">
                <Feather name="image" size={32} color="#9CA3AF" />
                <Text className="text-xs text-muted mt-2">Photo</Text>
              </View>
            )}
            {message.type === 'location' && (
              <View className="flex-row items-center">
                <Feather name="map-pin" size={16} color={isOwn ? '#fff' : '#009688'} />
                <Text className={`text-sm ml-2 ${isOwn ? 'text-white' : 'text-primary'}`}>
                  Location shared
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-muted mt-1 ml-3">
            {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric',
              minute: '2-digit'})}
            {isOwn && message.isRead && ' • Read'}
          </Text>
        </View>
      </View>
    ); };

  if (!chat) { return (
      <ScreenContainer className="bg-background items-center justify-center">
        <Text className="text-muted">Loading chat...</Text>
      </ScreenContainer>
    ); }

  return (
    <ScreenContainer className="bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
        <View className="flex-row items-center flex-1">
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={() => router.back()} className="p-2 -ml-2">
            <Feather name="arrow-left" size={24} color="#1F2937" />
          </Pressable>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-foreground">{chat.taskerName}</Text>
            <Text className="text-xs text-muted">
              {chat.isTyping ? 'Typing...' : 'Delivering your order'}
            </Text>
          </View>
        </View>
        <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCall}
          className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
        >
          <Feather name="phone" size={20} color="#009688" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {chat.messages.map(renderMessage)}

          {/* Typing Indicator */}
          {chat.isTyping && (
            <View className="flex-row items-center mb-3">
              <View className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-bl-md">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-muted mr-1" />
                  <View className="w-2 h-2 rounded-full bg-muted mr-1" />
                  <View className="w-2 h-2 rounded-full bg-muted" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2 border-t border-border"
          contentContainerStyle={{ gap: 8 }}
        >
          {quickReplies.map(reply => (
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
key={reply.id}
              onPress={() => handleQuickReply(reply)}
              className="bg-surface border border-border px-4 py-2 rounded-full flex-row items-center"
            >
              <Feather name={reply.icon as any} size={14} color="#6B7280" />
              <Text className="text-sm text-foreground ml-2">{reply.text}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Input */}
        <View className="flex-row items-center px-4 py-3 border-t border-border bg-background">
          <View className="flex-1 flex-row items-center bg-surface border border-border rounded-full px-4 py-2">
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base text-foreground"
              multiline
              maxLength={500}
              onFocus={() =>  {
    if (orderId) setTyping(orderId, true); }}
              onBlur={() =>  {
    if (orderId) setTyping(orderId, false); }}
            />
            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
className="ml-2">
              <Feather name="paperclip" size={20} color="#6B7280" />
            </Pressable>
          </View>
          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleSend}
            disabled={!messageText.trim() || isLoading}
            className={`ml-3 w-10 h-10 rounded-full items-center justify-center ${ messageText.trim() ? 'bg-primary' : 'bg-muted/20' }`}
          >
            <Feather
              name="send"
              size={18}
              color={messageText.trim() ? '#fff' : '#9CA3AF'}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

