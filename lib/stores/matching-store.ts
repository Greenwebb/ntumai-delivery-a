
// Matching store slice for auto-matching
import { create } from 'zustand';
import { matchingMockService } from '@/lib/api/mockServices.extended';

interface MatchingState {
  isMatching: boolean;
  matchedTasker: any | null;
  availableTaskers: any[];
  estimatedWaitTime: string;
  estimatedEarnings: number;
  estimatedArrival: number;
  matchingError: string | null;
  matchingProgress: number; // 0-100

  // Actions
  startMatching: (jobData: any) => Promise<void>;
  cancelMatching: () => void;
  updateMatchingProgress: (progress: number) => void;
  setMatchedTasker: (tasker: any) => void;
  getAvailableTaskers: (location: any) => Promise<void>;
  clearMatching: () => void;
}

export const useMatchingStore = create<MatchingState>((set) => ({
  isMatching: false,
  matchedTasker: null,
  availableTaskers: [],
  estimatedWaitTime: '2-3 minutes',
  estimatedEarnings: 0,
  estimatedArrival: 0,
  matchingError: null,
  matchingProgress: 0,

  startMatching: async (jobData: any) => {
    set({ isMatching: true, matchingError: null, matchingProgress: 0 });

    try {
      // Simulate matching progress
      set({ matchingProgress: 25 });
      await new Promise((resolve) => setTimeout(resolve, 500));

      set({ matchingProgress: 50 });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get matched tasker
      const response = await matchingMockService.findTasker(jobData);
      if (response.success) {
        set({
          matchedTasker: response.data,
          estimatedEarnings: response.data.estimatedEarnings,
          estimatedArrival: response.data.estimatedArrival,
          matchingProgress: 100,
        });
      }

      set({ isMatching: false });
    } catch (error) {
      set({
        matchingError: error instanceof Error ? error.message : 'Matching failed',
        isMatching: false,
      });
    }
  },

  cancelMatching: () => {
    set({
      isMatching: false,
      matchedTasker: null,
      matchingProgress: 0,
    });
  },

  updateMatchingProgress: (progress: number) => {
    set({ matchingProgress: Math.min(progress, 100) });
  },

  setMatchedTasker: (tasker: any) => {
    set({ matchedTasker: tasker });
  },

  getAvailableTaskers: async (location: any) => {
    try {
      const response = await matchingMockService.getAvailableTaskers(location);
      if (response.success) {
        set({ availableTaskers: response.data });
      }
    } catch (error) {
      set({
        matchingError: error instanceof Error ? error.message : 'Failed to get taskers',
      });
    }
  },

  clearMatching: () => {
    set({
      isMatching: false,
      matchedTasker: null,
      availableTaskers: [],
      matchingProgress: 0,
      matchingError: null,
    });
  },
}));

