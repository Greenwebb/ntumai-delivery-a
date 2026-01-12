import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Check if we're in a browser/server environment
const isServer = typeof window === 'undefined';
import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type PersistOptions = {
  name: string;
  storage?: {
    getItem: (name: string) => Promise<string | null>;
    setItem: (name: string, value: string) => Promise<void>;
    removeItem: (name: string) => Promise<void>;
  };
  partialize?: (state: any) => Partial<any>;
  onRehydrateStorage?: (state: any) => void;
};

/**
 * Create a persistent Zustand store with AsyncStorage
 * Adapted from app.zip persistent store pattern
 */
export const createPersistentStore = <T extends object>(
  config: StateCreator<T, [], []>,
  options: PersistOptions
) => {
  const storage = options.storage || {
    getItem: async (name: string) => {
      // Skip AsyncStorage on server-side
      if (isServer) return null;
      
      try {
        return await AsyncStorage.getItem(name);
      } catch (error) {
        console.error(`Error getting item ${name} from AsyncStorage:`, error);
        return null;
      }
    },
    setItem: async (name: string, value: string) => {
      // Skip AsyncStorage on server-side
      if (isServer) return;
      
      try {
        await AsyncStorage.setItem(name, value);
      } catch (error) {
        console.error(`Error setting item ${name} in AsyncStorage:`, error);
      }
    },
    removeItem: async (name: string) => {
      // Skip AsyncStorage on server-side
      if (isServer) return;
      
      try {
        await AsyncStorage.removeItem(name);
      } catch (error) {
        console.error(`Error removing item ${name} from AsyncStorage:`, error);
      }
    },
  };

  return (set: any, get: any, api: any) => {
    const initialState = config(set, get, api);

    // Load persisted state on initialization
    const loadPersistedState = async () => {
      try {
        const persistedState = await storage.getItem(options.name);
        if (persistedState) {
          const parsed = JSON.parse(persistedState);
          set(parsed);
          
          if (options.onRehydrateStorage) {
            options.onRehydrateStorage(parsed);
          }
        }
      } catch (error) {
        console.error(`Error loading persisted state for ${options.name}:`, error);
      }
    };

    // Save state to storage whenever it changes
    const persistState = async (state: T) => {
      try {
        const stateToPersist = options.partialize ? options.partialize(state) : state;
        await storage.setItem(options.name, JSON.stringify(stateToPersist));
      } catch (error) {
        console.error(`Error persisting state for ${options.name}:`, error);
      }
    };

    // Wrap set to persist state after each update
    const persistentSet = (partial: any, replace?: boolean) => {
      set(partial, replace);
      const currentState = get();
      persistState(currentState);
    };

    // Load persisted state immediately
    loadPersistedState();

    // Return initial state with persistent set
    return {
      ...initialState,
      _persist: {
        rehydrate: loadPersistedState,
        clear: () => storage.removeItem(options.name),
      },
    };
  };
};

/**
 * Helper to create a store with persistence
 */
export const persist = <T extends object>(
  config: StateCreator<T, [], []>,
  options: PersistOptions
) => createPersistentStore(config, options);
