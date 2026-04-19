import { apiClient } from './client';
import { extractRideOfferGuidFromSearchRow } from './rideOfferGuid';
import { extractRecordArray } from './marketplaceResponse';
import { expandProvinceSearchVariants } from '../data/govNameVariants';
import {
  buildRideOfferSearchQueryString,
  hasTokenForRideOfferSearch,
  rideOfferSearchPath,
} from './rideOfferSearch';

/** يحاول استخراج أول rideOfferId GUID من RideOffer/Search (نفس منطق السوق) */
export async function resolveRideOfferIdFromSearch(
  fromGov: string,
  toGov: string,
  seatCount: number,
): Promise<string | null> {
  if (!hasTokenForRideOfferSearch()) return null;

  const pickupCandidates = expandProvinceSearchVariants(fromGov);
  const dropoffCandidates = expandProvinceSearchVariants(toGov);

  for (const pickup of pickupCandidates) {
    for (const dropoff of dropoffCandidates) {
      const qs = buildRideOfferSearchQueryString({
        pickupProvince: pickup,
        dropoffProvince: dropoff,
        seatCount,
        pageNum: 1,
        pageSize: 20,
      });
      const res = await apiClient.get<unknown>(rideOfferSearchPath(qs));
      const list = extractRecordArray(res.data);
      for (const item of list) {
        const g = extractRideOfferGuidFromSearchRow(item);
        if (g) return g;
      }
    }
  }
  return null;
}
