<script lang="ts">
  import { onMount } from 'svelte';
  import { currentRoute } from '../lib/stores/navigationStore';
  import { userId } from '../lib/stores/authStore';
  import { get } from 'svelte/store';
  import { bookingStore } from '../lib/stores/bookingStore';
  import { apiClient } from '../lib/api/client';
  import { createAirportBooking } from '../lib/api/bookings';
  import { isRideOfferGuid, normalizeRideOfferGuidString } from '../lib/api/rideOfferGuid';
  import { resolveRideOfferIdFromSearch } from '../lib/api/resolveRideOfferId';
  import { toast } from '../lib/stores/toastStore';
  import type { CreditCardModel, RideModel, ApiGetManyResponse, CreateBookingRequest } from '../lib/types/api';
  import AppAlert from '../lib/components/AppAlert.svelte';
  import TripDetailsDialog from '../lib/components/TripDetailsDialog.svelte';
  import { getCarLabel } from '../lib/booking/display';

  let selectedMethod: 'card' | 'cash' = 'cash';
  let loading = false;
  
  let cards: CreditCardModel[] = [];
  let selectedCardId = '';
  
  // New Card Form
  let showAddCard = false;
  let newCardNumber = '';
  let newCardName = '';
  let newCardCve = '';
  let newCardExp = '';
  let addingCard = false;
  let errorMsg = '';
  let showTripDetails = false;

  $: carLabel = getCarLabel($bookingStore.carType);

  function digitsOnly(value: string): string {
    return value.replace(/\D/g, '');
  }

  function getCardValidationError(): string {
    const cardNumber = digitsOnly(newCardNumber);
    const cve = digitsOnly(newCardCve);
    const expiration = digitsOnly(newCardExp);
    const month = Number(expiration.slice(0, 2));

    if (!/^\d{12,19}$/.test(cardNumber)) return 'يرجى إدخال رقم بطاقة صحيح';
    if (newCardName.trim().length < 2) return 'يرجى إدخال الاسم الموجود على البطاقة';
    if (!/^\d{3,4}$/.test(cve)) return 'يرجى إدخال رمز CVE صحيح';
    if (!/^\d{4}$/.test(expiration) || month < 1 || month > 12) {
      return 'يرجى إدخال تاريخ انتهاء صحيح بصيغة MMYY';
    }

    return '';
  }

  onMount(async () => {
    const ownerId = get(userId);
    if (!ownerId) {
      cards = [];
      selectedMethod = 'cash';
      return;
    }
    try {
      const res = await apiClient.get<ApiGetManyResponse<CreditCardModel>>('/CreditCard?PageNum=1&PageSize=20');
      cards = res.data.data || [];
      if (cards.length > 0) {
        selectedCardId = cards[0].id;
        selectedMethod = 'card';
      }
    } catch {
      cards = [];
      selectedMethod = 'cash';
    }
  });

  async function handleAddCard() {
      errorMsg = '';
      const validationError = getCardValidationError();
      if (validationError) {
          errorMsg = validationError;
          return;
      }
      addingCard = true;
      try {
          const ownerId = get(userId);
          if (!ownerId) {
              errorMsg = 'يجب تسجيل الدخول أولاً لإضافة بطاقة';
              return;
          }
          const cardNumber = digitsOnly(newCardNumber);
          const cve = digitsOnly(newCardCve);
          const expiration = digitsOnly(newCardExp);
          const expInt = parseInt(expiration, 10);
          const payload = {
              cardNumber,
              cardHolderName: newCardName.trim().toUpperCase(),
              cve: parseInt(cve, 10),
              expiration: expInt
          };
          const res = await apiClient.post<any>(`/CreditCard?ownerId=${ownerId}`, payload);
          if (res.data.success) {
              const newCard = res.data.data;
              cards = [newCard, ...cards];
              selectedCardId = newCard.id;
              selectedMethod = 'card';
              showAddCard = false;
              newCardNumber = '';
              newCardName = '';
              newCardCve = '';
              newCardExp = '';
          } else {
              errorMsg = res.data.message || 'Error occurred';
          }
      } catch (err: any) {
          errorMsg = err.message || 'Error occurred adding card';
      } finally {
          addingCard = false;
      }
  }

  async function handleCompleteSelection() {
    loading = true;
    errorMsg = '';
    let bookingData = get(bookingStore);

    if (selectedMethod === 'card' && !selectedCardId) {
        errorMsg = 'يرجى اختيار بطاقة أو استخدام الدفع المباشر';
        loading = false;
        return;
    }

    if (bookingData.serviceType !== 'Inter-city') {
        if (!bookingData.companyId) {
            errorMsg = 'يرجى العودة واختيار شركة لحجز المطار.';
            loading = false;
            return;
        }
        if (!Number.isFinite(bookingData.pickupLatitude) || !Number.isFinite(bookingData.pickupLongitude)) {
            errorMsg = 'إحداثيات نقطة الانطلاق غير مكتملة. يرجى العودة وتحديد الموقع مرة أخرى.';
            loading = false;
            return;
        }

        const payload: CreateBookingRequest = {
            pickup: bookingData.pickupLocation,
            dropoff: bookingData.dropoffLocation || bookingData.airport || '',
            latitude: Number(bookingData.pickupLatitude),
            longitude: Number(bookingData.pickupLongitude),
            maxPassengers: bookingData.passengersCount || 1,
            homeToAirport: bookingData.serviceType === 'To Airport',
            companyId: bookingData.companyId,
        };

        try {
            const booking = await createAirportBooking(payload);
            toast.success('تم إنشاء حجز المطار بنجاح');
            bookingStore.update((b) => ({
                ...b,
                bookingId: booking.id,
                companyId: booking.companyId || b.companyId,
                companyName: booking.companyName || b.companyName,
            }));
            currentRoute.set('history');
        } catch (error: any) {
            if (import.meta.env.DEV) {
                console.error('فشل إنشاء حجز المطار:', error instanceof Error ? error.message : error);
            }
            errorMsg = error.message || 'تعذر إنشاء حجز المطار';
        } finally {
            loading = false;
        }
        return;
    }

    if (!bookingData.rideOfferId && bookingData.pickupProvince && bookingData.dropoffProvince) {
        const seats = bookingData.searchSeatCount ?? bookingData.passengersCount ?? 1;
        try {
            const resolved = await resolveRideOfferIdFromSearch(
                bookingData.pickupProvince,
                bookingData.dropoffProvince,
                seats,
            );
            if (resolved) {
                bookingStore.update((b) => ({ ...b, rideOfferId: resolved }));
                bookingData = get(bookingStore);
            }
        } catch (e) {
            if (import.meta.env.DEV) {
                console.warn('تعذّر إعادة جلب rideOfferId:', e instanceof Error ? e.message : e);
            }
        }
    }

    if (!bookingData.rideOfferId) {
        errorMsg = 'يرجى اختيار عرض رحلة متاح أنشأه السائق للمتابعة.';
        loading = false;
        return;
    }

    const offerIdNormalized = normalizeRideOfferGuidString(bookingData.rideOfferId);
    if (!isRideOfferGuid(offerIdNormalized)) {
        errorMsg = 'معرّف عرض الرحلة غير صالح. يرجى العودة واختيار رحلة أنشأها السائق من التطبيق.';
        loading = false;
        return;
    }

    try {
        const pickupLatitude = Number.isFinite(bookingData.pickupLatitude)
            ? Number(bookingData.pickupLatitude)
            : 33.3128;
        const pickupLongitude = Number.isFinite(bookingData.pickupLongitude)
            ? Number(bookingData.pickupLongitude)
            : 44.3615;

        // إرسال الطلب إلى السيرفر بـ rideOfferId الفعلي للرحلة التي أنشأها السائق
        const response = await apiClient.post<any>('/Ride', {
            rideOfferId: offerIdNormalized,
            pickupLatitude,
            pickupLongitude,
        });

        if (response.data && (response.data.data || response.data.success)) {
            const ride: RideModel = response.data.data || response.data;
            toast.success("تم إرسال الطلب للسائق بنجاح");
            bookingStore.update(b => ({ ...b, bookingId: ride.id || offerIdNormalized }));
            currentRoute.set('history');
        } else {
            errorMsg = response.data.message || 'فشل إرسال الطلب للسائق.';
        }
    } catch (error: any) {
        const raw = error?.response?.data;
        const msg = typeof raw === 'object' && raw !== null && 'message' in raw
            ? String((raw as { message?: string }).message)
            : typeof raw === 'string'
            ? raw
            : error?.message;
        errorMsg = msg || "فشل الاتصال بالسيرفر لإرسال الطلب للسائق";
    } finally {
        loading = false;
    }
  }
</script>

<div class="space-y-6 flex flex-col items-center px-1">
    
    {#if $bookingStore.serviceType === 'Inter-city'}
    <!-- Stepper for inter-city: 2 steps -->
    <div class="flex justify-between items-center mb-6 px-1 w-full mt-2">
        <div class="flex flex-col items-center gap-2 opacity-40">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">1</div>
            <span class="text-[10px] font-medium text-on-surface-variant">اختيار الرحلة</span>
        </div>
        <div class="flex-1 h-[2px] bg-primary mx-1"></div>
        <div class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">2</div>
            <span class="text-[10px] font-medium text-on-surface">التأكيد</span>
        </div>
    </div>
    {:else}
    <!-- Stepper for airport: 3 steps -->
    <div class="flex justify-between items-center mb-6 px-1 w-full mt-2">
        <div class="flex flex-col items-center gap-2 opacity-40">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">1</div>
            <span class="text-[10px] font-medium text-on-surface-variant">التفاصيل</span>
        </div>
        <div class="flex-1 h-[2px] bg-primary mx-1"></div>
        <div class="flex flex-col items-center gap-2 opacity-40">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">2</div>
            <span class="text-[10px] font-medium text-on-surface-variant">المركبة</span>
        </div>
        <div class="flex-1 h-[2px] bg-primary mx-1"></div>
        <div class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">3</div>
            <span class="text-[10px] font-medium text-on-surface">التأكيد</span>
        </div>
    </div>
    {/if}

    {#if errorMsg}
        <AppAlert type="error" title="تعذر إكمال الحجز" message={errorMsg} />
    {/if}

    <section class="w-full bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/10 text-right relative overflow-hidden">
         <div class="absolute -left-12 -top-12 w-32 h-32 bg-primary-container/20 rounded-full blur-[40px] pointer-events-none"></div>

         <div class="flex justify-between flex-row-reverse items-center mb-2">
              <h2 class="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full inline-flex">تأكيد الحجز</h2>
         </div>
         
         <div class="mt-6 flex flex-row-reverse gap-3 pt-6 border-t border-outline-variant/10">
              <div class="flex-1">
                  <span class="block text-[10px] text-on-surface-variant mb-1">نوع السيارة</span>
                  <span class="block text-sm font-bold">{carLabel}</span>
                  {#if $bookingStore.carType === 'vip'}
                      <span class="mt-1 block text-[10px] font-bold text-on-surface-variant">
                          حتى {$bookingStore.vipPassengerCapacity ?? 7} ركاب و {$bookingStore.vipLuggageCapacity ?? 8} حقائب
                      </span>
                  {/if}
              </div>
         </div>

         <div class="mt-4 flex flex-row-reverse justify-between items-center bg-primary/10 p-4 rounded-2xl border border-primary/20">
             <span class="text-xs font-bold text-on-surface">السعر الديناميكي المحسوب من الخريطة:</span>
             <span class="text-lg font-black text-primary" dir="ltr">
               {($bookingStore.price || 15000).toLocaleString('en-US')} د.ع
             </span>
         </div>

         <button
            type="button"
            on:click={() => showTripDetails = true}
            class="mt-5 flex w-full items-center justify-between rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-right transition-all active:scale-[0.98]"
            dir="rtl"
         >
            <span class="flex items-center gap-2 text-sm font-black text-on-surface">
                <span class="material-symbols-outlined text-primary text-[20px]">route</span>
                تفاصيل الرحلة
            </span>
            <span class="material-symbols-outlined rotate-180 text-primary text-[18px]">arrow_back</span>
         </button>
    </section>

    <section class="w-full">
         <h2 class="text-lg font-bold mb-4 text-right px-1">طريقة الدفع</h2>
         <div class="grid grid-cols-1 gap-3 mb-4">
             <button on:click={() => { selectedMethod = 'cash'; selectedCardId = ''; }} class="relative w-full text-right overflow-hidden {selectedMethod === 'cash' ? 'bg-surface-container-lowest ring-2 ring-primary-container shadow-md' : 'bg-surface-container-low hover:bg-surface-container'} rounded-2xl p-4 transition-all duration-300 active:scale-[0.98]">
                 <div class="flex flex-row-reverse items-center justify-between">
                     <div class="flex flex-row-reverse items-center gap-4">
                         <div class="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center shrink-0">
                              <span class="material-symbols-outlined text-on-surface-variant font-black" style="font-variation-settings: 'FILL' 1;">payments</span>
                         </div>
                         <div>
                             <h3 class="text-sm font-bold text-on-surface mb-0.5">دفع مباشر</h3>
                             <p class="text-[10px] font-bold text-on-surface-variant">ادفع مباشرة عند الرحلة مع السائق</p>
                         </div>
                     </div>
                     {#if selectedMethod === 'cash'}
                         <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <span class="material-symbols-outlined text-[14px] text-on-primary" style="font-variation-settings: 'FILL' 1;">check</span>
                         </div>
                     {:else}
                         <div class="w-6 h-6 rounded-full border-2 border-outline-variant shrink-0"></div>
                     {/if}
                 </div>
             </button>

             {#each cards as card}
             <button on:click={() => { selectedCardId = card.id; selectedMethod = 'card'; }} class="relative w-full text-right overflow-hidden {(selectedMethod === 'card' && selectedCardId === card.id) ? 'bg-surface-container-lowest ring-2 ring-primary-container shadow-md' : 'bg-surface-container-low hover:bg-surface-container'} rounded-2xl p-4 transition-all duration-300 active:scale-[0.98]">
                 <div class="flex flex-row-reverse items-center justify-between">
                     <div class="flex flex-row-reverse items-center gap-4">
                         <div class="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center shrink-0">
                              <span class="material-symbols-outlined text-on-surface-variant font-black" style="font-variation-settings: 'FILL' 1;">credit_card</span>
                         </div>
                         <div>
                             <h3 class="text-sm font-bold text-on-surface mb-0.5" dir="ltr">**** **** **** {card.cardNumber.slice(-4)}</h3>
                             <p class="text-[10px] font-bold text-on-surface-variant">{card.cardHolderName}</p>
                         </div>
                     </div>
                     {#if selectedMethod === 'card' && selectedCardId === card.id}
                         <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <span class="material-symbols-outlined text-[14px] text-on-primary" style="font-variation-settings: 'FILL' 1;">check</span>
                         </div>
                     {:else}
                         <div class="w-6 h-6 rounded-full border-2 border-outline-variant shrink-0"></div>
                     {/if}
                 </div>
             </button>
             {/each}

             <button on:click={() => showAddCard = !showAddCard} class="relative w-full text-right overflow-hidden bg-surface-container-low hover:bg-surface-container text-primary rounded-2xl p-4 transition-all duration-300 active:scale-[0.98]">
                 <div class="flex justify-end font-bold items-center gap-2">
                     إضافة بطاقة عبر التفويض
                     <span class="material-symbols-outlined">add_circle</span>
                 </div>
             </button>
         </div>
         {#if cards.length === 0}
            <p class="text-[11px] text-on-surface-variant text-right px-1">لا توجد بطاقات محفوظة حالياً. يمكنك المتابعة بالدفع المباشر أو إضافة بطاقة جديدة.</p>
         {/if}
    </section>

    {#if showAddCard}
    <section class="w-full bg-surface-container-low p-5 rounded-[24px] border border-outline-variant/5 text-right space-y-3 mb-4 animate-fade-in">
        <h2 class="text-[11px] font-bold text-on-surface-variant">ربط بطاقة مؤمنة</h2>
        
        <div>
            <label for="cardNumber" class="text-[10px] text-on-surface-variant font-bold">رقم البطاقة (16 رقم)</label>
            <input id="cardNumber" bind:value={newCardNumber} inputmode="numeric" autocomplete="cc-number" maxlength="23" placeholder="1111222233334444" class="w-full bg-surface-container py-3 px-4 rounded-xl text-right mt-1 text-sm outline-none focus:ring-1 focus:ring-primary/40 text-on-surface" />
        </div>

        <div>
            <label for="cardName" class="text-[10px] text-on-surface-variant font-bold">الاسم على البطاقة</label>
            <input id="cardName" bind:value={newCardName} autocomplete="cc-name" maxlength="80" placeholder="ALI HASSAN" class="w-full bg-surface-container py-3 px-4 rounded-xl text-right mt-1 text-sm uppercase outline-none focus:ring-1 focus:ring-primary/40 text-on-surface" />
        </div>

        <div class="flex gap-4">
            <div class="flex-1">
                <label for="cardExp" class="text-[10px] text-on-surface-variant font-bold">انتهاء (MMYY)</label>
                <input id="cardExp" bind:value={newCardExp} inputmode="numeric" autocomplete="cc-exp" maxlength="4" placeholder="1229" class="w-full bg-surface-container py-3 px-4 rounded-xl text-right mt-1 text-sm outline-none focus:ring-1 focus:ring-primary/40 text-on-surface" />
            </div>
            <div class="flex-[0.5]">
                <label for="cardCve" class="text-[10px] text-on-surface-variant font-bold">CVE</label>
                <input id="cardCve" bind:value={newCardCve} type="password" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="***" class="w-full bg-surface-container py-3 px-4 rounded-xl text-right mt-1 text-sm outline-none focus:ring-1 focus:ring-primary/40 text-on-surface" />
            </div>
        </div>

        <button disabled={addingCard} on:click={handleAddCard} class="w-full bg-primary text-[#1D1B1C] py-3 rounded-xl font-bold mt-2 hover:opacity-90 active:scale-[0.98]">
            {addingCard ? 'جاري الإضافة...' : 'حفظ البطاقة'}
        </button>
    </section>
    {/if}
    
    <div class="pt-2 w-full">
        <button disabled={loading} on:click={handleCompleteSelection} class="w-full btn-premium py-4 {loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}">
            {#if loading}
                <span class="material-symbols-outlined animate-spin text-[24px]">autorenew</span>
            {:else}
                <span>{selectedMethod === 'cash' ? 'تأكيد الحجز بالدفع المباشر' : 'تأكيد الحجز'}</span>
                <span class="material-symbols-outlined text-xl">arrow_back</span>
            {/if}
        </button>
    </div>
</div>

<TripDetailsDialog
    open={showTripDetails}
    booking={$bookingStore}
    on:click={() => showTripDetails = false}
/>
