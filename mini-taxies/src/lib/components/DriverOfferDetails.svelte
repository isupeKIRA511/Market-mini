<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { DriverCardUi } from '../types/marketplaceUi';

  export let driver: DriverCardUi | null = null;
  export let fromGov = '';
  export let toGov = '';
  export let seatCount = 1;

  const dispatch = createEventDispatcher<{
    close: void;
    book: DriverCardUi;
  }>();
</script>

{#if driver}
  <div class="fixed inset-0 z-[10000] flex items-end justify-center" dir="rtl">
    <button
      type="button"
      class="absolute inset-0 h-full w-full border-0 bg-black/55 backdrop-blur-sm"
      aria-label="إغلاق تفاصيل العرض"
      on:click={() => dispatch('close')}
    ></button>
    <section class="relative z-10 w-full max-w-[420px] rounded-t-[32px] bg-surface p-6 shadow-2xl">
      <div class="mx-auto mb-5 h-1.5 w-12 rounded-full bg-outline-variant/40"></div>

      <div class="mb-5 flex items-start justify-between gap-4">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container"
          aria-label="إغلاق"
          on:click={() => dispatch('close')}
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div class="flex flex-row-reverse items-center gap-3 text-right">
          <div class="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-primary text-[34px]" style="font-variation-settings: 'FILL' 1;">{driver.icon}</span>
          </div>
          <div>
            <h2 class="text-xl font-black text-on-surface">{driver.name}</h2>
            <p class="text-[11px] font-bold text-on-surface-variant">{driver.driverName || 'سائق معتمد'}</p>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-surface-container-low p-4 text-right">
            <p class="text-[10px] font-bold text-on-surface-variant">السعر</p>
            <p class="mt-1 text-lg font-black text-primary">{driver.price}</p>
            <p class="text-[10px] font-bold text-on-surface-variant">سعر العرض (السائق)</p>
          </div>
          <div class="rounded-2xl bg-surface-container-low p-4 text-right">
            <p class="text-[10px] font-bold text-on-surface-variant">التقييم</p>
            <p class="mt-1 flex items-center justify-end gap-1 text-lg font-black text-on-surface">
              {driver.rating}
              <span class="material-symbols-outlined text-primary text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
            </p>
            <p class="text-[10px] font-bold text-on-surface-variant">({driver.reviews} تقييم)</p>
          </div>
        </div>

        <div class="rounded-2xl bg-surface-container-low p-4 text-right">
          <p class="text-[10px] font-bold text-on-surface-variant">المسار</p>
          <div class="mt-2 flex items-center gap-3">
            <div class="flex flex-col items-center gap-1">
              <div class="h-2.5 w-2.5 rounded-full border-2 border-primary"></div>
              <div class="h-5 w-0.5 bg-outline-variant/40"></div>
              <div class="h-2.5 w-2.5 rounded-sm bg-primary"></div>
            </div>
            <div class="space-y-2 text-right">
              <p class="text-sm font-black text-on-surface">{fromGov || 'نقطة الانطلاق غير محددة'}</p>
              <p class="text-sm font-black text-on-surface">{toGov || 'الوجهة غير محددة'}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-[#1D1B1C] p-4 text-right text-white">
          <p class="text-[10px] font-bold text-white/60">نوع السيارة</p>
          <p class="mt-1 text-base font-black">{driver.car}</p>
          <div class="mt-3 flex flex-wrap justify-end gap-2">
            <span class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-primary">{driver.badge}</span>
            <span class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-white/80">طلب {seatCount} مقعد</span>
            {#if driver.bookingOfferId}
              <span class="rounded-full bg-[#10B981]/20 px-3 py-1 text-[10px] font-black text-[#6EE7B7]">قابل للحجز</span>
            {:else}
              <span class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-white/70">عرض معاينة</span>
            {/if}
          </div>
        </div>

        {#if driver.description}
          <div class="rounded-2xl bg-surface-container-low p-4 text-right">
            <p class="text-[10px] font-bold text-on-surface-variant">ملاحظات العرض</p>
            <p class="mt-1 text-sm font-bold text-on-surface">{driver.description}</p>
          </div>
        {/if}
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="rounded-2xl border border-outline-variant/20 bg-surface-container-low py-3.5 text-sm font-black text-on-surface active:scale-[0.98]"
          on:click={() => dispatch('close')}
        >
          إغلاق
        </button>
        <button
          type="button"
          disabled={!fromGov || !toGov}
          on:click={() => dispatch('book', driver)}
          class="rounded-2xl bg-primary py-3.5 text-sm font-black text-on-primary shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
        >
          احجز الآن
        </button>
      </div>
    </section>
  </div>
{/if}
