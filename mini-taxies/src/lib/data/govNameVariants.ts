/** أسماء محافظات عربية ↔ إنجليزية لطلبات RideOffer/Search مطابقة لتطبيق السائق */
export const govNameVariants: Record<string, string[]> = {
  بغداد: ['بغداد', 'Baghdad'],
  البصرة: ['البصرة', 'Basra', 'Basrah'],
  نينوى: ['نينوى', 'الموصل', 'Nineveh', 'Mosul'],
  أربيل: ['أربيل', 'اربيل', 'إربيل', 'Erbil', 'Arbil'],
  النجف: ['النجف', 'النجف الأشرف', 'Najaf', 'Al Najaf', 'Al-Najaf'],
  'ذي قار': ['ذي قار', 'الناصرية', 'Dhi Qar', 'DhiQar', 'Nasiriyah', 'Nasiriya'],
  كركوك: ['كركوك', 'Kirkuk'],
  الأنبار: ['الأنبار', 'الانبار', 'الرمادي', 'Anbar', 'Al Anbar', 'Al-Anbar', 'Ramadi'],
  ديالى: ['ديالى', 'بعقوبة', 'Diyala', 'Diala', 'Baqubah'],
  المثنى: ['المثنى', 'السماوة', 'Muthanna', 'Al Muthanna', 'Al-Muthanna', 'Samawah'],
  القادسية: ['القادسية', 'الديوانية', 'Al Qadisiyah', 'Qadisiyah', 'Al-Qadisiyah', 'Qadisiya', 'Qadisiyyah', 'Al Qadisiyyah', 'Diwaniyah', 'Diwaniya'],
  ميسان: ['ميسان', 'العمارة', 'Maysan', 'Missan', 'Amarah', 'Amara'],
  واسط: ['واسط', 'الكوت', 'Wasit', 'Kut', 'Al Kut', 'Al-Kut'],
  'صلاح الدين': ['صلاح الدين', 'تكريت', 'Salah ad Din', 'Salah ad-Din', 'Salah al-Din', 'Salahuddin', 'Tikrit'],
  دهوك: ['دهوك', 'Duhok', 'Dohuk'],
  السليمانية: ['السليمانية', 'Sulaymaniyah', 'Sulaimaniyah', 'Sulaimani'],
  بابل: ['بابل', 'الحلة', 'Babil', 'Babylon', 'Hillah'],
  كربلاء: ['كربلاء', 'كربلاء المقدسة', 'Karbala', 'Karbalaa'],
};

function normalizeGovString(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[-_\s]/g, '');
}

/**
 * كل المرادفات (عربي/إنجليزي/اختلاف الهمزات ومسافات أسماء تطبيق السائق) لمحافظة واحدة.
 */
export function expandProvinceSearchVariants(name: string): string[] {
  const t = name.trim();
  if (!t) return [];

  const set = new Set<string>();
  set.add(t);

  const normKey = normalizeGovString(t);

  for (const [key, variants] of Object.entries(govNameVariants)) {
    const normGovKey = normalizeGovString(key);
    const matchesKey = key === t || normGovKey === normKey;
    const matchesVariant = variants.some((v) => normalizeGovString(v) === normKey);

    if (matchesKey || matchesVariant) {
      set.add(key);
      for (const v of variants) {
        set.add(v);
      }
    }
  }

  return Array.from(set);
}

