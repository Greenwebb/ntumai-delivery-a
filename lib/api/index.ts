// @ts-nocheck

// Core HTTP client and shared types
export { ApiClient, apiClient } from './client';
export * from './base';
export type { ApiResponse, ApiError, RequestConfig, ApiEndpoint } from './types';

// Configuration & helpers
export * from './config';
export * from './mockAuth';

// Feature-specific API surfaces (currently implemented)
export * from './auth';
export * from './restaurants';
export * from './orders';
export * from './payments';

// Modular namespaces for the new architecture
export * as AuthApi from './modules/auth';
