import { create } from 'zustand';

export type AvailabilityStatus = 'online' | 'offline' | 'on-break';

interface CurrentSession {
  startTime: number;
  earnings: number;
}

interface AvailabilityState {
  status: AvailabilityStatus;
  currentSession: CurrentSession | null;
  setStatus: (status: AvailabilityStatus) => void;
  getTodayOnlineTime: () => number;
}

export const useAvailabilityStore = create<AvailabilityState>((set, get) => ({
  status: 'offline',
  currentSession: null,
  setStatus: (status: AvailabilityStatus) => set({ status }),
  getTodayOnlineTime: () => {
    const session = get().currentSession;
    if (!session) return 0;
    return Date.now() - session.startTime;
  },
}));
