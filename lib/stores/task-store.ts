
import { create } from 'zustand';
import { createPersistentStore } from './utils/persistent-store';

export interface DeliveryAddress {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  country?: string;
}

export interface Task {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: string;
  items: string[];
  budget: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  location: DeliveryAddress;
  createdAt: string;
  completedAt?: string;
  totalSpent?: number;
  rating?: number;
  review?: string;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  availableTasks: Task[];
  isLoading: boolean;
  error: string | null;
}

interface TaskStore extends TaskState {
  // Task actions
  createTask: (taskData: Partial<Task>) => Promise<Task | null>;
  getTasks: (userId: string, role?: 'customer' | 'tasker') => Promise<void>;
  getTaskDetail: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  rateTask: (taskId: string, rating: number, review?: string) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;

  // Available tasks for taskers
  getAvailableTasks: () => void;

  // State management
  setCurrentTask: (task: Task | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  availableTasks: [],
  isLoading: false,
  error: null,
};

export const useTaskStore = create<TaskStore>()(
  createPersistentStore(
    (set, get) => ({
      ...initialState,

      createTask: async (taskData: Partial<Task>) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const task = await trpc.tasks.create.mutate(taskData);
          // set((state) => ({
          //   tasks: [task, ...state.tasks],
          //   currentTask: task,
          //   isLoading: false,
          // }));
          // return task;
          
          // Mock data for now
          set({ isLoading: false });
          return null;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      getTasks: async (userId: string, role?: 'customer' | 'tasker') => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const tasks = await trpc.tasks.getAll.query({ userId, role });
          // set({ tasks, isLoading: false });
          
          // Mock data for now
          set({ tasks: [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      getTaskDetail: async (taskId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const task = await trpc.tasks.getById.query({ taskId });
          // set({ currentTask: task, isLoading: false });
          
          // Mock data for now
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateTaskStatus: async (taskId: string, status: Task['status']) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // await trpc.tasks.updateStatus.mutate({ taskId, status });
          
          set((state) => {
            const tasks = state.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task
            );
            const currentTask =
              state.currentTask?.id === taskId
                ? { ...state.currentTask, status }
                : state.currentTask;
            return { tasks, currentTask, isLoading: false };
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      rateTask: async (taskId: string, rating: number, review?: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // await trpc.tasks.rate.mutate({ taskId, rating, review });
          
          set((state) => {
            const tasks = state.tasks.map((task) =>
              task.id === taskId ? { ...task, rating, review } : task
            );
            const currentTask =
              state.currentTask?.id === taskId
                ? { ...state.currentTask, rating, review }
                : state.currentTask;
            return { tasks, currentTask, isLoading: false };
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      cancelTask: async (taskId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // await trpc.tasks.cancel.mutate({ taskId });
          
          set((state) => {
            const tasks = state.tasks.map((task) =>
              task.id === taskId ? { ...task, status: 'cancelled' as const } : task
            );
            const currentTask =
              state.currentTask?.id === taskId
                ? { ...state.currentTask, status: 'cancelled' as const }
                : state.currentTask;
            return { tasks, currentTask, isLoading: false };
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      getAvailableTasks: () => {
        // TODO: Implement with real-time updates
        // This would typically connect to a WebSocket or polling mechanism
        set({ availableTasks: [] });
      },

      setCurrentTask: (task: Task | null) => {
        set({ currentTask: task });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'task-store',
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);
