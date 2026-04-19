/**
 * ثوابت حالة الرحلة (مطابقة للخادم).
 * Completed / PassengerCancelled / DriverDeclined نهائية ولا تتغير — لا نستطلع بعدها.
 */

export const RIDE_STATUS = {
  RequestingRide: 'RequestingRide',
  AcceptedRide: 'AcceptedRide',
  PickingYouUp: 'PickingYouUp',
  TaxiAwaitingYou: 'TaxiAwaitingYou',
  TransportingYou: 'TransportingYou',
  Completed: 'Completed',
  PassengerCancelled: 'PassengerCancelled',
  DriverDeclined: 'DriverDeclined',
} as const;

export type RideStatusCode = (typeof RIDE_STATUS)[keyof typeof RIDE_STATUS];

/** حالات نهائية — لا تتغير لاحقًا؛ لا نُجري GET /Ride/{id}/status لها */
export const RIDE_STATUSES_TERMINAL = new Set<string>([
  RIDE_STATUS.Completed,
  RIDE_STATUS.PassengerCancelled,
  RIDE_STATUS.DriverDeclined,
]);

/** هل ما زال يجب استطلاع الحالة؟ أي حالة ليست من الحالات النهائية الثلاث */
export function shouldPollRideStatus(statusCode: string | undefined | null): boolean {
  if (statusCode == null) return false;
  const c = String(statusCode).trim();
  if (!c) return false;
  return !RIDE_STATUSES_TERMINAL.has(c);
}

/** لا يُسمح للراكب بإلغاء الرحلة عبر DELETE في هذه الحالات */
const RIDE_STATUSES_NO_PASSENGER_CANCEL = new Set<string>([
  RIDE_STATUS.TransportingYou,
  RIDE_STATUS.PassengerCancelled,
  RIDE_STATUS.Completed,
  RIDE_STATUS.DriverDeclined,
]);

/** DELETE /Ride/{id} — قبل بدء النقل وبعد الحالات المسموح بها */
export function canPassengerCancelRide(statusCode: string | undefined | null): boolean {
  if (statusCode == null) return false;
  const c = String(statusCode).trim();
  if (!c) return false;
  return !RIDE_STATUSES_NO_PASSENGER_CANCEL.has(c);
}

/** رسائل عربية للحالات النهائية (لا تُستطلع — القائمة غالبًا ترجع الرمز الإنجليزي فقط) */
const TERMINAL_STATUS_UI_AR: Record<string, string> = {
  [RIDE_STATUS.Completed]: 'اكتملت الرحلة',
  [RIDE_STATUS.PassengerCancelled]: 'لقد قمت بالغاء الرحلة',
  [RIDE_STATUS.DriverDeclined]: 'قام السائق بالغاء الرحلة',
};

/**
 * نص الحالة للعرض: للحالات النهائية الثلاث نص عربي ثابت؛ وإلا `messageFromServer` من الاستطلاع/الخادم ثم الرمز.
 */
export function rideStatusUiAr(statusCode: string | undefined | null, messageFromServer: string): string {
  const c = String(statusCode ?? '').trim();
  if (TERMINAL_STATUS_UI_AR[c]) return TERMINAL_STATUS_UI_AR[c];
  const m = String(messageFromServer ?? '').trim();
  return m || c || '—';
}
