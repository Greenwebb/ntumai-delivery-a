// Real-time status update service for job/delivery tracking
import { isDemoMode } from '@/lib/config/demo-mode';

type JobStatus = 'pending' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

interface StatusUpdate {
  jobId: string;
  status: JobStatus;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  message?: string;
}

type StatusUpdateCallback = (update: StatusUpdate) => void;

class StatusUpdateService {
  private listeners: Map<string, Set<StatusUpdateCallback>> = new Map();
  private mockInterval: NodeJS.Timeout | null = null;

  /**
   * Subscribe to status updates for a specific job
   */
  subscribe(jobId: string, callback: StatusUpdateCallback) {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, new Set());
    }
    this.listeners.get(jobId)!.add(callback);

    // In demo mode, simulate status updates
    if (isDemoMode() && !this.mockInterval) {
      this.startMockUpdates(jobId);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(jobId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(jobId);
        }
      }
    };
  }

  /**
   * Publish a status update to all subscribers
   */
  publish(update: StatusUpdate) {
    const callbacks = this.listeners.get(update.jobId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(update));
    }
  }

  /**
   * Update job status (called by tasker)
   */
  async updateStatus(jobId: string, status: JobStatus, location?: { latitude: number; longitude: number }) {
    const update: StatusUpdate = {
      jobId,
      status,
      timestamp: new Date().toISOString(),
      location,
      message: this.getStatusMessage(status),
    };

    if (isDemoMode()) {
      // In demo mode, just publish the update
      this.publish(update);
      return update;
    }

    // In production, send to backend API
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/jobs/${jobId}/status`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status, location }),
      // });
      // const data = await response.json();
      // this.publish(data);
      // return data;
      
      this.publish(update);
      return update;
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  }

  /**
   * Get current job status
   */
  async getStatus(jobId: string): Promise<StatusUpdate | null> {
    if (isDemoMode()) {
      // Return mock status
      return {
        jobId,
        status: 'in_progress',
        timestamp: new Date().toISOString(),
        location: {
          latitude: -15.4012,
          longitude: 28.3132,
        },
        message: 'Tasker is on the way',
      };
    }

    // In production, fetch from backend
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/jobs/${jobId}/status`);
      // return await response.json();
      return null;
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  }

  /**
   * Simulate status updates in demo mode
   */
  private startMockUpdates(jobId: string) {
    const statuses: JobStatus[] = ['accepted', 'en_route', 'arrived', 'in_progress', 'completed'];
    let currentIndex = 0;

    this.mockInterval = setInterval(() => {
      if (currentIndex < statuses.length) {
        const update: StatusUpdate = {
          jobId,
          status: statuses[currentIndex],
          timestamp: new Date().toISOString(),
          location: {
            latitude: -15.4012 + Math.random() * 0.01,
            longitude: 28.3132 + Math.random() * 0.01,
          },
          message: this.getStatusMessage(statuses[currentIndex]),
        };
        this.publish(update);
        currentIndex++;
      } else {
        this.stopMockUpdates();
      }
    }, 10000); // Update every 10 seconds in demo mode
  }

  /**
   * Stop mock updates
   */
  private stopMockUpdates() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  /**
   * Get human-readable message for status
   */
  private getStatusMessage(status: JobStatus): string {
    switch (status) {
      case 'pending':
        return 'Waiting for tasker to accept';
      case 'accepted':
        return 'Tasker accepted your request';
      case 'en_route':
        return 'Tasker is on the way';
      case 'arrived':
        return 'Tasker has arrived';
      case 'in_progress':
        return 'Job is in progress';
      case 'completed':
        return 'Job completed successfully';
      case 'cancelled':
        return 'Job was cancelled';
      default:
        return 'Status unknown';
    }
  }

  /**
   * Clean up all listeners
   */
  cleanup() {
    this.listeners.clear();
    this.stopMockUpdates();
  }
}

export const statusUpdateService = new StatusUpdateService();
