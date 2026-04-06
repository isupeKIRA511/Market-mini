<script context="module" lang="ts">
  declare var my: any;
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { currentRoute } from '../lib/stores/navigationStore';
  import { serverToken } from '../lib/stores/authStore';
  import { get } from 'svelte/store';
  import { bookingStore } from '../lib/stores/bookingStore';
  import { postData } from '../lib/api';

  let selectedMethod = 'card';
  let loading = false;
  let savedCardsCount = 0;

  onMount(async () => {
    try {
      // إذا كان عندك إند بوينت لجلب البطاقات، ممكن تربطه هنا باستخدام getData
      // حالياً تركته بدون تغيير جذري حسب طلبك
      savedCardsCount = 0;
    } catch {
      savedCardsCount = 0;
    }
  });

  async function handleCompleteSelection() {
    loading = true;
    const token = get(serverToken);
    
    // جلب بيانات الحجز المخزنة
    const bookingData = get(bookingStore);
    
    // تجهيز البيانات للإرسال للدوت نت
    const payload = {
        ...bookingData,
        paymentMethod: selectedMethod,
        totalAmount: 65000 // هاردكود مثل ما أنت مسوي بالتصميم
    };

    try {
        // إرسال البيانات للدوت نت لحفظ الحجز الفعلي
        // غير المسار إذا كان يختلف عندك بالباك إند
        const response = await postData('/api/bookings/pay', payload);
        
        alert("تم الدفع وتسجيل الحجز بنجاح");
        
        // تحديث الستور برقم الحجز الراجع من السيرفر حتى الواجهة اللي وراها تسحبه
        if(response && response.bookingId) {
             bookingStore.update(b => ({ ...b, bookingId: response.bookingId }));
        }

        currentRoute.set('booking-status');
    } catch (error) {
        console.error("فشل إرسال الحجز:", error);
        alert("فشلت عملية الدفع أو الاتصال بالسيرفر");
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
            <span class="text-[10px] font-medium text-on-surface">الدفع</span>
        </div>
    </div>

    <section class="w-full bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-outline-variant/10 text-right relative overflow-hidden">
         <div class="absolute -left-12 -top-12 w-32 h-32 bg-primary-container/20 rounded-full blur-[40px] pointer-events-none"></div>

         <div class="flex justify-between flex-row-reverse items-center mb-2">
              <h2 class="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full inline-flex">إجمالي التكلفة</h2>
              <span class="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold px-2 py-1 rounded-full">يتضمن الضرائب</span>
         </div>
         <div class="mt-4 flex flex-col gap-1 items-end">
             <div class="flex flex-row-reverse items-end justify-start gap-1">
                 <span class="text-4xl font-black text-on-surface tracking-tight" dir="ltr">65,000</span>
                 <span class="text-on-surface-variant font-bold mb-1">د.ع</span>
             </div>
             <p class="text-xs text-on-surface-variant font-medium opacity-80 mt-1">ما يعادل $45 دولار تقريباً</p>
         </div>
         
         <div class="mt-6 flex flex-row-reverse gap-3 pt-6 border-t border-outline-variant/10">
              <div class="flex-1">
                  <span class="block text-[10px] text-on-surface-variant mb-1">نوع السيارة</span>
                  <span class="block text-sm font-bold">في آي بي (VIP)</span>
              </div>
              <div class="w-[1px] bg-outline-variant/20"></div>
              <div class="flex-1">
                  <span class="block text-[10px] text-on-surface-variant mb-1">المسار</span>
                  <span class="block text-sm font-bold">المطار ➝ الفندق</span>
              </div>
         </div>
    </section>

    <section class="w-full">
         <h2 class="text-lg font-bold mb-4 text-right px-1">طريقة الدفع</h2>
         <div class="grid grid-cols-1 gap-3">
             <button on:click={() => selectedMethod = 'card'} class="relative w-full text-right overflow-hidden {selectedMethod === 'card' ? 'bg-surface-container-lowest ring-2 ring-primary-container shadow-md' : 'bg-surface-container-low hover:bg-surface-container'} rounded-2xl p-4 transition-all duration-300 active:scale-[0.98]">
                 <div class="flex flex-row-reverse items-center justify-between">
                     <div class="flex flex-row-reverse items-center gap-4">
                         <div class="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center shrink-0">
                              <span class="material-symbols-outlined text-on-surface-variant font-black" style="font-variation-settings: 'FILL' 1;">credit_card</span>
                         </div>
                         <div>
                             <h3 class="text-sm font-bold text-on-surface mb-0.5">البطاقة الائتمانية</h3>
                             <p class="text-[10px] font-bold text-on-surface-variant">ماستركارد، فيزا{#if savedCardsCount > 0} · {savedCardsCount} محفوظة{/if}</p>
                         </div>
                     </div>
                     {#if selectedMethod === 'card'}
                         <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <span class="material-symbols-outlined text-[14px] text-on-primary" style="font-variation-settings: 'FILL' 1;">check</span>
                         </div>
                     {:else}
                         <div class="w-6 h-6 rounded-full border-2 border-outline-variant shrink-0"></div>
                     {/if}
                 </div>
             </button>

             <button on:click={() => selectedMethod = 'cash'} class="relative w-full text-right overflow-hidden {selectedMethod === 'cash' ? 'bg-surface-container-lowest ring-2 ring-primary-container shadow-md' : 'bg-surface-container-low hover:bg-surface-container'} rounded-2xl p-4 transition-all duration-300 active:scale-[0.98]">
                 <div class="flex flex-row-reverse items-center justify-between">
                     <div class="flex flex-row-reverse items-center gap-4">
                         <div class="w-10 h-10 bg-[#e0f7fa] rounded-xl flex items-center justify-center shrink-0">
                              <span class="material-symbols-outlined text-[#00838f] font-black" style="font-variation-settings: 'FILL' 1;">payments</span>
                         </div>
                         <div>
                             <h3 class="text-sm font-bold text-on-surface mb-0.5">نقداً للسائق</h3>
                             <p class="text-[10px] font-bold text-on-surface-variant">الدفع عند الوصول</p>
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
         </div>
    </section>

    <section class="w-full bg-surface-container-low p-5 rounded-[24px] border border-outline-variant/5">
        <h2 class="text-[11px] font-bold mb-3 text-right text-on-surface-variant">هل لديك كود خصم؟</h2>
        <div class="flex flex-row-reverse gap-2">
            <input type="text" placeholder="أدخل الكود هنا" class="flex-1 bg-surface-container-lowest border-none outline-none rounded-xl py-3 px-4 text-xs text-right focus:ring-1 focus:ring-primary/40 transition-all placeholder:opacity-50" />
            <button class="bg-primary text-[#1D1B1C] font-black text-[10px] px-5 py-3 rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all">تفعيل</button>
        </div>
    </section>
    
    <div class="pt-2 w-full">
        <button disabled={loading} on:click={handleCompleteSelection} class="w-full btn-premium py-4 {loading ? 'opacity-50 grayscale cursor-not-allowed' : ''}">
            {#if loading}
                <span class="material-symbols-outlined animate-spin text-[24px]">autorenew</span>
            {:else}
                <span>تأكيد ودفع</span>
                <span class="material-symbols-outlined text-xl">arrow_back</span>
            {/if}
        </button>
    </div>
</div>