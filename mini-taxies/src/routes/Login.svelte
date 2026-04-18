<script lang="ts">
  import { goto } from '../lib/navigation/goto';
  import { setAuthData } from '../lib/stores/authStore';
  import { skipAuth } from '../lib/config/features';
  import type { AuthResponse } from '../lib/types/api';
  import { apiClient } from '../lib/api/client';
  import { extractAuthResponse } from '../lib/api/extractAuthResponse';

  let phoneNumber = '';
  let otp = '';
  let loading = false;
  let errorMsg = '';
  let otpRequested = false;

  function normalizePhone(raw: string): string {
    if (!raw) return '';
    let s = raw.replace(/\s+/g, '').trim();
    if (s.startsWith('00')) s = '+' + s.slice(2);
    if (/^0\d{8,}$/.test(s)) s = '+964' + s.slice(1);
    if (/^964\d+/.test(s)) s = '+' + s;
    if (!s.startsWith('+') && /^\d+$/.test(s)) s = '+' + s;
    return s;
  }

  $: normalizedPhone = normalizePhone(phoneNumber);

  async function handleRequestOtp() {
    if (loading) return;
    errorMsg = '';

    if (!normalizedPhone) {
      errorMsg = 'يرجى إدخال رقم الجوال';
      return;
    }

    loading = true;
    try {
      await apiClient.post('/Auth/customer/request-otp', { phoneNumber: normalizedPhone });
      otpRequested = true;
    } catch (err: any) {
      const raw = err?.response?.data;
      const hint =
        typeof raw === 'string' && raw.toLowerCase().includes('not_found')
          ? 'هذا الرقم غير مسجّل. أنشئ حساباً من «إنشاء حساب جديد» ثم أرسل رمز التحقق.'
          : err?.message || 'تعذّر إرسال رمز التحقق';
      errorMsg = hint;
    } finally {
      loading = false;
    }
  }

  async function handleVerifyOtp() {
    if (loading) return;
    errorMsg = '';

    if (!otp) {
      errorMsg = 'يرجى إدخال رمز التحقق';
      return;
    }

    loading = true;
    try {
      const res = await apiClient.post<AuthResponse>('/Auth/customer/verify-otp', {
        phoneNumber: normalizedPhone,
        otp
      });
      
      const auth = extractAuthResponse(res.data);
      if (auth && auth.token && auth.id) {
        setAuthData(auth);
        goto('home');
      } else {
        errorMsg = 'رمز التحقق غير صحيح استجاب الخادم بمعلومات غير صالحة';
      }
    } catch (err: any) {
      errorMsg = err.message || 'رمز التحقق غير صحيح';
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
    <h1 class="text-[26px] font-black text-on-surface tracking-tight mb-1">Teleport.iq</h1>
    <p class="text-on-surface-variant text-[11px] font-bold">تسجيل دخول العملاء</p>
  </div>

  <div
    class="bg-surface-container-lowest rounded-[28px] p-5 border border-outline-variant/15 shadow-sm space-y-4"
  >
    {#if errorMsg}
      <div
        class="bg-error-container/80 border border-error/20 text-on-error-container text-[11px] font-semibold p-3.5 rounded-2xl text-right"
        role="alert"
      >
        {errorMsg}
      </div>
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
          autocomplete="username"
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