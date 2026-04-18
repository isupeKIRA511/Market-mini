/** تطابق Guid لـ rideOfferId في ASP.NET — يُستخرج من أسماء حقول متعددة في JSON */

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRideOfferGuid(v: unknown): v is string {
  return typeof v === 'string' && GUID_RE.test(v.trim());
}

/** صف من RideOffer/Search قد يحمل المعرّف بأسماء مختلفة (camelCase / PascalCase / snake_case) */
export function extractRideOfferGuidFromSearchRow(row: unknown): string | null {
  if (row == null || typeof row !== 'object') return null;
  const o = row as Record<string, unknown>;
  const keys = [
    'rideOfferId',
    'RideOfferId',
    'ride_offer_id',
    'id',
    'Id',
    'offerId',
    'OfferId',
  ];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && isRideOfferGuid(v)) return v.trim();
  }
  return null;
}
