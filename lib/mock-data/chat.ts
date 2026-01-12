import { ChatMessage } from '@/components/chat';

/**
 * Mock chat messages for testing
 */
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_001',
    senderId: 'tasker_001',
    senderName: 'David (Tasker)',
    content: 'Hi! I\'ve accepted your delivery request. I\'m on my way to pick up your package.',
    type: 'text',
    timestamp: Date.now() - 3600000, // 1 hour ago
    status: 'read',
    isMe: false,
  },
  {
    id: 'msg_002',
    senderId: 'customer_001',
    senderName: 'You',
    content: 'Great! Thank you. How long will it take?',
    type: 'text',
    timestamp: Date.now() - 3500000,
    status: 'read',
    isMe: true,
  },
  {
    id: 'msg_003',
    senderId: 'tasker_001',
    senderName: 'David (Tasker)',
    content: 'I should arrive at the pickup location in about 10 minutes. Traffic is light today.',
    type: 'text',
    timestamp: Date.now() - 3400000,
    status: 'read',
    isMe: false,
  },
  {
    id: 'msg_004',
    senderId: 'customer_001',
    senderName: 'You',
    content: 'Perfect! The package is at the reception desk. Please ask for John.',
    type: 'text',
    timestamp: Date.now() - 3300000,
    status: 'read',
    isMe: true,
  },
  {
    id: 'msg_005',
    senderId: 'system',
    senderName: 'System',
    content: 'David has arrived at the pickup location',
    type: 'system',
    timestamp: Date.now() - 2400000,
    status: 'read',
    isMe: false,
  },
  {
    id: 'msg_006',
    senderId: 'tasker_001',
    senderName: 'David (Tasker)',
    content: 'I\'ve picked up the package. Heading to the delivery address now.',
    type: 'text',
    timestamp: Date.now() - 2300000,
    status: 'read',
    isMe: false,
  },
  {
    id: 'msg_007',
    senderId: 'customer_001',
    senderName: 'You',
    content: 'Thanks for the update! 👍',
    type: 'text',
    timestamp: Date.now() - 2200000,
    status: 'delivered',
    isMe: true,
  },
];

/**
 * Mock conversations list
 */
export const MOCK_CONVERSATIONS = [
  {
    id: 'conv_001',
    orderId: 'order_123',
    recipientName: 'David (Tasker)',
    recipientAvatar: undefined,
    lastMessage: 'I\'ve picked up the package. Heading to the delivery address now.',
    lastMessageTime: Date.now() - 2300000,
    unreadCount: 0,
    isActive: true,
  },
  {
    id: 'conv_002',
    orderId: 'order_456',
    recipientName: 'Sarah (Tasker)',
    recipientAvatar: undefined,
    lastMessage: 'Your order has been delivered. Thank you!',
    lastMessageTime: Date.now() - 86400000, // 1 day ago
    unreadCount: 0,
    isActive: false,
  },
  {
    id: 'conv_003',
    orderId: 'order_789',
    recipientName: 'Mike (Tasker)',
    recipientAvatar: undefined,
    lastMessage: 'I\'m at the store now. They don\'t have the exact item. Should I get a similar one?',
    lastMessageTime: Date.now() - 1800000, // 30 min ago
    unreadCount: 2,
    isActive: true,
  },
];

/**
 * Generate a mock message
 */
export function generateMockMessage(
  content: string,
  isMe: boolean,
  type: ChatMessage['type'] = 'text'
): ChatMessage {
  return {
    id: `msg_${Date.now()}`,
    senderId: isMe ? 'customer_001' : 'tasker_001',
    senderName: isMe ? 'You' : 'Tasker',
    content,
    type,
    timestamp: Date.now(),
    status: isMe ? 'sending' : 'delivered',
    isMe,
  };
}

/**
 * Simulate receiving a message after a delay
 */
export function simulateIncomingMessage(
  callback: (message: ChatMessage) => void,
  delay: number = 3000
): () => void {
  const responses = [
    'Got it, thanks!',
    'I\'m almost there.',
    'No problem, I\'ll handle it.',
    'The traffic is a bit heavy, might take a few more minutes.',
    'I\'ve arrived at the location.',
  ];

  const timeout = setTimeout(() => {
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const message = generateMockMessage(randomResponse, false);
    callback(message);
  }, delay);

  return () => clearTimeout(timeout);
}
