import { describe, it, expect } from 'vitest';
import { expandProvinceSearchVariants, govNameVariants } from './govNameVariants';

describe('expandProvinceSearchVariants', () => {
  it('يعيد كلاً من أسماء المحافظة بالعربية والإنجليزية والمدن والهمزات', () => {
    const erbil = expandProvinceSearchVariants('أربيل');
    expect(erbil).toContain('أربيل');
    expect(erbil).toContain('اربيل');
    expect(erbil).toContain('Erbil');

    const anbar = expandProvinceSearchVariants('الأنبار');
    expect(anbar).toContain('الأنبار');
    expect(anbar).toContain('الانبار');
    expect(anbar).toContain('Anbar');
    expect(anbar).toContain('الرمادي');

    const dhiQar = expandProvinceSearchVariants('ذي قار');
    expect(dhiQar).toContain('ذي قار');
    expect(dhiQar).toContain('الناصرية');
    expect(dhiQar).toContain('Dhi Qar');

    const nineveh = expandProvinceSearchVariants('نينوى');
    expect(nineveh).toContain('نينوى');
    expect(nineveh).toContain('الموصل');
    expect(nineveh).toContain('Mosul');
  });

  it('يتعامل مع المدن المحافظات بصيغة إنجليزية أو بدون همزة', () => {
    const basra = expandProvinceSearchVariants('Basra');
    expect(basra).toContain('البصرة');
    expect(basra).toContain('Basra');

    const najaf = expandProvinceSearchVariants('النجف الأشرف');
    expect(najaf).toContain('النجف');
    expect(najaf).toContain('Najaf');
  });
});
