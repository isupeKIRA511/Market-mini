/** يطابق القيمة الافتراضية في `public/client/config.ts` */
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5051';

/** عند `true` لا يُفرض الانتقال لشاشة تسجيل الدخول (للربط مع الباكند) */
export const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
