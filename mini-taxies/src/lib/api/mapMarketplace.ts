import type { DriverCardUi, HomeOfferUi } from '../types/marketplaceUi';

function str(v: unknown, fallback = ''): string {
  if (v == null) return fallback;
  return String(v).trim() || fallback;
}

export function mapCarRecordToDriver(car: Record<string, unknown>, index: number): DriverCardUi {
  const id = car.id ?? car.Id ?? index;
  const brand = str(car.brand ?? car.Brand);
  const model = str(car.model ?? car.Model);
  const plate = str(car.licensePlate ?? car.LicensePlate);
  const carLabel = [brand, model].filter(Boolean).join(' ') || plate || 'مركبة';
  let comfort = Number(car.comfortScore ?? car.ComfortScore);
  if (!Number.isFinite(comfort)) comfort = 4.5;
  let rating = comfort;
  if (comfort > 10) rating = Math.min(5, comfort / 25 + 3);
  else rating = Math.min(5, Math.max(3, comfort));
  const types: DriverCardUi['type'][] = ['featured', 'small', 'simple'];
  const priceVal = car.price ?? car.estimatedPrice ?? car.Price ?? car.estimatedFare;
  let price = '—';
  if (typeof priceVal === 'number' && Number.isFinite(priceVal)) {
    price = `${priceVal.toLocaleString('en-US')} د.ع`;
  } else if (priceVal != null && String(priceVal).trim()) {
    price = `${priceVal} د.ع`;
  }
  const name = str(
    car.driverName ?? car.ownerName ?? car.OwnerName ?? car.companyName ?? car.CompanyName,
    plate ? `مركبة ${plate}` : `مركبة ${String(id).slice(0, 8)}`
  );
  return {
    id: id as string | number,
    type: types[index % 3],
    name,
    rating: Math.round(rating * 10) / 10,
    reviews: str(car.reviewCount ?? car.ReviewCount, '0'),
    badge: str(car.badge ?? car.Badge, comfort >= 4.5 ? 'سائق متميز' : 'متاح'),
    price,
    car: carLabel,
    icon: 'person',
    carTypes: [str(car.category ?? car.Category ?? car.carType ?? car.CarType, 'سيدان')],
    passengers: [str(car.passengersLabel ?? car.Passengers, '1-4 ركاب')],
    luggage: [str(car.luggageLabel ?? car.Luggage, 'متوسطة (4-5)')],
    interactions: Number(car.interactions ?? car.Interactions ?? 200 + index * 40) || 200,
    hasHemam: Boolean(car.hasHemam ?? car.accessible ?? car.Accessible ?? false),
    description: str(car.description ?? car.Description, `لوحة: ${plate || '—'}`),
    eco: Boolean(car.eco ?? car.Eco ?? false),
  };
}

export function mapBannerRecordToOffer(b: Record<string, unknown>, i: number): HomeOfferUi {
  return {
    badge: str(b.tag ?? b.Tag ?? b.label ?? b.Label ?? b.discount ?? b.Discount, i === 0 ? 'عرض' : 'مميز'),
    title: str(b.title ?? b.Title ?? b.name ?? b.Name ?? 'عرض خاص'),
    desc: str(
      b.description ?? b.Description ?? b.subtitle ?? b.Subtitle ?? b.body ?? b.Body,
      ''
    ),
    variant: i % 2 === 0 ? 'gold' : 'dark',
  };
}
