/**
 * عميل HTTP موحّد: نفس الأصل الافتراضي لـ `public/client/config.ts`
 * ويُرفق Bearer تلقائيًا بعد تسجيل الدخول.
 */

import { get } from 'svelte/store';
import { apiBaseUrl } from '../config/features';
import { serverToken } from '../stores/authStore';

function buildHeaders(extra?: HeadersInit): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = get(serverToken);
  if (token) h.Authorization = `Bearer ${token}`;
  if (extra && typeof extra === 'object' && !(extra instanceof Headers)) {
    Object.assign(h, extra as Record<string, string>);
  }
  return h;
}

async function handleResponse<T>(response: Response): Promise<{ data: T; status: number; statusText: string }> {
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  if (!response.ok) {
    console.error('API Error:', data ?? response.statusText);
    let message = response.statusText;
    if (typeof data === 'string') {
      message = data;
    } else if (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string') {
      message = (data as { message: string }).message;
    }
    const error: Error & { response?: { data: unknown; status: number; statusText: string } } = new Error(message);
    error.response = { data, status: response.status, statusText: response.statusText };
    throw error;
  }
  return { data: data as T, status: response.status, statusText: response.statusText };
}

export const apiClient = {
  get: async <T>(url: string, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'GET',
      headers: buildHeaders(optHeaders),
      ...rest,
    });
    return handleResponse<T>(response);
  },
  post: async <T>(url: string, body?: unknown, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const init: RequestInit = {
      method: 'POST',
      headers: buildHeaders(optHeaders),
      ...rest,
    };
    if (body !== undefined) {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    const response = await fetch(`${apiBaseUrl}${url}`, init);
    return handleResponse<T>(response);
  },
  put: async <T>(url: string, body: unknown, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'PUT',
      headers: buildHeaders(optHeaders),
      body: JSON.stringify(body),
      ...rest,
    });
    return handleResponse<T>(response);
  },
  patch: async <T>(url: string, body: unknown, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'PATCH',
      headers: buildHeaders(optHeaders),
      body: JSON.stringify(body),
      ...rest,
    });
    return handleResponse<T>(response);
  },
  delete: async <T>(url: string, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'DELETE',
      headers: buildHeaders(optHeaders),
      ...rest,
    });
    return handleResponse<T>(response);
  },
};
