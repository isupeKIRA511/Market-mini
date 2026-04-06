import { describe, it, expect } from 'vitest';
import { mapCarRecordToDriver, mapBannerRecordToOffer } from './mapMarketplace';

describe('mapCarRecordToDriver', () => {
  it('يبني بطاقة من حقول camelCase', () => {
    const d = mapCarRecordToDriver(
      {
        id: 'abc',
        brand: 'تويوتا',
        model: 'كامري',
        licensePlate: '123',
        comfortScore: 4.8,
      },
      0
    );
    expect(d.type).toBe('featured');
    expect(d.car).toContain('تويوتا');
    expect(d.rating).toBeGreaterThan(0);
    expect(d.id).toBe('abc');
  });

  it('يقبل حقول PascalCase', () => {
    const d = mapCarRecordToDriver(
      { Id: 9, Brand: 'Kia', Model: 'Rio', ComfortScore: 5 },
      1
    );
    expect(d.type).toBe('small');
    expect(d.car).toContain('Kia');
  });
});

describe('mapBannerRecordToOffer', () => {
  it('يملأ العرض للواجهة', () => {
    const o = mapBannerRecordToOffer({ title: 'خصم', description: 'تفاصيل', tag: '20%' }, 0);
    expect(o.title).toBe('خصم');
    expect(o.badge).toBe('20%');
    expect(o.variant).toBe('gold');
  });
});
