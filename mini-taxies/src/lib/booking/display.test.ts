import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateMapDynamicPrice, calculateCoordinatesDistanceKm } from './display';

describe('calculateMapDynamicPrice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('يحسب المسافة التقديرية بين الإحداثيات بالـ km', () => {
    const dist = calculateCoordinatesDistanceKm(33.3152, 44.3661, 33.2625, 44.2345);
    expect(dist).toBeGreaterThan(10);
    expect(dist).toBeLessThan(35);
  });

  it('يحسب السعر في الساعات العادية (خارج ساعات الذروة)', () => {
    const mockDate = new Date('2026-07-02T11:00:00Z');
    vi.setSystemTime(mockDate);

    const result = calculateMapDynamicPrice(
      33.3152, 44.3661, 33.2625, 44.2345,
      false, 4,
      { basePrice: 3000, pricePerKm: 1200, pricePerKmInRushHour: 1500 }
    );

    expect(result.isRushHour).toBe(false);
    expect(result.price).toBeGreaterThan(15000);
    expect(result.price % 1000).toBe(0);
  });

  it('يطبّق سعر الذروة خلال ساعات الذروة بتوقيت UTC (مثلاً 09:00 UTC)', () => {
    const mockDate = new Date('2026-07-02T09:00:00Z');
    vi.setSystemTime(mockDate);

    const normalResult = calculateMapDynamicPrice(
      33.3152, 44.3661, 33.2625, 44.2345,
      false, 4,
      { basePrice: 3000, pricePerKm: 1200, pricePerKmInRushHour: 1500 }
    );

    expect(normalResult.isRushHour).toBe(true);
  });

  it('يعتمد أسعار الشركة المخصصة عند توفيرها', () => {
    const mockDate = new Date('2026-07-02T11:00:00Z');
    vi.setSystemTime(mockDate);

    const customResult = calculateMapDynamicPrice(
      33.3152, 44.3661, 33.2625, 44.2345,
      false, 4,
      { basePrice: 5000, pricePerKm: 2000, pricePerKmInRushHour: 2500 }
    );

    const defaultResult = calculateMapDynamicPrice(
      33.3152, 44.3661, 33.2625, 44.2345,
      false, 4,
      { basePrice: 3000, pricePerKm: 1200, pricePerKmInRushHour: 1500 }
    );

    expect(customResult.price).toBeGreaterThan(defaultResult.price);
  });

  it('ينطبق رسم الإضافة لخيار VIP', () => {
    const mockDate = new Date('2026-07-02T11:00:00Z');
    vi.setSystemTime(mockDate);

    const standard = calculateMapDynamicPrice(
      33.3152, 44.3661, 33.2625, 44.2345,
      false, 4
    );

    const vip = calculateMapDynamicPrice(
      33.3152, 44.3661, 33.2625, 44.2345,
      true, 4
    );

    expect(vip.price).toBeGreaterThan(standard.price);
  });
});
