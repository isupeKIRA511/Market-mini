import type { AuthResponse } from '../types/api';

/** يدعم استجابة مباشرة أو غلاف ApiGetOneResponse من الباكند */
export function extractAuthResponse(body: unknown): AuthResponse | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (typeof o.token === 'string' && typeof o.id === 'string') {
    return {
      id: o.id,
      token: o.token,
      phoneNumber: typeof o.phoneNumber === 'string' ? o.phoneNumber : '',
    };
  }
  const inner = o.data;
  if (inner && typeof inner === 'object') {
    const d = inner as Record<string, unknown>;
    if (typeof d.token === 'string' && typeof d.id === 'string') {
      return {
        id: String(d.id),
        token: d.token,
        phoneNumber: typeof d.phoneNumber === 'string' ? d.phoneNumber : '',
      };
    }
  }
  return null;
}
