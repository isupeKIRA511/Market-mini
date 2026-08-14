export const IRAQI_MOBILE_E164_PATTERN = /^\+9647\d{9}$/;
export const OTP_PATTERN = /^\d{4,8}$/;

export function normalizePhone(raw: string): string {
  if (!raw) return '';
  let value = raw.replace(/[\s\-()]/g, '').trim();

  if (value.startsWith('00')) value = `+${value.slice(2)}`;
  if (/^0\d{8,}$/.test(value)) value = `+964${value.slice(1)}`;
  if (/^964\d+$/.test(value)) value = `+${value}`;
  if (!value.startsWith('+') && /^\d+$/.test(value)) value = `+${value}`;

  return value;
}

export function isValidIraqiMobilePhone(value: string): boolean {
  return IRAQI_MOBILE_E164_PATTERN.test(value);
}

export function normalizeOtp(raw: string): string {
  return raw.replace(/\s+/g, '').trim();
}

export function isValidOtpCode(value: string): boolean {
  return OTP_PATTERN.test(value);
}
