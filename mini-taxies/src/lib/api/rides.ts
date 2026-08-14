import { apiClient } from './client';
import type {
  ApiGetOneResponse,
  CreateRideOfferRequest,
  RequestRideRequest,
  RideModel,
  RideOffersSearchFields,
} from '../types/api';

/**
 * طلب رحلة (Customer Request Ride) مع إرسال إحداثيات الانطلاق لـ Dynamic Pricing.
 * POST /Ride (أو /rides)
 */
export async function requestRide(payload: RequestRideRequest): Promise<RideModel> {
  const res = await apiClient.post<ApiGetOneResponse<RideModel> | { data: RideModel; success: boolean; message: string }>('/Ride', payload);
  const data = res.data;
  if ('data' in data && data.data) {
    return data.data;
  }
  return data as unknown as RideModel;
}

/**
 * إنشاء عرض رحلة للسائق (Driver Create Offer).
 * POST /RideOffer (أو /rideoffers)
 * ملاحظة: تم إلغاء حقل price من جسم الطلب حسب عقد frontend_contract.md.
 */
export async function createRideOffer(payload: CreateRideOfferRequest): Promise<RideOffersSearchFields> {
  const res = await apiClient.post<ApiGetOneResponse<RideOffersSearchFields> | { data: RideOffersSearchFields }>('/RideOffer', payload);
  const data = res.data;
  if ('data' in data && data.data) {
    return data.data;
  }
  return data as unknown as RideOffersSearchFields;
}
