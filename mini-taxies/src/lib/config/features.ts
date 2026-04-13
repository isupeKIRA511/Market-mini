/**
 * عنوان الـ API الذي يستخدمه العميل.
 *
 * - في بيئة التطوير نفضّل توجيه الطلبات إلى مسار نسبي (`/api`) حتى يعمل Vite proxy.
 * - في الإنتاج يمكن تعيين المتغيّر VITE_API_BASE_URL ليشير إلى المضيف الفعلي.
 */
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

/** عند `true` لا يُفرض الانتقال لشاشة تسجيل الدخول (للربط مع الباكند) */
export const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
