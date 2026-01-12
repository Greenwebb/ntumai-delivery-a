import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'system';
  imageUrl?: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isMe: boolean;
}

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onSendImage?: () => void;
  onSendLocation?: () => void;
  recipientName: string;
  recipientAvatar?: string;
  isTyping?: boolean;
  onBack?: () => void;
}

/**
 * Chat Screen Component
 * Blueprint: "In-app chat (Customer ↔ Tasker)"
 */
export function ChatScreen({
  messages,
  onSendMessage,
  onSendImage,
  onSendLocation,
  recipientName,
  recipientAvatar,
  isTyping,
  onBack,
}: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (inputText.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const showDateHeader =
      index === 0 ||
      formatDate(item.timestamp) !== formatDate(messages[index - 1].timestamp);

    return (
      <View>
        {showDateHeader && (
          <View className="items-center my-4">
            <Text className="text-gray-500 text-xs bg-gray-100 px-3 py-1 rounded-full">
              {formatDate(item.timestamp)}
            </Text>
          </View>
        )}

        {item.type === 'system' ? (
          <View className="items-center my-2">
            <Text className="text-gray-500 text-xs italic">{item.content}</Text>
          </View>
        ) : (
          <View
            className={`flex-row mb-2 ${item.isMe ? 'justify-end' : 'justify-start'}`}
          >
            {!item.isMe && (
              <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-2">
                {recipientAvatar ? (
                  <Image
                    source={{ uri: recipientAvatar }}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <Feather name="user" size={16} color="#6B7280" />
                )}
              </View>
            )}

            <View
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                item.isMe
                  ? 'bg-primary rounded-br-sm'
                  : 'bg-gray-100 rounded-bl-sm'
              }`}
              style={item.isMe ? { backgroundColor: '#009688' } : undefined}
            >
              {item.type === 'image' && item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-48 h-48 rounded-lg mb-2"
                  resizeMode="cover"
                />
              )}

              <Text
                className={`text-base ${item.isMe ? 'text-white' : 'text-gray-900'}`}
              >
                {item.content}
              </Text>

              <View className="flex-row items-center justify-end mt-1">
                <Text
                  className={`text-xs ${
                    item.isMe ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {formatTime(item.timestamp)}
                </Text>

                {item.isMe && (
                  <View className="ml-1">
                    {item.status === 'sending' && (
                      <Feather name="clock" size={12} color="rgba(255,255,255,0.7)" />
                    )}
                    {item.status === 'sent' && (
                      <Feather name="check" size={12} color="rgba(255,255,255,0.7)" />
                    )}
                    {item.status === 'delivered' && (
                      <View className="flex-row">
                        <Feather name="check" size={12} color="rgba(255,255,255,0.7)" />
                        <Feather
                          name="check"
                          size={12}
                          color="rgba(255,255,255,0.7)"
                          style={{ marginLeft: -6 }}
                        />
                      </View>
                    )}
                    {item.status === 'read' && (
                      <View className="flex-row">
                        <Feather name="check" size={12} color="#60A5FA" />
                        <Feather
                          name="check"
                          size={12}
                          color="#60A5FA"
                          style={{ marginLeft: -6 }}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white"
        style={{ paddingTop: insets.top + 12 }}
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} className="mr-3">
            <Feather name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
        )}

        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
          {recipientAvatar ? (
            <Image
              source={{ uri: recipientAvatar }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Feather name="user" size={20} color="#6B7280" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base">
            {recipientName}
          </Text>
          {isTyping && (
            <Text className="text-primary text-xs" style={{ color: '#009688' }}>
              typing...
            </Text>
          )}
        </View>

        <TouchableOpacity className="p-2">
          <Feather name="phone" size={20} color="#009688" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Feather name="message-circle" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-center">
              No messages yet.{'\n'}Start the conversation!
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View
          className="flex-row items-end px-4 py-3 border-t border-gray-200 bg-white"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          {/* Attachment buttons */}
          <View className="flex-row mr-2">
            {onSendImage && (
              <TouchableOpacity
                onPress={onSendImage}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
              >
                <Feather name="image" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
            {onSendLocation && (
              <TouchableOpacity
                onPress={onSendLocation}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Feather name="map-pin" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Text input */}
          <View className="flex-1 flex-row items-end bg-gray-100 rounded-2xl px-4 py-2 mr-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={1000}
              className="flex-1 text-base text-gray-900 max-h-24"
              style={{ minHeight: 24 }}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </View>

          {/* Send button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: inputText.trim() ? '#009688' : '#E5E7EB',
            }}
          >
            <Feather
              name="send"
              size={18}
              color={inputText.trim() ? 'white' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default ChatScreen;
