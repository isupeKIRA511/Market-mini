import type { BookingDetails } from '../types/Booking';

export function getCarLabel(carType: BookingDetails['carType']): string {
  if (carType === 'vip') return 'VIP واسعة للمطار';
  if (carType === 'standard') return 'سيارة مطار عادية';
  if (carType === 'suv') return 'عائلي';
  if (carType === 'van') return 'فان';
  return 'سيدان';
}

export function getServiceLabel(serviceType: BookingDetails['serviceType']): string {
  if (serviceType === 'Inter-city') return 'بين المحافظات';
  if (serviceType === 'From Airport') return 'من المطار';
  return 'إلى المطار';
}

export function getRouteSummary(booking: BookingDetails): string {
  const route = [booking.pickupProvince, booking.dropoffProvince].filter(Boolean).join(' ← ');
  if (route) return route;
  if (booking.airport) return `رحلة مرتبطة بـ ${booking.airport}`;
  return 'سيتم تحديد المسار من بيانات الحجز';
}

export interface CompanyPricingConfig {
  basePrice?: number;
  pricePerKm?: number;
  pricePerKmInRushHour?: number;
}

/**
 * حساب المسافة التقديرية بالـ km بين إحداثيات موقعين الجغرافيين من الخريطة
 */
export function calculateCoordinatesDistanceKm(
  lat1: number | undefined,
  lng1: number | undefined,
  lat2: number | undefined,
  lng2: number | undefined
): number {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 20;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const direct = R * c;
  const roadKm = Math.round(direct * 1.3);
  return Math.max(roadKm, 5);
}

/**
 * محرك التسعير الديناميكي للخريطة المطابق لعقد الباك إند (frontend_contract.md):
 * price = round(basePrice + distanceKm * rate)
 * - Outside rush hours: rate = pricePerKm (افتراضي 1200)
 * - Rush hours (08:00-10:00 UTC or 13:00-16:00 UTC): rate = pricePerKmInRushHour (افتراضي 1500)
 * - basePrice: افتراضي 3000
 */
export function calculateMapDynamicPrice(
  lat1: number | undefined,
  lng1: number | undefined,
  lat2: number | undefined,
  lng2: number | undefined,
  isVip: boolean = false,
  _passengersCount: number = 4,
  companyPricing?: CompanyPricingConfig
): { price: number; distanceKm: number; isRushHour: boolean } {
  const distanceKm = calculateCoordinatesDistanceKm(lat1, lng1, lat2, lng2);

  const utcHour = new Date().getUTCHours();
  const isRushHour = (utcHour >= 8 && utcHour < 10) || (utcHour >= 13 && utcHour < 16);

  const basePrice = companyPricing?.basePrice ?? 3000;
  const pricePerKm = companyPricing?.pricePerKm ?? 1200;
  const pricePerKmInRushHour = companyPricing?.pricePerKmInRushHour ?? 1500;

  const rate = isRushHour ? pricePerKmInRushHour : pricePerKm;
  let rawPrice = basePrice + distanceKm * rate;

  if (isVip) {
    rawPrice *= 1.25;
  }

  const roundedPrice = Math.round(rawPrice / 1000) * 1000;
  const finalPrice = Math.max(basePrice, roundedPrice);

  return {
    price: finalPrice,
    distanceKm,
    isRushHour
  };
}

