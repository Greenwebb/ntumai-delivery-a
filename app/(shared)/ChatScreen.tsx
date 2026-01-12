// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useChatStore } from '@/lib/stores/chat-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { chatId, participantName, participantPhoto, orderId } = params;
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    currentChat,
    messages,
    typingUsers,
    loading,
    loadChat,
    sendMessage,
    sendTypingIndicator,
  } = useChatStore();

  useEffect(() => {
    if (chatId) {
      loadChat(chatId as string);
    }
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (message.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await sendMessage(chatId as string, 'user_1', 'You', message.trim());
      setMessage('');
      setIsTyping(false);
      sendTypingIndicator(chatId as string, false);
    }
  };

  const handleTyping = (text: string) => {
    setMessage(text);
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      sendTypingIndicator(chatId as string, true);
    } else if (isTyping && text.length === 0) {
      setIsTyping(false);
      sendTypingIndicator(chatId as string, false);
    }
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading chat...</Text>
      </ScreenContainer>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center">
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            onPress={handleBack}
            className="p-2 -ml-2 mr-2"
          >
            <Feather name="chevron-left" size={24} color={colors.foreground} />
          </Pressable>
          
          {participantPhoto ? (
            <Image
              source={{ uri: participantPhoto as string }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Text className="text-lg font-bold text-primary">
                {(participantName as string)?.charAt(0) || 'D'}
              </Text>
            </View>
          )}
          
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              {participantName || 'Chat'}
            </Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-success mr-2" />
              <Text className="text-xs text-muted">Active now</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="p-2"
          >
            <Feather name="phone" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-3"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Feather name="message-circle" size={32} color={colors.primary} />
              </View>
              <Text className="text-foreground font-semibold mb-1">Start a conversation</Text>
              <Text className="text-muted text-sm text-center px-8">
                Send a message to {participantName || 'your driver'} about your delivery
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === 'user_1';
              const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.senderId !== msg.senderId);
              
              return (
                <View
                  key={msg.id || index}
                  className={`flex-row mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwnMessage && showAvatar && (
                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
                      <Text className="text-sm font-bold text-primary">
                        {msg.senderName?.charAt(0) || 'D'}
                      </Text>
                    </View>
                  )}
                  {!isOwnMessage && !showAvatar && <View className="w-10" />}
                  
                  <View
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isOwnMessage 
                        ? 'bg-primary rounded-br-sm' 
                        : 'bg-surface border border-border rounded-bl-sm'
                    }`}
                  >
                    <Text className={isOwnMessage ? 'text-white' : 'text-foreground'}>
                      {msg.content}
                    </Text>
                    <Text 
                      className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-muted'}`}
                    >
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}

          {typingUsers.length > 0 && (
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
                <Text className="text-sm font-bold text-primary">
                  {participantName?.toString().charAt(0) || 'D'}
                </Text>
              </View>
              <View className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <View className="flex-row items-center gap-1">
                  <View className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                  <View className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <View className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.4s' }} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View 
          className="bg-surface border-t border-border px-4 py-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row items-end gap-3">
            <View className="flex-1 bg-background rounded-2xl border border-border px-4 py-3 flex-row items-center">
              <TextInput
                value={message}
                onChangeText={handleTyping}
                placeholder="Type a message..."
                placeholderTextColor={colors.muted}
                className="flex-1 text-foreground text-base"
                style={{ maxHeight: 100, color: colors.foreground }}
                multiline
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
            </View>
            
            <Pressable
              style={({ pressed }) => ({ 
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }]
              })}
              onPress={handleSend}
              disabled={!message.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                message.trim() ? 'bg-primary' : 'bg-surface border border-border'
              }`}
            >
              <Feather 
                name="send" 
                size={20} 
                color={message.trim() ? 'white' : colors.muted} 
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

