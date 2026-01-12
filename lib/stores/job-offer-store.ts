import { create } from 'zustand';
import { JobOffer } from '@/components/job-offer-modal';

interface JobOfferState {
  currentOffer: JobOffer | null;
  isModalVisible: boolean;
  acceptedJobs: string[];
  declinedJobs: string[];
  timedOutJobs: string[];
  isOnline: boolean; // Tasker availability status
}

interface JobOfferStore extends JobOfferState {
  // Actions
  showOffer: (offer: JobOffer) => void;
  hideOffer: () => void;
  acceptOffer: (offerId: string) => void;
  declineOffer: (offerId: string) => void;
  timeoutOffer: (offerId: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  clearHistory: () => void;
}

/**
 * Job Offer Store
 * Manages tasker job offer notifications and responses
 * Blueprint: "Full-screen, call-like notification with swipe-to-accept"
 */
export const useJobOfferStore = create<JobOfferStore>()((set, get) => ({
  // Initial state
  currentOffer: null,
  isModalVisible: false,
  acceptedJobs: [],
  declinedJobs: [],
  timedOutJobs: [],
  isOnline: false,

  // Show a new job offer
  showOffer: (offer: JobOffer) => {
    const { isOnline, currentOffer } = get();
    
    // Only show if tasker is online and no current offer
    if (isOnline && !currentOffer) {
      set({
        currentOffer: offer,
        isModalVisible: true,
      });
    }
  },

  // Hide the current offer modal
  hideOffer: () => {
    set({
      currentOffer: null,
      isModalVisible: false,
    });
  },

  // Accept a job offer
  acceptOffer: (offerId: string) => {
    const { acceptedJobs } = get();
    
    set({
      acceptedJobs: [...acceptedJobs, offerId],
      currentOffer: null,
      isModalVisible: false,
    });

    // TODO: Send acceptance to server
    console.log(`Job ${offerId} accepted`);
  },

  // Decline a job offer
  declineOffer: (offerId: string) => {
    const { declinedJobs } = get();
    
    set({
      declinedJobs: [...declinedJobs, offerId],
      currentOffer: null,
      isModalVisible: false,
    });

    // TODO: Send decline to server
    console.log(`Job ${offerId} declined`);
  },

  // Handle offer timeout
  timeoutOffer: (offerId: string) => {
    const { timedOutJobs } = get();
    
    set({
      timedOutJobs: [...timedOutJobs, offerId],
      currentOffer: null,
      isModalVisible: false,
    });

    // TODO: Notify server of timeout
    console.log(`Job ${offerId} timed out`);
  },

  // Set tasker online/offline status
  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
    
    // If going offline, hide any current offer
    if (!isOnline) {
      set({
        currentOffer: null,
        isModalVisible: false,
      });
    }
  },

  // Clear job history
  clearHistory: () => {
    set({
      acceptedJobs: [],
      declinedJobs: [],
      timedOutJobs: [],
    });
  },
}));

export default useJobOfferStore;
