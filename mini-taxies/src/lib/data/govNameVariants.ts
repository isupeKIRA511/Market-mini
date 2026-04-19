/** أسماء محافظات عربية ↔ إنجليزية لطلبات RideOffer/Search */
export const govNameVariants: Record<string, string[]> = {
  بغداد: ['بغداد', 'Baghdad'],
  البصرة: ['البصرة', 'Basra'],
  نينوى: ['نينوى', 'Nineveh', 'Mosul'],
  أربيل: ['أربيل', 'Erbil', 'Arbil'],
  النجف: ['النجف', 'Najaf'],
  'ذي قار': ['ذي قار', 'Dhi Qar', 'Nasiriyah', 'Nasiriya'],
  كركوك: ['كركوك', 'Kirkuk'],
  الأنبار: ['الأنبار', 'Anbar', 'Al Anbar'],
  ديالى: ['ديالى', 'Diyala', 'Diala'],
  المثنى: ['المثنى', 'Muthanna', 'Al Muthanna'],
  القادسية: ['القادسية', 'Qadisiyyah', 'Al Qadisiyyah', 'Diwaniyah'],
  ميسان: ['ميسان', 'Maysan', 'Missan', 'Amarah'],
  واسط: ['واسط', 'Wasit'],
  'صلاح الدين': ['صلاح الدين', 'Salah al-Din', 'Salahuddin'],
  دهوك: ['دهوك', 'Duhok', 'Dohuk'],
  السليمانية: ['السليمانية', 'Sulaymaniyah', 'Sulaimaniyah'],
  بابل: ['بابل', 'Babil', 'Babylon'],
  كربلاء: ['كربلاء', 'Karbala', 'Karbalaa'],
};

/**
 * كل المرادفات (عربي/إنجليزي) لمحافظة واحدة.
 * إذا أُدخل اسم إنجليزي مثل Baghdad يُعاد [بغداد, Baghdad] حتى يطابق ما يخزّنه السيرفر.
 */
export function expandProvinceSearchVariants(name: string): string[] {
  const t = name.trim();
  if (!t) return [];
  const direct = govNameVariants[t];
  if (direct) return [...direct];
  const lower = t.toLowerCase();
  for (const variants of Object.values(govNameVariants)) {
    if (variants.some((v) => v.toLowerCase() === lower)) {
      return [...variants];
    }
  }
  return [t];
}
