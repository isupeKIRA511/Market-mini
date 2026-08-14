<script lang="ts">
  import { onMount } from 'svelte';
  import { currentRoute } from '../lib/stores/navigationStore';
  import { bookingStore } from '../lib/stores/bookingStore';
  import { getBookingCompanies, type BookingCompanyOption } from '../lib/api/bookings';
  import { toast } from '../lib/stores/toastStore';
  import AppAlert from '../lib/components/AppAlert.svelte';
  import VipCarGraphic from '../lib/components/VipCarGraphic.svelte';

  let selectedCar: 'standard' | 'vip' = 'standard';
  let companies: BookingCompanyOption[] = [];
  let companiesLoading = true;
  let companiesError = '';
  let selectedCompanyId = '';

  const standardCapacity = {
    passengers: 4,
    luggage: 3,
  };

  const vipCapacity = {
    passengers: 7,
    luggage: 8,
  };

  function formatMoney(v: number | undefined): string {
    if (!Number.isFinite(v)) return '—';
    return `${Number(v).toLocaleString('en-US')} د.ع`;
  }

  function companyRateLabel(company: BookingCompanyOption): string {
    const parts = [
      `الأساس ${formatMoney(company.basePrice)}`,
      `للكم ${formatMoney(company.pricePerKm)}`,
    ];
    if (Number.isFinite(company.pricePerKmInRushHour)) {
      parts.push(`الذروة ${formatMoney(company.pricePerKmInRushHour)}`);
    }
    return parts.join(' · ');
  }

  onMount(async () => {
    companiesLoading = true;
    companiesError = '';
    selectedCompanyId = $bookingStore.companyId || '';
    try {
      companies = await getBookingCompanies();
      if (!selectedCompanyId && companies.length > 0) {
        selectedCompanyId = companies[0].id;
      }
      if (companies.length === 0) {
        companiesError = 'لم يرجع الخادم أي شركة متاحة لإنشاء حجز المطار.';
      }
    } catch (e) {
      companies = [];
      companiesError = e instanceof Error ? e.message : 'تعذر تحميل الشركات';
    } finally {
      companiesLoading = false;
    }
  });

  import { calculateMapDynamicPrice } from '../lib/booking/display';

  $: activeCompany = companies.find((company) => company.id === selectedCompanyId);
  $: estimatedCalc = calculateMapDynamicPrice(
    $bookingStore.homeLatitude,
    $bookingStore.homeLongitude,
    $bookingStore.airportLatitude,
    $bookingStore.airportLongitude,
    selectedCar === 'vip',
    $bookingStore.passengersCount || 1,
    activeCompany
  );
  $: estimatedPriceFormatted = `${estimatedCalc.price.toLocaleString('en-US')} د.ع`;

  function handleContinue() {
    const selectedCompany = activeCompany;
    if (!selectedCompany) {
      toast.warning('يرجى اختيار شركة قبل المتابعة.');
      return;
    }

    bookingStore.update((b) => ({
      ...b,
      carType: selectedCar,
      carModel: selectedCar === 'vip' ? 'VIP Airport Van' : 'Standard Airport Car',
      vipPassengerCapacity: selectedCar === 'vip' ? vipCapacity.passengers : undefined,
      vipLuggageCapacity: selectedCar === 'vip' ? vipCapacity.luggage : undefined,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      price: estimatedCalc.price,
    }));
    currentRoute.set('payment');
  }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center mb-6 px-2 mt-2">
        <div class="flex flex-col items-center gap-2 opacity-40">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">1</div>
            <span class="text-[10px] font-medium text-on-surface-variant">التفاصيل</span>
        </div>
        <div class="flex-1 h-[2px] bg-primary mx-1"></div>
        <div class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">2</div>
            <span class="text-[10px] font-medium text-on-surface">الخدمة</span>
        </div>
        <div class="flex-1 h-[2px] bg-outline-variant mx-1 opacity-20"></div>
        <div class="flex flex-col items-center gap-2 opacity-40">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">3</div>
            <span class="text-[10px] font-medium text-on-surface-variant">الدفع</span>
        </div>
    </div>

    <section class="space-y-3">
        <div class="text-right px-1">
            <h2 class="text-xl font-black text-on-surface">اختر خدمة المطار</h2>
            <p class="text-[11px] font-bold text-on-surface-variant mt-1">VIP اختياري لمن يحتاج ركاباً وحقائب أكثر.</p>
        </div>

        {#if companiesError}
            <AppAlert type="error" title="تعذر تحميل الشركات" message={companiesError} />
        {/if}

        <section class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 text-right">
            <h3 class="text-base font-black text-on-surface mb-4 flex items-center justify-end gap-2">
                اختر الشركة
                <span class="material-symbols-outlined text-primary text-xl">domain</span>
            </h3>

            {#if companiesLoading}
                <div class="flex items-center justify-center gap-2 py-5 text-sm font-bold text-on-surface-variant">
                    <span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    جاري تحميل الشركات…
                </div>
            {:else if companies.length > 0}
                <div class="space-y-2">
                    {#each companies as company}
                        <button
                            type="button"
                            on:click={() => selectedCompanyId = company.id}
                            class="w-full rounded-2xl p-4 text-right transition-all active:scale-[0.98] {selectedCompanyId === company.id ? 'bg-primary/10 ring-2 ring-primary/50' : 'bg-surface-container-low border border-outline-variant/10'}"
                            dir="rtl"
                        >
                            <div class="flex items-center justify-between gap-3">
                                <div class="text-right">
                                    <p class="text-sm font-black text-on-surface">{company.name}</p>
                                    <p class="mt-1 text-[10px] font-bold text-on-surface-variant">{companyRateLabel(company)}</p>
                                </div>
                                <div class="h-6 w-6 rounded-full flex items-center justify-center {selectedCompanyId === company.id ? 'bg-primary text-on-primary' : 'border-2 border-outline-variant'}">
                                    {#if selectedCompanyId === company.id}
                                        <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">check</span>
                                    {/if}
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </section>

        <button
            type="button"
            on:click={() => selectedCar = 'standard'}
            class="w-full rounded-[24px] p-5 text-right transition-all active:scale-[0.98] {selectedCar === 'standard' ? 'bg-surface-container-lowest ring-2 ring-primary shadow-md' : 'bg-surface-container-low border border-outline-variant/10'}"
        >
            <div class="flex items-start justify-between gap-4 flex-row-reverse">
                <div class="text-right">
                    <span class="inline-flex rounded-full bg-primary/15 px-3 py-1 text-[10px] font-black text-on-surface mb-3">الخيار العادي</span>
                    <h3 class="text-lg font-black text-on-surface mb-1">سيارة مطار عادية</h3>
                    <p class="text-[11px] font-bold text-on-surface-variant leading-relaxed">مناسبة للرحلات الخفيفة والعدد الأقل من الحقائب.</p>
                </div>
                <div class="w-14 h-14 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[34px]">local_taxi</span>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-4" dir="rtl">
                <div class="rounded-2xl bg-surface-container p-3 text-center">
                    <span class="material-symbols-outlined text-primary text-[20px]">group</span>
                    <p class="text-[10px] font-bold text-on-surface-variant mt-1">حتى {standardCapacity.passengers} ركاب</p>
                </div>
                <div class="rounded-2xl bg-surface-container p-3 text-center">
                    <span class="material-symbols-outlined text-primary text-[20px]">luggage</span>
                    <p class="text-[10px] font-bold text-on-surface-variant mt-1">حتى {standardCapacity.luggage} حقائب</p>
                </div>
            </div>
        </button>

        <button
            type="button"
            on:click={() => selectedCar = 'vip'}
            class="w-full bg-[#1D1B1C] text-white rounded-[24px] p-5 overflow-hidden relative shadow-lg transition-all active:scale-[0.98] {selectedCar === 'vip' ? 'ring-2 ring-primary' : ''}"
        >
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary via-[#7DD3FC] to-[#10B981]"></div>
            <div class="relative z-10 flex items-start justify-between gap-4 flex-row-reverse">
                <div class="text-right">
                    <span class="inline-flex items-center gap-1 rounded-full bg-primary text-on-primary px-3 py-1 text-[10px] font-black mb-3">
                        <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                        ترقية اختيارية
                    </span>
                    <h3 class="text-[22px] font-black tracking-tight mb-1">سيارة VIP واسعة</h3>
                    <p class="text-white/70 text-[11px] font-bold leading-relaxed max-w-[240px]">
                        مساحة أكبر للعائلة، الحقائب، والاستقبال المريح بعد الرحلة.
                    </p>
                </div>
                <div class="w-[132px] shrink-0 -ml-4">
                    <VipCarGraphic compact />
                </div>
            </div>

            <div class="relative z-10 grid grid-cols-3 gap-2 mt-5" dir="rtl">
                <div class="rounded-2xl bg-white/8 border border-white/10 p-3 text-center">
                    <span class="material-symbols-outlined text-primary text-[20px]">groups</span>
                    <p class="text-[10px] text-white/60 font-bold mt-1">الركاب</p>
                    <p class="text-sm font-black">حتى {vipCapacity.passengers}</p>
                </div>
                <div class="rounded-2xl bg-white/8 border border-white/10 p-3 text-center">
                    <span class="material-symbols-outlined text-[#7DD3FC] text-[20px]">luggage</span>
                    <p class="text-[10px] text-white/60 font-bold mt-1">الحقائب</p>
                    <p class="text-sm font-black">حتى {vipCapacity.luggage}</p>
                </div>
                <div class="rounded-2xl bg-white/8 border border-white/10 p-3 text-center">
                    <span class="material-symbols-outlined text-[#10B981] text-[20px]">verified</span>
                    <p class="text-[10px] text-white/60 font-bold mt-1">الخدمة</p>
                    <p class="text-sm font-black">VIP</p>
                </div>
            </div>
        </button>
    </section>

    <section class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 text-right">
        <h3 class="text-base font-black text-on-surface mb-4">ما الذي يشمله الاختيار؟</h3>
        <div class="space-y-3" dir="rtl">
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-primary text-[22px] mt-0.5">flight</span>
                <div>
                    <p class="text-sm font-black text-on-surface">مناسب للمطار والعودة</p>
                        <p class="text-[11px] font-bold text-on-surface-variant">اختيار الخدمة هنا يخص رحلات إلى المطار أو من المطار فقط.</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-[#3B82F6] text-[22px] mt-0.5">airline_seat_recline_extra</span>
                <div>
                        <p class="text-sm font-black text-on-surface">VIP عند الحاجة فقط</p>
                        <p class="text-[11px] font-bold text-on-surface-variant">يمكن ترك الخدمة عادية أو ترقيتها إذا كان العدد والحقائب أكثر.</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-[#10B981] text-[22px] mt-0.5">support_agent</span>
                <div>
                    <p class="text-sm font-black text-on-surface">تجربة استقبال أهدأ</p>
                    <p class="text-[11px] font-bold text-on-surface-variant">تفاصيل الرحلة والموقع تُرسل للسائق قبل تأكيد الحجز.</p>
                </div>
            </div>
        </div>
    </section>

    <div class="pt-2 w-full pb-2">
        <button
            disabled={companiesLoading || !selectedCompanyId}
            on:click={handleContinue}
            class="w-full btn-premium py-5 text-lg {(companiesLoading || !selectedCompanyId) ? 'opacity-50 cursor-not-allowed grayscale' : ''}"
        >
            <span>{selectedCar === 'vip' ? `اختيار VIP والمتابعة للدفع (${estimatedPriceFormatted})` : `المتابعة بالخدمة العادية (${estimatedPriceFormatted})`}</span>
            <span class="material-symbols-outlined text-xl">arrow_back</span>
        </button>
    </div>
</div>
