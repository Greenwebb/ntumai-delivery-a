// @ts-nocheck
import { apiClient } from '@/src/api/base/client';
import { ENDPOINTS } from '@/src/api/config';
import { AuthProfileUpdateSchema } from './schemas';
import type { AuthProfileUpdate } from './types';
import type { User } from './types';

export const fetchProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>(ENDPOINTS.AUTH.ME, {
    requiresAuth: true,
    cache: false,
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch profile');
  }

  return response.data;
};

export const updateProfile = async (rawInput: AuthProfileUpdate): Promise<User> => {
  const input = AuthProfileUpdateSchema.parse(rawInput);

  const response = await apiClient.put<User>(ENDPOINTS.AUTH.UPDATE_PROFILE, input, {
    requiresAuth: true,
    cache: false,
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update profile');
  }

  return response.data;
};
