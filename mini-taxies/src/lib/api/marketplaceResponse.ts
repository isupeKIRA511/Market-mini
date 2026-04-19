/** تطبيع ردود القوائم الشائعة من REST / OpenAPI بدون افتراض شكل ثابت */

export function extractRecordArray(raw: unknown): Record<string, unknown>[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (typeof raw !== 'object') return [];
  const o = raw as Record<string, unknown>;

  if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
  if (Array.isArray(o.Items)) return o.Items as Record<string, unknown>[];
  if (Array.isArray(o.Data)) return o.Data as Record<string, unknown>[];
  if (Array.isArray(o.data) && (o.data[0] === undefined || typeof o.data[0] === 'object')) {
    return o.data as Record<string, unknown>[];
  }
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    const inner = o.data as Record<string, unknown>;
    if (Array.isArray(inner.items)) return inner.items as Record<string, unknown>[];
    if (Array.isArray(inner.Items)) return inner.Items as Record<string, unknown>[];
  }
  if (o.Data && typeof o.Data === 'object' && !Array.isArray(o.Data)) {
    const inner = o.Data as Record<string, unknown>;
    if (Array.isArray(inner.items)) return inner.items as Record<string, unknown>[];
  }
  if (Array.isArray(o.results)) return o.results as Record<string, unknown>[];
  if (Array.isArray(o.value)) return o.value as Record<string, unknown>[];
  if (Array.isArray(o.Value)) return o.Value as Record<string, unknown>[];
  if (o.success === true && Array.isArray(o.data)) return o.data as Record<string, unknown>[];
  return [];
}

export function extractRecord(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.success === true && o.data != null && typeof o.data === 'object' && !Array.isArray(o.data)) {
    return o.data as Record<string, unknown>;
  }
  return o;
}
