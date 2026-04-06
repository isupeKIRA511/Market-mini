<script lang="ts">
  import { goto } from '../lib/navigation/goto';
  import { setAuthData } from '../lib/stores/authStore';
  import { skipAuth } from '../lib/config/features';
  import type { AuthResponse, StandardApiResponse } from '../lib/types/api';

  let phoneNumber = '';
  let password = '';
  let showPassword = false;
  let loading = false;
  let errorMsg = '';

  function normalizePhone(raw: string): string {
    return raw.replace(/\s+/g, '').trim();
  }

  function parseLoginResult(body: unknown): AuthResponse | null {
    if (!body || typeof body !== 'object') return null;
    const o = body as Record<string, unknown>;
    if (o.success === true && o.data && typeof o.data === 'object') {
      const d = o.data as Partial<AuthResponse>;
      if (typeof d.token === 'string' && d.id != null) {
        return {
          token: d.token,
          id: String(d.id),
          phoneNumber: typeof d.phoneNumber === 'string' ? d.phoneNumber : '',
        };
      }
      return null;
    }
    if (typeof o.token === 'string' && o.id != null) {
      return {
        token: o.token,
        id: String(o.id),
        phoneNumber: typeof o.phoneNumber === 'string' ? o.phoneNumber : '',
      };
    }
    return null;
  }

  function messageFromBody(body: unknown): string {
    if (!body || typeof body !== 'object') return '';
    const std = body as StandardApiResponse<AuthResponse>;
    if (std.message) return std.message;
    if (Array.isArray(std.errors) && std.errors.length) return std.errors.join(' ');
    return '';
  }

  $: normalizedPhone = normalizePhone(phoneNumber);

  async function handleLogin() {
    if (loading) return;
    errorMsg = '';

    if (!normalizedPhone || !password) {
      errorMsg = 'يرجى إدخال رقم الجوال وكلمة المرور';
      return;
    }

    loading = true;
    try {
      // الربط المباشر وي سيرفر الدوت نت بدون ما أعدل منطقك المعقد
      const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: normalizedPhone, password })
      });
      
      const raw = await res.json();
      
      const auth = parseLoginResult(raw);
      if (auth) {
        setAuthData(auth);
        if ((typeof localStorage !== 'undefined')) {
          localStorage.setItem('token', auth.token);
        }
        goto('home');
      } else {
        errorMsg = messageFromBody(raw) || 'تعذّر تسجيل الدخول أو البيانات غير صحيحة';
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: string[] } }; message?: string };
      const msg =
        e.response?.data?.message ||
        (Array.isArray(e.response?.data?.errors) ? e.response?.data?.errors.join(' ') : '') ||
        e.message ||
        'خطأ في الاتصال بالخادم. تحقق من تشغيل سيرفر الدوت نت.';
      errorMsg = msg;
    } finally {
      loading = false;
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }
</script>

<div class="min-h-full flex flex-col justify-center py-8">
  {#if skipAuth}
    <div
      class="mb-4 rounded-2xl border border-tertiary/30 bg-tertiary/10 px-3 py-2.5 text-right text-[10px] font-bold text-on-surface leading-relaxed"
      role="status"
    >
      وضع التطوير: <code class="font-mono opacity-80">VITE_SKIP_AUTH=true</code> — التطبيق لا يُجبر على هذه الشاشة؛ يمكنك ربط
      المسارات تحت <code class="font-mono opacity-80">/marketplace/api/v1</code> و<code class="font-mono opacity-80">/Auth/</code> عبر
      <code class="font-mono opacity-80">src/lib/api</code>.
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
      <div
        class="bg-error-container/80 border border-error/20 text-on-error-container text-[11px] font-semibold p-3.5 rounded-2xl text-right"
        role="alert"
      >
        {errorMsg}
      </div>
    {/if}

    <div class="space-y-1.5">
      <label for="login-phone" class="block text-right text-[10px] font-black text-on-surface-variant uppercase tracking-wide"
        >رقم الجوال</label
      >
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
          placeholder="مثال: 0790000000"
          class="w-full rounded-2xl bg-surface-container py-3.5 pl-11 pr-4 text-right text-[14px] font-semibold text-on-surface placeholder:text-on-surface-variant/45 border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-shadow"
        />
      </div>
    </div>

    <div class="space-y-1.5">
      <label for="login-pass" class="block text-right text-[10px] font-black text-on-surface-variant uppercase tracking-wide"
        >كلمة المرور</label
      >
      <div class="relative flex flex-row-reverse items-center">
        <button
          type="button"
          class="absolute left-2 w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          on:click={() => (showPassword = !showPassword)}
          aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          <span class="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
        </button>
        <input
          id="login-pass"
          type={showPassword ? 'text' : 'password'}
          autocomplete="current-password"
          bind:value={password}
          on:keydown={onKeydown}
          placeholder="••••••••"
          class="w-full rounded-2xl bg-surface-container py-3.5 pl-12 pr-4 text-right text-[14px] font-semibold text-on-surface placeholder:text-on-surface-variant/45 border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-shadow"
        />
      </div>
    </div>

    <button
      type="button"
      class="w-full btn-premium h-14 rounded-2xl text-[15px] disabled:opacity-60 disabled:scale-100 disabled:pointer-events-none"
      disabled={loading}
      on:click={handleLogin}
    >
      {#if loading}
        <span class="material-symbols-outlined text-[22px] animate-spin" style="font-variation-settings: 'FILL' 0;">progress_activity</span>
        <span>جاري التحقق…</span>
      {:else}
        <span class="material-symbols-outlined text-[22px]">login</span>
        <span>تسجيل الدخول</span>
      {/if}
    </button>
  </div>

  <p class="text-center text-[10px] text-on-surface-variant/80 font-bold mt-6 px-2 leading-relaxed">
    بيانات الدخول تُرسل بشكل آمن إلى خادم التطبيق وفق واجهة العميل المعتمدة.
  </p>
</div>