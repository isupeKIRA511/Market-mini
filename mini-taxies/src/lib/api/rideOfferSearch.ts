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
  pickupLatitude?: number;
  pickupLongitude?: number;
  oneTripOnly?: boolean;
  pageNum?: number;
  pageSize?: number;
};

/** سلسلة الاستعلام فقط (بدون المسار) */
export function buildRideOfferSearchQueryString(p: RideOfferSearchParams): string {
  const pageNum = p.pageNum ?? 1;
  const pageSize = p.pageSize ?? RIDE_OFFER_SEARCH_DEFAULT_PAGE_SIZE;
  const params = new URLSearchParams();
  // إرسال كلاً من PascalCase و camelCase لضمان مطابقة نموذج الخادم مهما كان إعداده
  params.set('PickupProvince', p.pickupProvince);
  params.set('pickupProvince', p.pickupProvince);
  params.set('DropoffProvince', p.dropoffProvince);
  params.set('dropoffProvince', p.dropoffProvince);
  params.set('SeatCount', String(p.seatCount));
  params.set('seatCount', String(p.seatCount));
  if (p.pickupLatitude !== undefined && Number.isFinite(p.pickupLatitude)) {
    params.set('PickupLatitude', String(p.pickupLatitude));
    params.set('pickupLatitude', String(p.pickupLatitude));
  }
  if (p.pickupLongitude !== undefined && Number.isFinite(p.pickupLongitude)) {
    params.set('PickupLongitude', String(p.pickupLongitude));
    params.set('pickupLongitude', String(p.pickupLongitude));
  }
  params.set('PageNum', String(pageNum));
  params.set('pageNum', String(pageNum));
  params.set('PageSize', String(pageSize));
  params.set('pageSize', String(pageSize));
  if (p.oneTripOnly !== undefined) {
    params.set('OneTripOnly', String(p.oneTripOnly));
    params.set('oneTripOnly', String(p.oneTripOnly));
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
