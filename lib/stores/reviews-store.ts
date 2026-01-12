// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Review {
  id: string;
  orderId: string;
  targetType: 'tasker' | 'vendor';
  targetId: string;
  targetName: string;
  userId: string;
  overallRating: number;
  categoryRatings?: Record<string, number>;
  review?: string;
  quickFeedback?: string[];
  tipAmount?: number;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  topFeedback: string[];
}

const STORAGE_KEY = 'ntumai_reviews';

// Mock reviews data
const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    orderId: 'ord-001',
    targetType: 'tasker',
    targetId: 'tasker-001',
    targetName: 'John Banda',
    userId: 'user-001',
    overallRating: 5,
    categoryRatings: { speed: 5, communication: 5, handling: 5, professionalism: 5 },
    review: 'Excellent service! Very fast and professional.',
    quickFeedback: ['Fast delivery', 'Professional', 'Friendly tasker'],
    tipAmount: 20,
    createdAt: '2025-12-28T10:30:00Z',
  },
  {
    id: 'rev-002',
    orderId: 'ord-002',
    targetType: 'tasker',
    targetId: 'tasker-001',
    targetName: 'John Banda',
    userId: 'user-002',
    overallRating: 4,
    categoryRatings: { speed: 4, communication: 5, handling: 4, professionalism: 5 },
    review: 'Good delivery, arrived on time.',
    quickFeedback: ['On time', 'Great communication'],
    createdAt: '2025-12-27T14:15:00Z',
  },
  {
    id: 'rev-003',
    orderId: 'ord-003',
    targetType: 'vendor',
    targetId: 'vendor-001',
    targetName: 'Hungry Lion',
    userId: 'user-001',
    overallRating: 5,
    review: 'Food was delicious and well packaged!',
    createdAt: '2025-12-26T18:45:00Z',
  },
  {
    id: 'rev-004',
    orderId: 'ord-004',
    targetType: 'tasker',
    targetId: 'tasker-002',
    targetName: 'Mary Phiri',
    userId: 'user-003',
    overallRating: 5,
    categoryRatings: { speed: 5, communication: 5, handling: 5, professionalism: 5 },
    review: 'Best tasker ever! Will definitely request again.',
    quickFeedback: ['Fast delivery', 'Careful handling', 'Would recommend'],
    tipAmount: 50,
    createdAt: '2025-12-25T12:00:00Z',
  },
  {
    id: 'rev-005',
    orderId: 'ord-005',
    targetType: 'tasker',
    targetId: 'tasker-001',
    targetName: 'John Banda',
    userId: 'user-004',
    overallRating: 3,
    categoryRatings: { speed: 3, communication: 4, handling: 3, professionalism: 4 },
    review: 'Delivery was okay, but took longer than expected.',
    quickFeedback: ['Great communication'],
    createdAt: '2025-12-24T16:30:00Z',
  },
];

class ReviewsStore {
  private reviews: Review[] = [...MOCK_REVIEWS];

  async loadReviews(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.reviews = [...MOCK_REVIEWS, ...parsed];
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  }

  async saveReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);

    try {
      const userReviews = this.reviews.filter(r => !MOCK_REVIEWS.find(m => m.id === r.id));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userReviews));
    } catch (error) {
      console.error('Failed to save review:', error);
    }

    return newReview;
  }

  getReviewsForTarget(targetType: 'tasker' | 'vendor', targetId: string): Review[] {
    return this.reviews.filter(r => r.targetType === targetType && r.targetId === targetId);
  }

  getReviewsByUser(userId: string): Review[] {
    return this.reviews.filter(r => r.userId === userId);
  }

  getStatsForTarget(targetType: 'tasker' | 'vendor', targetId: string): ReviewStats {
    const reviews = this.getReviewsForTarget(targetType, targetId);
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        topFeedback: [],
      };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.overallRating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      ratingDistribution[r.overallRating] = (ratingDistribution[r.overallRating] || 0) + 1;
    });

    const feedbackCounts: Record<string, number> = {};
    reviews.forEach(r => {
      r.quickFeedback?.forEach(f => {
        feedbackCounts[f] = (feedbackCounts[f] || 0) + 1;
      });
    });

    const topFeedback = Object.entries(feedbackCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feedback]) => feedback);

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
      topFeedback,
    };
  }

  getAllReviews(): Review[] {
    return [...this.reviews];
  }
}

export const reviewsStore = new ReviewsStore();
