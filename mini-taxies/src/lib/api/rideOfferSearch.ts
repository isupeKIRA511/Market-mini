/**
 * بناء مسار GET /RideOffer/Search بنفس أسماء المعاملات في Swagger
 * (PickupProvince, DropoffProvince, SeatCount, PageNum, PageSize).
 * القيم العربية تُرمّز عبر URLSearchParams كما في اختبار الطلب المباشر للـ API.
 */

import { get } from 'svelte/store';
import { serverToken } from '../stores/authStore';

export const RIDE_OFFER_SEARCH_DEFAULT_PAGE_SIZE = 20;

export type RideOfferSearchParams = {
  pickupProvince: string;
  dropoffProvince: string;
  seatCount: number;
  oneTripOnly?: boolean;
  pageNum?: number;
  pageSize?: number;
};

/** سلسلة الاستعلام فقط (بدون المسار) */
export function buildRideOfferSearchQueryString(p: RideOfferSearchParams): string {
  const pageNum = p.pageNum ?? 1;
  const pageSize = p.pageSize ?? RIDE_OFFER_SEARCH_DEFAULT_PAGE_SIZE;
  const params = new URLSearchParams();
  params.set('PickupProvince', p.pickupProvince);
  params.set('DropoffProvince', p.dropoffProvince);
  params.set('SeatCount', String(p.seatCount));
  params.set('PageNum', String(pageNum));
  params.set('PageSize', String(pageSize));
  if (p.oneTripOnly !== undefined) {
    params.set('OneTripOnly', String(p.oneTripOnly));
  }
  return params.toString();
}

/** المسار النسبي للعميل: `/RideOffer/Search?...` */
export function rideOfferSearchPath(queryString: string): string {
  return `/RideOffer/Search?${queryString}`;
}

/** الـ API يتطلّب Authorization: Bearer للعميل (كما في Swagger). */
export function hasTokenForRideOfferSearch(): boolean {
  return Boolean(get(serverToken)?.trim());
}
