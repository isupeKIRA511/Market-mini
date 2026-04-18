import { apiClient } from './client';
import { extractRideOfferGuidFromSearchRow } from './rideOfferGuid';
import { govNameVariants } from '../data/govNameVariants';

/** يحاول استخراج أول rideOfferId GUID من RideOffer/Search (نفس منطق السوق) */
export async function resolveRideOfferIdFromSearch(
  fromGov: string,
  toGov: string,
  seatCount: number,
): Promise<string | null> {
  const pickupCandidates = govNameVariants[fromGov] || [fromGov];
  const dropoffCandidates = govNameVariants[toGov] || [toGov];

  for (const pickup of pickupCandidates) {
    for (const dropoff of dropoffCandidates) {
      const params = new URLSearchParams({
        PickupProvince: pickup,
        DropoffProvince: dropoff,
        SeatCount: String(seatCount),
        PageNum: '1',
        PageSize: '20',
      });
      const res = await apiClient.get<unknown>(`/RideOffer/Search?${params.toString()}`);
      const body = res.data as { data?: unknown[] };
      const list = body?.data ?? [];
      for (const item of list) {
        const g = extractRideOfferGuidFromSearchRow(item);
        if (g) return g;
      }
    }
  }
  return null;
}
