/**
 * API Client with CSRF protection
 *
 * This client automatically:
 * 1. Reads the XSRF-TOKEN cookie
 * 2. Sends it as X-XSRF-TOKEN header on mutations
 * 3. Handles 401 errors by redirecting to login
 */

import type { ApiError } from '../types';
import { translateError } from './errorTranslations';

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
}

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  status: number;
  data?: ApiError;

  constructor(message: string, status: number, data?: ApiError) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make an API request with CSRF protection
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  const headers = new Headers(options.headers || {});

  // Add CSRF token for mutating requests
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      headers.set('X-XSRF-TOKEN', csrfToken);
    }
  }

  // Set Content-Type for JSON requests
  // Use merge-patch+json for PATCH requests (API Platform requirement)
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    const contentType = method === 'PATCH' ? 'application/merge-patch+json' : 'application/json';
    headers.set('Content-Type', contentType);
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...options,
    body,
    headers,
    credentials: 'same-origin',
  });

  // Handle authentication errors
  if (response.status === 401) {
    window.location.href = '/login';
    throw new ApiRequestError('Not authenticated', 401);
  }

  // Handle no content responses
  if (response.status === 204) {
    return undefined as T;
  }

  // Try to parse JSON response
  let data: T | ApiError;
  try {
    data = await response.json();
  } catch {
    throw new ApiRequestError(translateError('Invalid JSON response'), response.status);
  }

  if (!response.ok) {
    const errorData = data as ApiError;
    const rawMessage =
      errorData['hydra:description'] ||
      errorData.message ||
      errorData.error ||
      `API error: ${response.status}`;
    const message = translateError(rawMessage);
    throw new ApiRequestError(message, response.status, errorData);
  }

  return data as T;
}

/**
 * GET request helper
 */
export function apiGet<T = unknown>(url: string): Promise<T> {
  return apiRequest<T>(url);
}

/**
 * POST request helper
 */
export function apiPost<T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D | FormData
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: data as BodyInit,
  });
}

/**
 * PUT request helper
 */
export function apiPut<T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D | FormData
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: data as BodyInit,
  });
}

/**
 * PATCH request helper
 */
export function apiPatch<T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D | FormData
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: data as BodyInit,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T = unknown>(url: string): Promise<T> {
  return apiRequest<T>(url, {
    method: 'DELETE',
  });
}

const api = {
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};

export default api;
