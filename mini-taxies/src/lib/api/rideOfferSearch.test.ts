import { describe, it, expect } from 'vitest';
import { buildRideOfferSearchQueryString } from './rideOfferSearch';

describe('buildRideOfferSearchQueryString', () => {
  it('يبني سلسلة استعلام البحث مع الإحداثيات للتسعير الديناميكي', () => {
    const qs = buildRideOfferSearchQueryString({
      pickupProvince: 'Baghdad',
      dropoffProvince: 'Basra',
      seatCount: 2,
      pickupLatitude: 33.3152,
      pickupLongitude: 44.3661,
      pageNum: 1,
      pageSize: 20,
    });

    const params = new URLSearchParams(qs);
    expect(params.get('PickupProvince')).toBe('Baghdad');
    expect(params.get('DropoffProvince')).toBe('Basra');
    expect(params.get('SeatCount')).toBe('2');
    expect(params.get('PickupLatitude')).toBe('33.3152');
    expect(params.get('PickupLongitude')).toBe('44.3661');
    expect(params.get('PageNum')).toBe('1');
    expect(params.get('PageSize')).toBe('20');
  });

  it('يتجاهل الإحداثيات إذا لم تكن معرفة', () => {
    const qs = buildRideOfferSearchQueryString({
      pickupProvince: 'Baghdad',
      dropoffProvince: 'Basra',
      seatCount: 1,
    });

    const params = new URLSearchParams(qs);
    expect(params.has('PickupLatitude')).toBe(false);
    expect(params.has('PickupLongitude')).toBe(false);
  });
});
