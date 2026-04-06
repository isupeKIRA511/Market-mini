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

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    console.error('API Error:', data || response.statusText);
    const error: Error & { response?: { data: unknown; status: number; statusText: string } } = new Error(
      (data as { message?: string })?.message || response.statusText
    );
    error.response = { data, status: response.status, statusText: response.statusText };
    throw error;
  }
  return { data, status: response.status, statusText: response.statusText };
}

export const apiClient = {
  get: async <T>(url: string, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'GET',
      headers: buildHeaders(optHeaders),
      ...rest,
    });
    return handleResponse(response);
  },
  post: async <T>(url: string, body: unknown, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'POST',
      headers: buildHeaders(optHeaders),
      body: JSON.stringify(body),
      ...rest,
    });
    return handleResponse(response);
  },
  put: async <T>(url: string, body: unknown, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'PUT',
      headers: buildHeaders(optHeaders),
      body: JSON.stringify(body),
      ...rest,
    });
    return handleResponse(response);
  },
  patch: async <T>(url: string, body: unknown, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'PATCH',
      headers: buildHeaders(optHeaders),
      body: JSON.stringify(body),
      ...rest,
    });
    return handleResponse(response);
  },
  delete: async <T>(url: string, options?: RequestInit): Promise<{ data: T; status: number; statusText: string }> => {
    const { headers: optHeaders, ...rest } = options || {};
    const response = await fetch(`${apiBaseUrl}${url}`, {
      method: 'DELETE',
      headers: buildHeaders(optHeaders),
      ...rest,
    });
    return handleResponse(response);
  },
};
