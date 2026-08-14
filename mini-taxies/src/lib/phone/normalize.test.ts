import { describe, expect, it } from 'vitest';
import {
  isValidIraqiMobilePhone,
  isValidOtpCode,
  normalizeOtp,
  normalizePhone,
} from './normalize';

describe('normalizePhone', () => {
  it('normalizes local Iraqi mobile numbers', () => {
    expect(normalizePhone('0770 123 4567')).toBe('+9647701234567');
  });

  it('normalizes international numbers without plus sign', () => {
    expect(normalizePhone('9647701234567')).toBe('+9647701234567');
  });

  it('validates Iraqi mobile format', () => {
    expect(isValidIraqiMobilePhone('+9647701234567')).toBe(true);
    expect(isValidIraqiMobilePhone('+964123')).toBe(false);
  });
});

describe('normalizeOtp', () => {
  it('removes whitespace and accepts numeric OTP codes', () => {
    expect(normalizeOtp(' 12 34 ')).toBe('1234');
    expect(isValidOtpCode('1234')).toBe(true);
    expect(isValidOtpCode('12ab')).toBe(false);
  });
});
