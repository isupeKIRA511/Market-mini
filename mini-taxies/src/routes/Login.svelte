<script lang="ts">
  import { goto } from '../lib/navigation/goto';
  import { setAuthData } from '../lib/stores/authStore';
  import { skipAuth } from '../lib/config/features';
  import type { AuthResponse } from '../lib/types/api';
  import { apiClient } from '../lib/api/client';
  import { extractAuthResponse } from '../lib/api/extractAuthResponse';
  import AppAlert from '../lib/components/AppAlert.svelte';
  import {
    isValidIraqiMobilePhone,
    isValidOtpCode,
    normalizeOtp,
    normalizePhone,
  } from '../lib/phone/normalize';

  let phoneNumber = '';
  let otp = '';
  let loading = false;
  let errorMsg = '';
  let otpRequested = false;

  $: normalizedPhone = normalizePhone(phoneNumber);
  $: normalizedOtp = normalizeOtp(otp);

  async function handleRequestOtp() {
    if (loading) return;
    errorMsg = '';

    if (!isValidIraqiMobilePhone(normalizedPhone)) {
      errorMsg = 'يرجى إدخال رقم جوال عراقي صحيح مثل 07701234567';
      return;
    }

    loading = true;
    try {
      // إرسال كلاً من PascalCase و camelCase لتوافق الخادم
      await apiClient.post('/Auth/customer/request-otp', {
        phoneNumber: normalizedPhone,
        PhoneNumber: normalizedPhone
      });
      otpRequested = true;
    } catch (err: any) {
      // في حال عدم تسجيل الرقم مسبقاً على السيرفر، يتم إنشاء الحساب تلقائياً ثم طلب OTP
      try {
        await apiClient.post('/Customer/register', {
          fullName: 'عميل',
          phoneNumber: normalizedPhone,
          PhoneNumber: normalizedPhone
        });
        await apiClient.post('/Auth/customer/request-otp', {
          phoneNumber: normalizedPhone,
          PhoneNumber: normalizedPhone
        });
        otpRequested = true;
        return;
      } catch {
        // التجاهل ومتابعة معالجة الخطأ الأساسية
      }

      const raw = err?.response?.data;
      const msg = typeof raw === 'object' && raw !== null && 'message' in raw
        ? String((raw as { message?: string }).message)
        : typeof raw === 'string'
        ? raw
        : err?.message;
      errorMsg = msg || 'تعذّر إرسال رمز التحقق. تأكد من اتصال النت وصحة الرقم.';
    } finally {
      loading = false;
    }
  }

  async function handleVerifyOtp() {
    if (loading) return;
    errorMsg = '';

    if (!isValidOtpCode(normalizedOtp)) {
      errorMsg = 'يرجى إدخال رمز تحقق رقمي صحيح (4-8 أرقام)';
      return;
    }

    loading = true;
    try {
      const res = await apiClient.post<AuthResponse>('/Auth/customer/verify-otp', {
        phoneNumber: normalizedPhone,
        PhoneNumber: normalizedPhone,
        otp: normalizedOtp,
        Otp: normalizedOtp
      });
      
      const auth = extractAuthResponse(res.data);
      if (auth && auth.token) {
        setAuthData(auth);
        try {
          const accRes = await apiClient.get<any>('/Customer/MyAccount');
          const accName = accRes?.data?.fullName || accRes?.fullName || accRes?.data?.name;
          if (accName) {
            setAuthData(auth, accName);
          }
        } catch {
          // الاحتفاظ بالاسم المستخرج تلقائياً
        }
        goto('home');
      } else {
        errorMsg = 'تم قبول الرمز ولكن استجاب الخادم بتنسيق توكن غير معروف.';
      }
    } catch (err: any) {
      const raw = err?.response?.data;
      const msg = typeof raw === 'object' && raw !== null && 'message' in raw
        ? String((raw as { message?: string }).message)
        : typeof raw === 'string'
        ? raw
        : err?.message;
      errorMsg = msg || 'رمز التحقق غير صحيح أو انتهت صلاحيته.';
    } finally {
      loading = false;
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        if (!otpRequested) handleRequestOtp();
        else handleVerifyOtp();
    }
  }
</script>

<div class="min-h-full flex flex-col justify-center py-8">
  {#if skipAuth}
    <div
      class="mb-4 rounded-2xl border border-tertiary/30 bg-tertiary/10 px-3 py-2.5 text-right text-[10px] font-bold text-on-surface leading-relaxed"
      role="status"
    >
      وضع التطوير: <code class="font-mono opacity-80">VITE_SKIP_AUTH=true</code>
    </div>
  {/if}
  <div class="text-center mb-8">
    <div
      class="inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/15 border border-primary/25 mb-4 shadow-sm"
    >
      <span class="material-symbols-outlined text-[32px] text-primary font-bold">directions_car</span>
    </div>
    <h1 class="text-[26px] font-black text-on-surface tracking-tight mb-1">TransPay</h1>
    <p class="text-on-surface-variant text-[11px] font-bold">تسجيل دخول العملاء</p>
  </div>

  <div
    class="bg-surface-container-lowest rounded-[28px] p-5 border border-outline-variant/15 shadow-sm space-y-4"
  >
    {#if errorMsg}
      <AppAlert type="error" title="تعذر تسجيل الدخول" message={errorMsg} />
    {/if}

    <div class="space-y-1.5">
      <label for="login-phone" class="block text-right text-[10px] font-black text-on-surface-variant uppercase tracking-wide"
        >رقم الجوال</label>
      <div class="relative flex flex-row-reverse items-center">
        <span
          class="material-symbols-outlined absolute left-3 text-on-surface-variant/70 pointer-events-none text-[20px]"
          >smartphone</span
        >
        <input
          id="login-phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          maxlength="17"
          bind:value={phoneNumber}
          on:keydown={onKeydown}
          disabled={otpRequested}
          placeholder="مثال: +9647801234567"
          class="w-full rounded-2xl bg-surface-container py-3.5 pl-11 pr-4 text-right text-[14px] font-semibold text-on-surface placeholder:text-on-surface-variant/45 border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-shadow {otpRequested ? 'opacity-60 cursor-not-allowed' : ''}"
        />
      </div>
    </div>

    {#if otpRequested}
    <div class="space-y-1.5 animate-fade-in">
      <div class="flex justify-between items-center">
        <button type="button" class="text-[10px] font-bold text-primary" on:click={() => { otpRequested = false; otp = ''; }}>
            تعديل الرقم
        </button>
        <label for="login-otp" class="block text-right text-[10px] font-black text-on-surface-variant uppercase tracking-wide"
          >رمز التحقق (OTP)</label>
      </div>
      <div class="relative flex flex-row-reverse items-center">
        <span
          class="material-symbols-outlined absolute left-3 text-on-surface-variant/70 pointer-events-none text-[20px]"
          >dialpad</span
        >
        <input
          id="login-otp"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="8"
          pattern="[0-9]*"
          bind:value={otp}
          on:keydown={onKeydown}
          placeholder="أدخل الرمز المكون من 6 أرقام"
          class="w-full rounded-2xl bg-surface-container py-3.5 pl-11 pr-4 text-right text-[14px] font-semibold text-on-surface placeholder:text-on-surface-variant/45 border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-shadow tracking-widest"
        />
      </div>
    </div>
    {/if}

    <button
      type="button"
      class="w-full btn-premium h-14 rounded-2xl text-[15px] disabled:opacity-60 disabled:scale-100 disabled:pointer-events-none"
      disabled={loading}
      on:click={otpRequested ? handleVerifyOtp : handleRequestOtp}
    >
      {#if loading}
        <span class="material-symbols-outlined text-[22px] animate-spin" style="font-variation-settings: 'FILL' 0;">progress_activity</span>
        <span>جاري التحقق…</span>
      {:else}
        <span class="material-symbols-outlined text-[22px]">login</span>
        <span>{otpRequested ? 'تأكيد الرمز' : 'إرسال الرمز'}</span>
      {/if}
    </button>
  </div>

  <p class="text-center text-[10px] text-on-surface-variant/80 font-bold mt-6 px-2 leading-relaxed">
    ليس لديك حساب؟
    <button type="button" class="text-primary font-black hover:underline" on:click={() => goto('register')}>
      إنشاء حساب جديد
    </button>
  </p>

  <p class="text-center text-[10px] text-on-surface-variant/80 font-bold mt-4 px-2 leading-relaxed">
    بيانات الدخول تُرسل بشكل آمن إلى خادم التطبيق وفق واجهة العميل المعتمدة.
  </p>
</div>
