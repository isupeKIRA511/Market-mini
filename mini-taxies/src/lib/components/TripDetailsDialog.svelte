<script lang="ts">
  import type { BookingDetails } from '../types/Booking';
  import { getCarLabel, getRouteSummary, getServiceLabel } from '../booking/display';

  export let open = false;
  export let booking: BookingDetails;

  $: carLabel = getCarLabel(booking.carType);
  $: serviceLabel = getServiceLabel(booking.serviceType);
  $: routeSummary = getRouteSummary(booking);
</script>

{#if open}
  <div class="fixed inset-0 z-[10000] flex items-end justify-center" dir="rtl">
    <button
      type="button"
      aria-label="إغلاق تفاصيل الرحلة"
      class="absolute inset-0 h-full w-full border-0 bg-black/55 backdrop-blur-sm"
      on:click
    ></button>
    <section class="relative z-10 w-full max-w-[420px] rounded-t-[32px] bg-surface p-6 shadow-2xl">
      <div class="mx-auto mb-5 h-1.5 w-12 rounded-full bg-outline-variant/40"></div>
      <div class="mb-5 flex items-center justify-between">
        <button
          type="button"
          on:click
          class="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container"
          aria-label="إغلاق"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div class="text-right">
          <h2 class="text-xl font-black text-on-surface">تفاصيل الرحلة</h2>
          <p class="text-[11px] font-bold text-on-surface-variant">{serviceLabel}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="rounded-2xl bg-surface-container-low p-4 text-right">
          <p class="text-[10px] font-bold text-on-surface-variant">المسار</p>
          <p class="mt-1 text-sm font-black text-on-surface">{routeSummary}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-surface-container-low p-4 text-right">
            <p class="text-[10px] font-bold text-on-surface-variant">المطار</p>
            <p class="mt-1 text-sm font-black text-on-surface">{booking.airport || '—'}</p>
          </div>
          <div class="rounded-2xl bg-surface-container-low p-4 text-right">
            <p class="text-[10px] font-bold text-on-surface-variant">وقت الرحلة</p>
            <p class="mt-1 text-sm font-black text-on-surface">{booking.dateTime || '—'}</p>
          </div>
          <div class="rounded-2xl bg-surface-container-low p-4 text-right">
            <p class="text-[10px] font-bold text-on-surface-variant">الركاب</p>
            <p class="mt-1 text-sm font-black text-on-surface">{booking.passengersCount || booking.searchSeatCount || 1}</p>
          </div>
          <div class="rounded-2xl bg-surface-container-low p-4 text-right">
            <p class="text-[10px] font-bold text-on-surface-variant">الحقائب</p>
            <p class="mt-1 text-sm font-black text-on-surface">{booking.luggageCount ?? '—'}</p>
          </div>
        </div>

        <div class="rounded-2xl bg-[#1D1B1C] p-4 text-right text-white">
          <p class="text-[10px] font-bold text-white/60">نوع السيارة</p>
          <p class="mt-1 text-sm font-black">{carLabel}</p>
          {#if booking.companyName}
            <p class="mt-1 text-[10px] font-bold text-white/60">الشركة: {booking.companyName}</p>
          {/if}
          {#if booking.carType === 'vip'}
            <p class="mt-1 text-[10px] font-bold text-primary">
              سعة VIP: {booking.vipPassengerCapacity ?? 7} ركاب / {booking.vipLuggageCapacity ?? 8} حقائب
            </p>
          {/if}
        </div>

        <div class="rounded-2xl bg-surface-container-low p-4 text-right">
          <p class="text-[10px] font-bold text-on-surface-variant">رقم الرحلة / ملاحظات السائق</p>
          <p class="mt-1 text-sm font-black text-on-surface">{booking.flightNumber || 'لا توجد ملاحظات'}</p>
        </div>
      </div>

      <button
        type="button"
        on:click
        class="mt-5 w-full rounded-2xl bg-primary py-4 text-sm font-black text-on-primary shadow-lg shadow-primary/20 active:scale-[0.98]"
      >
        تم
      </button>
    </section>
  </div>
{/if}
