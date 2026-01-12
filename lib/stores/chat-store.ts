// @ts-nocheck

// Chat store slice
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatService, Chat, ChatMessage } from '@/services/chat';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  typingUsers: string[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // Actions
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (
    chatId: string,
    senderId: string,
    senderName: string,
    message: string,
    attachments?: string[]
  ) => Promise<void>;
  receiveMessage: (message: ChatMessage) => void;
  markAsRead: (chatId: string, messageId: string) => void;
  markAllAsRead: (chatId: string) => void;
  sendTypingIndicator: (chatId: string, isTyping: boolean) => void;
  updateTypingUsers: (chatId: string, users: string[]) => void;
  deleteChat: (chatId: string) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>(
  persist(
    (set, get) => ({
      chats: [],
      currentChat: null,
      messages: [],
      typingUsers: [],
      unreadCount: 0,
      loading: false,
      error: null,

      loadChats: async () => {
        set({ loading: true, error: null });
        try {
          const chats = chatService.getAllChats();
          const unreadCount = chatService.getTotalUnreadCount();
          set({ chats, unreadCount, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load chats',
            loading: false,
          });
        }
      },

      selectChat: async (chatId: string) => {
        const chat = chatService.getChat(chatId);
        if (chat) {
          set({ currentChat: chat });
          await get().loadMessages(chatId);
        }
      },

      loadMessages: async (chatId: string) => {
        set({ loading: true, error: null });
        try {
          const messages = chatService.getMessages(chatId);
          chatService.markAllMessagesAsRead(chatId);
          set({ messages, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load messages',
            loading: false,
          });
        }
      },

      sendMessage: async (chatId, senderId, senderName, message, attachments) => {
        try {
          const newMessage = await chatService.sendMessage(
            chatId,
            senderId,
            senderName,
            message,
            attachments
          );
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to send message',
          });
        }
      },

      receiveMessage: (message: ChatMessage) => {
        chatService.receiveMessage(message);
        set((state) => ({
          messages:
            state.currentChat?.id === message.chatId
              ? [...state.messages, message]
              : state.messages,
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (chatId: string, messageId: string) => {
        chatService.markMessageAsRead(chatId, messageId);
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, isRead: true } : m
          ),
        }));
      },

      markAllAsRead: (chatId: string) => {
        chatService.markAllMessagesAsRead(chatId);
        set((state) => ({
          messages: state.messages.map((m) => ({ ...m, isRead: true })),
          unreadCount: Math.max(0, state.unreadCount - state.messages.length),
        }));
      },

      sendTypingIndicator: (chatId: string, isTyping: boolean) => {
        chatService.sendTypingIndicator(chatId, isTyping);
      },

      updateTypingUsers: (chatId: string, users: string[]) => {
        set({ typingUsers: users });
      },

      deleteChat: (chatId: string) => {
        chatService.deleteChat(chatId);
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== chatId),
          currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'chat-store',
    }
  )
);

