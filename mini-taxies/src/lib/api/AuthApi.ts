/**
 * يطابق `public/client/AuthApi.ts` — طلبات المصادقة على جذر الخادم (بدون Bearer).
 */

import { apiBaseUrl } from '../config/features';
import type { LoginRequest } from '../types/api';

export type AuthLoginError = Error & {
  response?: { data: unknown; status: number; statusText: string };
};

/**
 * POST `/Auth/customer/login`
 * لا يستخدم `apiClient` حتى لا يُرفق Authorization قبل امتلاك التوكن.
 */
export async function postAuthCustomerLogin(data: LoginRequest): Promise<unknown> {
  const response = await fetch(`${apiBaseUrl}/Auth/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    let message = response.statusText || 'Failed to fetch';
    if (parsed && typeof parsed === 'object' && 'message' in parsed) {
      const m = (parsed as { message: unknown }).message;
      if (typeof m === 'string' && m.trim()) message = m;
    }
    const err: AuthLoginError = new Error(message);
    err.response = { data: parsed, status: response.status, statusText: response.statusText };
    throw err;
  }

  return parsed;
}
