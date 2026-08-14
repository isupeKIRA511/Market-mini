import type { AuthResponse } from '../types/api';

/** يدعم استجابة مباشرة أو غلاف ApiGetOneResponse أو كائنات مشتقة من الباكند */
export function extractAuthResponse(body: unknown): AuthResponse | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;

  // البحث عن التوكن في الجذر أو داخل data/result/payload
  const token =
    typeof o.token === 'string'
      ? o.token
      : typeof (o.data as any)?.token === 'string'
      ? (o.data as any).token
      : typeof (o.result as any)?.token === 'string'
      ? (o.result as any).token
      : typeof (o.payload as any)?.token === 'string'
      ? (o.payload as any).token
      : undefined;

  if (!token) return null;

  // البحث عن المعرف (id/userId/customerId) في الجذر أو داخل data/customer/user
  const rawId =
    o.id ??
    o.userId ??
    o.customerId ??
    (o.data as any)?.id ??
    (o.data as any)?.userId ??
    (o.data as any)?.customerId ??
    (o.data as any)?.customer?.id ??
    (o.data as any)?.user?.id ??
    (o.customer as any)?.id ??
    (o.user as any)?.id;

  const id = rawId != null ? String(rawId).trim() : '';

  const phone =
    typeof o.phoneNumber === 'string'
      ? o.phoneNumber
      : typeof (o.data as any)?.phoneNumber === 'string'
      ? (o.data as any).phoneNumber
      : typeof (o.customer as any)?.phoneNumber === 'string'
      ? (o.customer as any).phoneNumber
      : '';

  if (token && (id || token.length > 20)) {
    return {
      id: id || 'user-id',
      token,
      phoneNumber: phone,
    };
  }

  return null;
}
