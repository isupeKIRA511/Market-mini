import { describe, it, expect } from 'vitest';
import { extractRecordArray, extractRecord } from './marketplaceResponse';

describe('extractRecordArray', () => {
  it('يقبل مصفوفة مباشرة', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    expect(extractRecordArray(rows)).toEqual(rows);
  });

  it('يستخرج items', () => {
    expect(extractRecordArray({ items: [{ a: 1 }] })).toEqual([{ a: 1 }]);
  });

  it('يستخرج data كمصفوفة', () => {
    expect(extractRecordArray({ data: [{ b: 2 }] })).toEqual([{ b: 2 }]);
  });

  it('يستخرج value (أنماط ASP.NET)', () => {
    expect(extractRecordArray({ value: [{ c: 3 }] })).toEqual([{ c: 3 }]);
  });

  it('يستخرج success + data', () => {
    expect(extractRecordArray({ success: true, data: [{ d: 4 }] })).toEqual([{ d: 4 }]);
  });
});

describe('extractRecord', () => {
  it('يستخرج data من الرد القياسي', () => {
    expect(extractRecord({ success: true, data: { id: 'x' } })).toEqual({ id: 'x' });
  });

  it('يرجع نفس الكائن إن لم يكن مغلفًا', () => {
    expect(extractRecord({ id: 'y' })).toEqual({ id: 'y' });
  });
});
