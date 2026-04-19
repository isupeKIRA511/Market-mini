/** تطابق Guid لـ rideOfferId — يُستخرج من أسماء حقول متعددة (Swagger: RideRequest يعتمد على UUID) */

/** يقبل أي UUID قياسي (يشمل إصدارات متعددة دون تقييد خانة الإصدار) */
const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** بعض م serializers ترجع {xxxxxxxx-xxxx...} */
function stripGuidBraces(s: string): string {
  return s.trim().replace(/^\{|\}$/g, '');
}

export function isRideOfferGuid(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  const s = stripGuidBraces(v);
  return GUID_RE.test(s);
}

/** يعيد GUID بدون أقواس للاستخدام في POST /Ride */
export function normalizeRideOfferGuidString(v: string): string {
  return stripGuidBraces(v);
}

/** تفضيل مفتاح يبدو أنه معرّف عرض وليس شركة/سائق/راكب */
function scoreKeyForRideOfferId(key: string): number {
  const k = key.toLowerCase();
  if (/company|driver|passenger|customer|owner|vehicle|carid/i.test(k)) return -1;
  if (k === 'rideofferid' || k === 'ride_offer_id') return 100;
  if (k === 'offerid' || k === 'offer_id') return 95;
  if (k.includes('rideoffer') && k.includes('id')) return 90;
  if (k === 'id' || k === 'uuid') return 70;
  if (k.includes('offer') && k.includes('id')) return 85;
  if (k.endsWith('id')) return 20;
  return 0;
}

type GuidCandidate = { value: string; score: number };

function collectGuidCandidates(obj: unknown, keyPath: string[], out: GuidCandidate[]): void {
  if (obj == null) return;
  if (typeof obj === 'string' && isRideOfferGuid(obj)) {
    const key = keyPath[keyPath.length - 1] ?? '';
    const score = scoreKeyForRideOfferId(key);
    if (score >= 0) out.push({ value: normalizeRideOfferGuidString(obj), score });
    return;
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) collectGuidCandidates(obj[i], [...keyPath, `[${i}]`], out);
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      collectGuidCandidates(v, [...keyPath, k], out);
    }
  }
}

/** أسماء مباشرة على صف GET /RideOffer/Search — الخادم يعيد عادةً `id` (UUID) أو `rideOfferId` */
const DIRECT_KEYS = [
  'rideOfferId',
  'RideOfferId',
  'RideOfferID',
  'rideOfferID',
  'ride_offer_id',
  'id',
  'Id',
  'ID',
  'offerId',
  'OfferId',
  'OfferID',
];

/** صف من RideOffer/Search قد يحمل المعرّف بأسماء مختلفة (camelCase / PascalCase أو داخل كائن متداخل) */
export function extractRideOfferGuidFromSearchRow(row: unknown): string | null {
  if (row == null || typeof row !== 'object') return null;
  const o = row as Record<string, unknown>;
  for (const k of DIRECT_KEYS) {
    const v = o[k];
    if (typeof v === 'string' && isRideOfferGuid(v)) return normalizeRideOfferGuidString(v);
  }

  const candidates: GuidCandidate[] = [];
  collectGuidCandidates(row, [], candidates);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (best.score >= 70) return best.value;
  return null;
}
