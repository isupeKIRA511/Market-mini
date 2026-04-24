<script lang="ts">
  import { goto } from "../lib/navigation/goto";
  import { setAuthData } from "../lib/stores/authStore";
  import { skipAuth } from "../lib/config/features";
  import type { AuthResponse } from "../lib/types/api";
  import { apiClient } from "../lib/api/client";
  import { extractAuthResponse } from "../lib/api/extractAuthResponse";

  let fullName = "";
  let phoneNumber = "";
  let otp = "";

  let loading = false;
  let errorMsg = "";

  let isConfirming = false;
  let otpRequested = false;

  function normalizePhone(raw: string): string {
    if (!raw) return "";
    let s = raw.replace(/\s+/g, "").trim();

    // If it starts with 00 (international zeroes) -> +...
    if (s.startsWith("00")) {
      s = "+" + s.slice(2);
    }

    // Local Iraqi numbers starting with 0 => convert to +964
    // e.g. 07701234567 -> +9647701234567
    if (/^0\d{8,}$/.test(s)) {
      s = "+964" + s.slice(1);
    }

    // If it starts with 964 without +, add +
    if (/^964\d+/.test(s)) {
      s = "+" + s;
    }

    // Ensure it starts with + if looks like international
    if (!s.startsWith("+") && /^\d+$/.test(s)) {
      s = "+" + s;
    }

    return s;
  }

  $: normalizedPhone = normalizePhone(phoneNumber);

  function handleRegisterAttempt() {
    errorMsg = "";

    if (!fullName.trim()) {
      errorMsg = "يرجى إدخال الاسم الكامل";
      return;
    }

    if (!normalizedPhone) {
      errorMsg = "يرجى إدخال رقم الجوال";
      return;
    }

    // Show the confirmation step before requesting OTP
    isConfirming = true;
  }

  async function handleConfirmAndRequestOtp() {
    if (loading) return;
    errorMsg = "";
    loading = true;

    try {
      try {
        await apiClient.post("/Customer/register", {
          fullName: fullName.trim(),
          phoneNumber: normalizedPhone,
        });
      } catch (regErr: unknown) {
        console.warn("تسجيل العميل قبل OTP:", regErr);
      }
      await apiClient.post("/Auth/customer/request-otp", {
        phoneNumber: normalizedPhone,
      });
      isConfirming = false;
      otpRequested = true;
    } catch (err: any) {
      const raw = err?.response?.data;
      const base =
        typeof raw === "object" && raw !== null && "message" in raw
          ? String((raw as { message?: string }).message)
          : typeof raw === "string"
            ? raw
            : err?.message;
      errorMsg = base || "تعذّر إرسال رمز التحقق";
      isConfirming = false;
    } finally {
      loading = false;
    }
  }

  async function handleVerifyOtp() {
    if (loading) return;
    errorMsg = "";

    if (!otp) {
      errorMsg = "يرجى إدخال رمز التحقق";
      return;
    }

    loading = true;
    try {
      // 1. Verify OTP
      const res = await apiClient.post<AuthResponse>(
        "/Auth/customer/verify-otp",
        {
          phoneNumber: normalizedPhone,
          otp,
        },
      );

      const auth = extractAuthResponse(res.data);
      if (auth && auth.token && auth.id) {
        // Set auth with the name from the form
        setAuthData(auth, fullName.trim());

        // 2. Update Name
        try {
          await apiClient.put("/Customer/MyAccount", {
            fullName: fullName.trim(),
            phoneNumber: normalizedPhone,
          });
        } catch (updateErr) {
          console.error("Failed to update name:", updateErr);
          // We can just ignore and proceed to home, they can edit it later
        }

        goto("home");
      } else {
        errorMsg = "رمز التحقق غير صحيح استجاب الخادم بمعلومات غير صالحة";
      }
    } catch (err: any) {
      errorMsg =
        err?.response?.data?.message || err?.message || "رمز التحقق غير صحيح";
    } finally {
      loading = false;
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      if (!isConfirming && !otpRequested) handleRegisterAttempt();
      else if (isConfirming) handleConfirmAndRequestOtp();
      else if (otpRequested) handleVerifyOtp();
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
      <span class="material-symbols-outlined text-[32px] text-primary font-bold"
        >person_add</span
      >
    </div>
    <h1 class="text-[26px] font-black text-on-surface tracking-tight mb-1">
      تسجيل جديد
    </h1>
    <p class="text-on-surface-variant text-[11px] font-bold">
      إنشاء حساب في TransPay
    </p>
  </div>

  <div
    class="bg-surface-container-lowest rounded-[28px] p-5 border border-outline-variant/15 shadow-sm space-y-4 relative overflow-hidden"
  >
    {#if errorMsg}
      <div
        class="bg-error-container/80 border border-error/20 text-on-error-container text-[11px] font-semibold p-3.5 rounded-2xl text-right"
        role="alert"
      >
        {errorMsg}
      </div>
    {/if}

    {#if !otpRequested}
      <!-- Registration Form -->
      <div
        class="space-y-4 {isConfirming
          ? 'opacity-50 pointer-events-none blur-[1px]'
          : ''} transition-all duration-300"
      >
        <div class="space-y-1.5">
          <label
            for="reg-name"
            class="block text-right text-[10px] font-black text-on-surface-variant uppercase tracking-wide"
            >الاسم الكامل</label
          >
          <div class="relative flex flex-row-reverse items-center">
            <span
              class="material-symbols-outlined absolute left-3 text-on-surface-variant/70 pointer-events-none text-[20px]"
              >person</span
            >
            <input
              id="reg-name"
              type="text"
              bind:value={fullName}
              on:keydown={onKeydown}
              disabled={isConfirming || otpRequested}
              placeholder="مثال: علي حسن"
              class="w-full rounded-2xl bg-surface-container py-3.5 pl-11 pr-4 text-right text-[14px] font-semibold text-on-surface placeholder:text-on-surface-variant/45 border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-shadow"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label
            for="reg-phone"
            class="block text-right text-[10px] font-black text-on-surface-variant uppercase tracking-wide"
            >رقم الجوال</label
          >
          <div class="relative flex flex-row-reverse items-center">
            <span
              class="material-symbols-outlined absolute left-3 text-on-surface-variant/70 pointer-events-none text-[20px]"
              >smartphone</span
            >
            <input
              id="reg-phone"
              type="tel"
              inputmode="tel"
              bind:value={phoneNumber}
              on:keydown={onKeydown}
              disabled={isConfirming || otpRequested}
              placeholder="مثال: +9647801234567"
              class="w-full rounded-2xl bg-surface-container py-3.5 pl-11 pr-4 text-right text-[14px] font-semibold text-on-surface placeholder:text-on-surface-variant/45 border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-shadow"
            />
          </div>
        </div>

        <button
          type="button"
          class="w-full btn-premium h-14 rounded-2xl text-[15px] disabled:opacity-60 disabled:scale-100 disabled:pointer-events-none"
          disabled={loading || isConfirming}
          on:click={handleRegisterAttempt}
        >
          <span class="material-symbols-outlined text-[22px]">how_to_reg</span>
          <span>تسجيل الرقم</span>
        </button>
      </div>

      <!-- Confirmation Overlay -->
      {#if isConfirming}
        <div
          class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm p-5 animate-fade-in"
        >
          <div
            class="bg-surface-container rounded-[24px] p-5 w-full border border-primary/20 shadow-lg text-center"
          >
            <div
              class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <span class="material-symbols-outlined text-[28px]">sms</span>
            </div>
            <h3 class="text-[16px] font-black text-on-surface mb-2">
              تأكيد رقم الجوال
            </h3>
            <p
              class="text-[12px] text-on-surface-variant font-medium mb-4 leading-relaxed"
            >
              هل أنت متأكد من صحة هذا الرقم؟<br />
              <strong class="text-primary tracking-wider" dir="ltr"
                >{normalizedPhone}</strong
              ><br />
              سنقوم بإرسال رمز التحقق إليه.
            </p>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="w-full bg-primary text-on-primary font-black py-3 rounded-xl disabled:opacity-50"
                disabled={loading}
                on:click={handleConfirmAndRequestOtp}
              >
                {#if loading}
                  <span
                    class="material-symbols-outlined text-[18px] animate-spin align-middle mr-1"
                    style="font-variation-settings: 'FILL' 0;"
                    >progress_activity</span
                  >
                  جاري الإرسال...
                {:else}
                  نعم، أرسل الرمز
                {/if}
              </button>
              <button
                type="button"
                class="w-full bg-transparent text-on-surface-variant font-bold py-3 rounded-xl hover:bg-on-surface/5"
                disabled={loading}
                on:click={() => (isConfirming = false)}
              >
                تعديل الرقم
              </button>
            </div>
          </div>
        </div>
      {/if}
    {:else}
      <!-- OTP Verification Form -->
      <div class="space-y-4 animate-fade-in">
        <div class="text-right mb-4">
          <p
            class="text-[12px] font-semibold text-on-surface-variant leading-relaxed"
          >
            تم إرسال رمز التحقق إلى <span
              dir="ltr"
              class="text-primary font-bold">{normalizedPhone}</span
            >
          </p>
          <button
            type="button"
            class="text-[10px] font-bold text-primary mt-1 hover:underline"
            on:click={() => {
              otpRequested = false;
              otp = "";
            }}
          >
            تغيير الرقم؟
          </button>
        </div>

        <div class="space-y-1.5">
          <label
            for="reg-otp"
            class="block text-right text-[10px] font-black text-on-surface-variant uppercase tracking-wide"
            >رمز التحقق (OTP)</label
          >
          <div class="relative flex flex-row-reverse items-center">
            <span
              class="material-symbols-outlined absolute left-3 text-on-surface-variant/70 pointer-events-none text-[20px]"
              >dialpad</span
            >
            <input
              id="reg-otp"
              type="text"
              inputmode="numeric"
              bind:value={otp}
              on:keydown={onKeydown}
              placeholder="أدخل الرمز المكون من 6 أرقام"
              class="w-full rounded-2xl bg-surface-container py-3.5 pl-11 pr-4 text-right text-[14px] font-semibold text-on-surface placeholder:text-on-surface-variant/45 border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-shadow tracking-widest"
            />
          </div>
        </div>

        <button
          type="button"
          class="w-full btn-premium h-14 rounded-2xl text-[15px] disabled:opacity-60 disabled:scale-100 disabled:pointer-events-none"
          disabled={loading}
          on:click={handleVerifyOtp}
        >
          {#if loading}
            <span
              class="material-symbols-outlined text-[22px] animate-spin"
              style="font-variation-settings: 'FILL' 0;">progress_activity</span
            >
            <span>جاري التحقق…</span>
          {:else}
            <span class="material-symbols-outlined text-[22px]">verified</span>
            <span>تأكيد الرمز</span>
          {/if}
        </button>
      </div>
    {/if}
  </div>

  <p
    class="text-center text-[10px] text-on-surface-variant/80 font-bold mt-6 px-2 leading-relaxed"
  >
    لديك حساب بالفعل؟
    <button
      type="button"
      class="text-primary font-black hover:underline"
      on:click={() => goto("login")}
    >
      تسجيل الدخول
    </button>
  </p>
</div>
