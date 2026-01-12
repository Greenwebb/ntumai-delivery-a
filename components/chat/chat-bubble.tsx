import React from 'react';
import { View, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ChatBubbleProps {
  content: string;
  timestamp: number;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'location' | 'system';
  imageUrl?: string;
  senderName?: string;
  showAvatar?: boolean;
  avatarUrl?: string;
}

/**
 * Chat Bubble Component
 * Displays individual chat messages with proper styling
 */
export function ChatBubble({
  content,
  timestamp,
  isMe,
  status = 'sent',
  type = 'text',
  imageUrl,
  senderName,
  showAvatar = true,
  avatarUrl,
}: ChatBubbleProps) {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // System message
  if (type === 'system') {
    return (
      <View className="items-center my-2">
        <Text className="text-gray-500 text-xs italic bg-gray-100 px-3 py-1 rounded-full">
          {content}
        </Text>
      </View>
    );
  }

  return (
    <View className={`flex-row mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for received messages */}
      {!isMe && showAvatar && (
        <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-2 self-end">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-8 h-8 rounded-full" />
          ) : (
            <Feather name="user" size={16} color="#6B7280" />
          )}
        </View>
      )}

      {/* Message bubble */}
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isMe ? 'bg-primary rounded-br-sm' : 'bg-gray-100 rounded-bl-sm'
        }`}
        style={isMe ? { backgroundColor: '#009688' } : undefined}
      >
        {/* Sender name for group chats */}
        {!isMe && senderName && (
          <Text className="text-xs text-primary font-medium mb-1" style={{ color: '#009688' }}>
            {senderName}
          </Text>
        )}

        {/* Image content */}
        {type === 'image' && imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            className="w-48 h-48 rounded-lg mb-2"
            resizeMode="cover"
          />
        )}

        {/* Location content */}
        {type === 'location' && (
          <View className="flex-row items-center mb-1">
            <Feather name="map-pin" size={14} color={isMe ? 'white' : '#009688'} />
            <Text className={`text-xs ml-1 ${isMe ? 'text-white/80' : 'text-primary'}`}>
              Location shared
            </Text>
          </View>
        )}

        {/* Text content */}
        <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-900'}`}>
          {content}
        </Text>

        {/* Timestamp and status */}
        <View className="flex-row items-center justify-end mt-1">
          <Text className={`text-xs ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
            {formatTime(timestamp)}
          </Text>

          {/* Message status indicators */}
          {isMe && (
            <View className="ml-1">
              {status === 'sending' && (
                <Feather name="clock" size={12} color="rgba(255,255,255,0.7)" />
              )}
              {status === 'sent' && (
                <Feather name="check" size={12} color="rgba(255,255,255,0.7)" />
              )}
              {status === 'delivered' && (
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
              {status === 'read' && (
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

      {/* Spacer for sent messages (to align with avatar space) */}
      {isMe && showAvatar && <View className="w-10" />}
    </View>
  );
}

export default ChatBubble;
