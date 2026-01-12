import { TaskerStats, BadgeTier, calculateBadgeTier } from '../../components/tasker-badge';

/**
 * Mock tasker profiles with different badge tiers
 */
export const MOCK_TASKER_STATS: TaskerStats[] = [
  {
    totalDeliveries: 12,
    rating: 4.2,
    completionRate: 85,
    currentTier: 'bronze',
  },
  {
    totalDeliveries: 78,
    rating: 4.6,
    completionRate: 92,
    currentTier: 'silver',
  },
  {
    totalDeliveries: 245,
    rating: 4.8,
    completionRate: 96,
    currentTier: 'gold',
  },
  {
    totalDeliveries: 612,
    rating: 4.95,
    completionRate: 99,
    currentTier: 'platinum',
  },
];

/**
 * Get mock tasker stats by tier
 */
export function getMockTaskerStatsByTier(tier: BadgeTier): TaskerStats {
  const stats = MOCK_TASKER_STATS.find(s => s.currentTier === tier);
  return stats || MOCK_TASKER_STATS[0];
}

/**
 * Get mock tasker stats by index
 */
export function getMockTaskerStats(index: number = 0): TaskerStats {
  return MOCK_TASKER_STATS[index % MOCK_TASKER_STATS.length];
}

/**
 * Generate random tasker stats
 */
export function generateRandomTaskerStats(): TaskerStats {
  const totalDeliveries = Math.floor(Math.random() * 700);
  const rating = 3.5 + Math.random() * 1.5;
  const completionRate = 70 + Math.random() * 30;

  const currentTier = calculateBadgeTier({
    totalDeliveries,
    rating,
    completionRate,
  });

  return {
    totalDeliveries,
    rating: Math.round(rating * 10) / 10,
    completionRate: Math.round(completionRate),
    currentTier,
  };
}

/**
 * Simulate tasker progress (for demo purposes)
 * Returns a function that updates stats over time
 */
export function simulateTaskerProgress(
  initialStats: TaskerStats,
  onUpdate: (stats: TaskerStats, tierChanged: boolean) => void,
  intervalMs: number = 5000
): () => void {
  let currentStats = { ...initialStats };

  const interval = setInterval(() => {
    const previousTier = currentStats.currentTier;

    // Increment deliveries
    currentStats.totalDeliveries += Math.floor(Math.random() * 3) + 1;

    // Slightly adjust rating (tends toward 4.8)
    const ratingDelta = (4.8 - currentStats.rating) * 0.1 + (Math.random() - 0.5) * 0.1;
    currentStats.rating = Math.max(3.5, Math.min(5.0, currentStats.rating + ratingDelta));
    currentStats.rating = Math.round(currentStats.rating * 10) / 10;

    // Slightly adjust completion rate (tends toward 95%)
    const completionDelta = (95 - currentStats.completionRate) * 0.05 + (Math.random() - 0.5) * 2;
    currentStats.completionRate = Math.max(70, Math.min(100, currentStats.completionRate + completionDelta));
    currentStats.completionRate = Math.round(currentStats.completionRate);

    // Recalculate tier
    currentStats.currentTier = calculateBadgeTier({
      totalDeliveries: currentStats.totalDeliveries,
      rating: currentStats.rating,
      completionRate: currentStats.completionRate,
    });

    const tierChanged = currentStats.currentTier !== previousTier;

    onUpdate({ ...currentStats }, tierChanged);
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Mock leaderboard data
 */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  stats: TaskerStats;
  weeklyEarnings: number;
  weeklyDeliveries: number;
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'John Banda',
    stats: {
      totalDeliveries: 612,
      rating: 4.95,
      completionRate: 99,
      currentTier: 'platinum',
    },
    weeklyEarnings: 2450,
    weeklyDeliveries: 47,
  },
  {
    rank: 2,
    name: 'Mary Mwanza',
    stats: {
      totalDeliveries: 534,
      rating: 4.92,
      completionRate: 98,
      currentTier: 'platinum',
    },
    weeklyEarnings: 2180,
    weeklyDeliveries: 42,
  },
  {
    rank: 3,
    name: 'Peter Phiri',
    stats: {
      totalDeliveries: 298,
      rating: 4.85,
      completionRate: 97,
      currentTier: 'gold',
    },
    weeklyEarnings: 1890,
    weeklyDeliveries: 38,
  },
  {
    rank: 4,
    name: 'Grace Tembo',
    stats: {
      totalDeliveries: 256,
      rating: 4.78,
      completionRate: 96,
      currentTier: 'gold',
    },
    weeklyEarnings: 1650,
    weeklyDeliveries: 35,
  },
  {
    rank: 5,
    name: 'David Mulenga',
    stats: {
      totalDeliveries: 189,
      rating: 4.72,
      completionRate: 94,
      currentTier: 'gold',
    },
    weeklyEarnings: 1420,
    weeklyDeliveries: 31,
  },
  {
    rank: 6,
    name: 'Sarah Chanda',
    stats: {
      totalDeliveries: 112,
      rating: 4.65,
      completionRate: 93,
      currentTier: 'silver',
    },
    weeklyEarnings: 980,
    weeklyDeliveries: 24,
  },
  {
    rank: 7,
    name: 'Michael Zulu',
    stats: {
      totalDeliveries: 87,
      rating: 4.58,
      completionRate: 91,
      currentTier: 'silver',
    },
    weeklyEarnings: 720,
    weeklyDeliveries: 19,
  },
  {
    rank: 8,
    name: 'Elizabeth Ng\'andu',
    stats: {
      totalDeliveries: 56,
      rating: 4.52,
      completionRate: 90,
      currentTier: 'silver',
    },
    weeklyEarnings: 540,
    weeklyDeliveries: 15,
  },
  {
    rank: 9,
    name: 'Joseph Mumba',
    stats: {
      totalDeliveries: 34,
      rating: 4.35,
      completionRate: 88,
      currentTier: 'bronze',
    },
    weeklyEarnings: 380,
    weeklyDeliveries: 11,
  },
  {
    rank: 10,
    name: 'Ruth Sakala',
    stats: {
      totalDeliveries: 18,
      rating: 4.2,
      completionRate: 85,
      currentTier: 'bronze',
    },
    weeklyEarnings: 210,
    weeklyDeliveries: 7,
  },
];

/**
 * Get top N leaderboard entries
 */
export function getTopTaskers(count: number = 10): LeaderboardEntry[] {
  return MOCK_LEADERBOARD.slice(0, count);
}

/**
 * Get tasker rank by name
 */
export function getTaskerRank(name: string): LeaderboardEntry | undefined {
  return MOCK_LEADERBOARD.find(entry => entry.name === name);
}

export default {
  MOCK_TASKER_STATS,
  MOCK_LEADERBOARD,
  getMockTaskerStatsByTier,
  getMockTaskerStats,
  generateRandomTaskerStats,
  simulateTaskerProgress,
  getTopTaskers,
  getTaskerRank,
};
