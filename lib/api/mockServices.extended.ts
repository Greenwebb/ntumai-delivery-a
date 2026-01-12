// @ts-nocheck

// Extended mock API services for missing features
import { mockData } from './mockData';

// ============ CHAT SERVICE ============
export const chatMockService = {
  async getChats() {
    return {
      success: true,
      data: [
        {
          id: 'chat_1',
          participantId: 'tasker_1',
          participantName: 'John Driver',
          participantPhoto: mockData.users.tasker1.photo,
          lastMessage: 'I\'m on my way!',
          lastMessageTime: new Date(Date.now() - 5 * 60000).toISOString(),
          unreadCount: 2,
          isActive: true,
        },
        {
          id: 'chat_2',
          participantId: 'vendor_1',
          participantName: 'Pizza Palace',
          participantPhoto: mockData.vendors.vendor1.logo,
          lastMessage: 'Order confirmed',
          lastMessageTime: new Date(Date.now() - 30 * 60000).toISOString(),
          unreadCount: 0,
          isActive: true,
        },
      ],
    };
  },

  async getMessages(chatId: string) {
    return {
      success: true,
      data: [
        {
          id: 'msg_1',
          chatId,
          senderId: 'user_1',
          senderName: 'You',
          message: 'Hi, where are you?',
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
          isRead: true,
          type: 'text',
        },
        {
          id: 'msg_2',
          chatId,
          senderId: 'tasker_1',
          senderName: 'John Driver',
          message: 'I\'m 5 minutes away',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          isRead: true,
          type: 'text',
        },
      ],
    };
  },

  async sendMessage(chatId: string, message: string) {
    return {
      success: true,
      data: {
        id: `msg_${Date.now()}`,
        chatId,
        senderId: 'user_1',
        senderName: 'You',
        message,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'text',
      },
    };
  },
};

// ============ AUTO-MATCHING SERVICE ============
export const matchingMockService = {
  async findTasker(jobData: any) {
    return {
      success: true,
      data: {
        taskerId: 'tasker_1',
        taskerName: 'John Driver',
        taskerPhoto: mockData.users.tasker1.photo,
        rating: 4.8,
        estimatedArrival: 5,
        estimatedEarnings: 2.5,
        vehicle: 'Motorcycle',
      },
    };
  },

  async getAvailableTaskers(location: any) {
    return {
      success: true,
      data: [
        {
          id: 'tasker_1',
          name: 'John Driver',
          photo: mockData.users.tasker1.photo,
          latitude: location.latitude + 0.01,
          longitude: location.longitude + 0.01,
          rating: 4.8,
          distance: 2.5,
          badge: 'gold',
        },
        {
          id: 'tasker_2',
          name: 'Mike Rider',
          photo: mockData.users.tasker1.photo,
          latitude: location.latitude - 0.01,
          longitude: location.longitude - 0.01,
          rating: 4.5,
          distance: 3.2,
          badge: 'silver',
        },
      ],
    };
  },
};

// ============ PAYMENT SERVICE ============
export const paymentMockService = {
  async processPayment(paymentData: any) {
    return {
      success: true,
      data: {
        transactionId: `txn_${Date.now()}`,
        amount: paymentData.amount,
        status: 'success',
        timestamp: new Date().toISOString(),
        receipt: {
          id: `receipt_${Date.now()}`,
          amount: paymentData.amount,
          method: paymentData.method,
          timestamp: new Date().toISOString(),
        },
      },
    };
  },

  async confirmCashPayment(orderId: string, amount: number) {
    return {
      success: true,
      data: {
        orderId,
        amount,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
      },
    };
  },
};

// ============ TASKER ONBOARDING SERVICE ============
export const onboardingMockService = {
  async submitApplication(applicationData: any) {
    return {
      success: true,
      data: {
        applicationId: `app_${Date.now()}`,
        status: 'APPLIED',
        message: 'Application submitted successfully',
      },
    };
  },

  async uploadKYCDocument(documentType: string, file: any) {
    return {
      success: true,
      data: {
        documentId: `doc_${Date.now()}`,
        type: documentType,
        status: 'pending_review',
        uploadedAt: new Date().toISOString(),
      },
    };
  },

  async completeTraining(quizScore: number, testRunResult: string) {
    return {
      success: true,
      data: {
        status: 'TRAINING_COMPLETED',
        quizScore,
        testRunResult,
        completedAt: new Date().toISOString(),
      },
    };
  },

  async getOnboardingStatus(userId: string) {
    return {
      success: true,
      data: {
        userId,
        currentStep: 'KYC_PENDING',
        completedSteps: ['APPLIED', 'PRE_SCREEN_PASSED'],
        progress: 40,
        documents: [
          { type: 'nrc', status: 'approved' },
          { type: 'driver_license', status: 'pending' },
        ],
      },
    };
  },
};

// ============ PROBATION KPI SERVICE ============
export const kpiMockService = {
  async getProbationKPIs(userId: string) {
    return {
      success: true,
      data: {
        userId,
        status: 'PROBATION',
        daysRemaining: 10,
        kpis: {
          acceptanceRate: 92,
          onTimeRate: 88,
          completionRate: 99,
          averageRating: 4.7,
          incidentRate: 0,
        },
        targets: {
          acceptanceRate: 85,
          onTimeRate: 90,
          completionRate: 98,
          averageRating: 4.7,
          incidentRate: 1,
        },
        alerts: [
          {
            type: 'warning',
            message: 'On-time rate below target',
            metric: 'onTimeRate',
          },
        ],
      },
    };
  },

  async getPerformanceMetrics(userId: string) {
    return {
      success: true,
      data: {
        userId,
        totalDeliveries: 145,
        completedDeliveries: 144,
        cancelledDeliveries: 1,
        averageRating: 4.7,
        totalEarnings: 1250.5,
        acceptanceRate: 92,
        onTimeRate: 88,
        completionRate: 99,
      },
    };
  },
};

// ============ FLOAT SYSTEM SERVICE ============
export const floatMockService = {
  async getFloatBalance(userId: string) {
    return {
      success: true,
      data: {
        userId,
        floatBalance: 25.5,
        earningsBalance: 150.75,
        minimumRequired: 10,
        status: 'active',
      },
    };
  },

  async topUpFloat(amount: number, paymentMethod: string) {
    return {
      success: true,
      data: {
        transactionId: `topup_${Date.now()}`,
        amount,
        newBalance: 25.5 + amount,
        status: 'completed',
        timestamp: new Date().toISOString(),
      },
    };
  },

  async requestPayout(amount: number, destination: string) {
    return {
      success: true,
      data: {
        payoutId: `payout_${Date.now()}`,
        amount,
        destination,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        estimatedProcessing: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  },
};

// ============ SHOPPING LIST SERVICE ============
export const shoppingListMockService = {
  async createList(listData: any) {
    return {
      success: true,
      data: {
        id: `list_${Date.now()}`,
        name: listData.name,
        items: listData.items,
        createdAt: new Date().toISOString(),
      },
    };
  },

  async getLists(userId: string) {
    return {
      success: true,
      data: [
        {
          id: 'list_1',
          name: 'Weekly Groceries',
          itemCount: 8,
          lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCost: 45.5,
        },
        {
          id: 'list_2',
          name: 'Office Supplies',
          itemCount: 5,
          lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCost: 25.0,
        },
      ],
    };
  },

  async updateList(listId: string, updates: any) {
    return {
      success: true,
      data: {
        id: listId,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    };
  },
};

// ============ REFERRAL SERVICE ============
export const referralMockService = {
  async getReferralCode(userId: string) {
    return {
      success: true,
      data: {
        userId,
        referralCode: `NTUMAI${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        totalReferrals: 5,
        totalEarnings: 25.0,
        pendingEarnings: 5.0,
      },
    };
  },

  async applyReferralCode(code: string) {
    return {
      success: true,
      data: {
        code,
        creditAmount: 5.0,
        message: 'Referral credit applied successfully',
      },
    };
  },
};

// ============ SUPPORT SERVICE ============
export const supportMockService = {
  async createTicket(ticketData: any) {
    return {
      success: true,
      data: {
        ticketId: `ticket_${Date.now()}`,
        subject: ticketData.subject,
        description: ticketData.description,
        status: 'open',
        createdAt: new Date().toISOString(),
      },
    };
  },

  async getTickets(userId: string) {
    return {
      success: true,
      data: [
        {
          id: 'ticket_1',
          subject: 'Payment issue',
          status: 'open',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };
  },

  async getFAQ() {
    return {
      success: true,
      data: [
        {
          id: 'faq_1',
          question: 'How do I become a tasker?',
          answer: 'To become a tasker, go to your profile and select "Become a Tasker". Complete the KYC process...',
          category: 'Tasker',
        },
        {
          id: 'faq_2',
          question: 'How do I track my order?',
          answer: 'You can track your order in real-time from the order details screen...',
          category: 'Orders',
        },
      ],
    };
  },
};

// ============ BADGE SYSTEM SERVICE ============
export const badgeMockService = {
  async getBadges(userId: string) {
    return {
      success: true,
      data: {
        userId,
        currentBadge: 'silver',
        badges: [
          { type: 'bronze', earned: true, earnedAt: '2024-01-01' },
          { type: 'silver', earned: true, earnedAt: '2024-02-01' },
          { type: 'gold', earned: false, progress: 75 },
        ],
      },
    };
  },
};

// ============ RECEIPT SERVICE ============
export const receiptMockService = {
  async generateReceipt(transactionId: string) {
    return {
      success: true,
      data: {
        receiptId: `receipt_${Date.now()}`,
        transactionId,
        items: [
          { name: 'Item 1', quantity: 2, price: 10.0 },
          { name: 'Item 2', quantity: 1, price: 15.0 },
        ],
        subtotal: 35.0,
        tax: 3.5,
        total: 38.5,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async downloadReceipt(receiptId: string) {
    return {
      success: true,
      data: {
        receiptId,
        pdfUrl: `https://example.com/receipts/${receiptId}.pdf`,
        message: 'Receipt ready for download',
      },
    };
  },
};

