<script lang="ts">
  import { onMount } from 'svelte';
  import { currentRoute } from '../lib/stores/navigationStore';
  import { serverToken, userId } from '../lib/stores/authStore';
  import { get } from 'svelte/store';
  import { bookingStore } from '../lib/stores/bookingStore';
  import { apiClient } from '../lib/api/client';
  import type { CreditCardModel, RideModel, ApiGetManyResponse } from '../lib/types/api';

  let selectedMethod = 'card';
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

  onMount(async () => {
    try {
      const res = await apiClient.get<ApiGetManyResponse<CreditCardModel>>('/creditcards?pageNum=1&pageSize=20');
      cards = res.data.data || [];
      if (cards.length > 0) selectedCardId = cards[0].id;
    } catch {
      cards = [];
    }
  });

  async function handleAddCard() {
      addingCard = true;
      errorMsg = '';
      try {
          // Add credit card using the specific API
          const ownerId = get(userId);
          const expInt = parseInt(newCardExp, 10);
          const payload = {
              cardNumber: newCardNumber,
              cardHolderName: newCardName.toUpperCase(),
              cve: parseInt(newCardCve, 10),
              expiration: expInt
          };
          const res = await apiClient.post<any>(`/creditcards?ownerId=${ownerId}`, payload);
          if (res.data.success) {
              const newCard = res.data.data;
              cards = [newCard, ...cards];
              selectedCardId = newCard.id;
              showAddCard = false;
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
    const bookingData = get(bookingStore);
    if (!bookingData.rideOfferId) {
        errorMsg = 'لا يوجد عرض حجز محدد';
        loading = false;
        return;
    }

    try {
        // Request the ride
        const response = await apiClient.post<any>('/rides', {
            rideOfferId: bookingData.rideOfferId
        });
        
        if (response.data && response.data.data) {
            const ride: RideModel = response.data.data;
            alert("تم إرسال الطلب بنجاح");
            bookingStore.update(b => ({ ...b, bookingId: ride.id }));
            currentRoute.set('booking-status');
        } else {
            errorMsg = response.data.message || 'خطأ في إنشاء الحجز';
        }
    } catch (error: any) {
        console.error("فشل إرسال الحجز:", error);
        errorMsg = error.message || "فشلت عملية الدفع أو الاتصال بالسيرفر";
    } finally {
        loading = false;
    }
  }
</script>

<div class="space-y-6 flex flex-col items-center px-1">
    
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

    {#if errorMsg}
        <div class="w-full bg-error-container/80 border border-error/20 text-on-error-container text-[11px] font-semibold p-3.5 rounded-2xl text-right" role="alert">
            {errorMsg}
        </div>
    {/if}

    <section class="w-full bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/10 text-right relative overflow-hidden">
         <div class="absolute -left-12 -top-12 w-32 h-32 bg-primary-container/20 rounded-full blur-[40px] pointer-events-none"></div>

         <div class="flex justify-between flex-row-reverse items-center mb-2">
              <h2 class="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full inline-flex">تأكيد الحجز</h2>
         </div>
         
         <div class="mt-6 flex flex-row-reverse gap-3 pt-6 border-t border-outline-variant/10">
              <div class="flex-1">
                  <span class="block text-[10px] text-on-surface-variant mb-1">نوع السيارة</span>
                  <span class="block text-sm font-bold">{$bookingStore.carType === 'suv' ? 'عائلي' : ($bookingStore.carType === 'van' ? 'فان' : 'سيدان')}</span>
              </div>
         </div>
    </section>

    <section class="w-full">
         <h2 class="text-lg font-bold mb-4 text-right px-1">البطاقات الائتمانية</h2>
         <div class="grid grid-cols-1 gap-3 mb-4">
             {#each cards as card}
             <button on:click={() => { selectedCardId = card.id; selectedMethod = 'card'; }} class="relative w-full text-right overflow-hidden {selectedCardId === card.id ? 'bg-surface-container-lowest ring-2 ring-primary-container shadow-md' : 'bg-surface-container-low hover:bg-surface-container'} rounded-2xl p-4 transition-all duration-300 active:scale-[0.98]">
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
                     {#if selectedCardId === card.id}
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
    </section>

    {#if showAddCard}
    <section class="w-full bg-surface-container-low p-5 rounded-[24px] border border-outline-variant/5 text-right space-y-3 mb-4 animate-fade-in">
        <h2 class="text-[11px] font-bold text-on-surface-variant">ربط بطاقة مؤمنة</h2>
        
        <div>
            <label for="cardNumber" class="text-[10px] text-on-surface-variant font-bold">رقم البطاقة (16 رقم)</label>
            <input id="cardNumber" bind:value={newCardNumber} placeholder="1111222233334444" class="w-full bg-surface-container py-3 px-4 rounded-xl text-right mt-1 text-sm outline-none focus:ring-1 focus:ring-primary/40 text-on-surface" />
        </div>

        <div>
            <label for="cardName" class="text-[10px] text-on-surface-variant font-bold">الاسم على البطاقة</label>
            <input id="cardName" bind:value={newCardName} placeholder="ALI HASSAN" class="w-full bg-surface-container py-3 px-4 rounded-xl text-right mt-1 text-sm uppercase outline-none focus:ring-1 focus:ring-primary/40 text-on-surface" />
        </div>

        <div class="flex gap-4">
            <div class="flex-1">
                <label for="cardExp" class="text-[10px] text-on-surface-variant font-bold">انتهاء (MMYY)</label>
                <input id="cardExp" bind:value={newCardExp} placeholder="1229" class="w-full bg-surface-container py-3 px-4 rounded-xl text-right mt-1 text-sm outline-none focus:ring-1 focus:ring-primary/40 text-on-surface" />
            </div>
            <div class="flex-[0.5]">
                <label for="cardCve" class="text-[10px] text-on-surface-variant font-bold">CVE</label>
                <input id="cardCve" bind:value={newCardCve} type="password" placeholder="***" class="w-full bg-surface-container py-3 px-4 rounded-xl text-right mt-1 text-sm outline-none focus:ring-1 focus:ring-primary/40 text-on-surface" />
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
                <span>تأكيد החجز</span>
                <span class="material-symbols-outlined text-xl">arrow_back</span>
            {/if}
        </button>
    </div>
</div>