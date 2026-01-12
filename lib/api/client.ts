// @ts-nocheck

import { ApiResponse, ApiError } from './types';
import { getBaseUrl } from './config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  requiresAuth?: boolean;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: boolean;
}

const DEFAULT_TIMEOUT = 30000;

class SimpleApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || getBaseUrl()).replace(/\/$/, '');
  }

  setAuthToken(token: string | null): void {
    this.token = token;
  }

  async get<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request('GET', path, undefined, options);
  }

  async post<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request('POST', path, body, options);
  }

  async put<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request('PUT', path, body, options);
  }

  async patch<T = any>(path: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request('PATCH', path, body, options);
  }

  async delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const requiresAuth = options.requiresAuth ?? true;
    if (requiresAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = await response.text();
      const json = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const error: ApiError = {
          message: json?.message || response.statusText,
          status: response.status,
          code: json?.error,
          details: json?.errors,
          timestamp: new Date().toISOString(),
        };

        return {
          success: false,
          data: json?.data,
          message: error.message,
          error: error.message,
          errors: json?.errors,
        };
      }

      if (json && typeof json === 'object') {
        return {
          success: json.success ?? true,
          data: json.data ?? json,
          message: json.message,
          error: json.error,
          errors: json.errors,
          meta: json.meta,
        };
      }

      return {
        success: true,
        data: json as T,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      const error: ApiError = {
        message: err?.message || 'Network request failed',
        status: err?.status,
        code: err?.code,
        details: err,
        timestamp: new Date().toISOString(),
      };

      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }
}

const defaultClient = new SimpleApiClient();

export { SimpleApiClient as ApiClient };
export const apiClient = defaultClient;
export type { RequestOptions as ApiRequestOptions };

