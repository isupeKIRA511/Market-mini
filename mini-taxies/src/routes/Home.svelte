<script lang="ts">
    import { currentRoute } from '../lib/stores/navigationStore';
    import { bookingStore } from '../lib/stores/bookingStore';
    import { onMount } from 'svelte';
    import { getData } from '../lib/api';

    function navigateToBooking(type: 'To Airport' | 'From Airport') {
        bookingStore.update(b => ({ ...b, serviceType: type }));
        currentRoute.set('booking-details');
    }

    const fallbackOffers = [
        {
            badge: 'خصم 20%',
            title: 'رحلات المطار لرجال الأعمال',
            desc: 'احجز سيارة فاخرة الآن واحصل على خصم فوري لرحلتك القادمة.',
            variant: 'gold',
        },
        {
            badge: 'مجاناً',
            title: 'توصيل أول رحلة',
            desc: 'للمشتركين الجدد، أول توصيلة مجانية بالكامل للرحلات القصيرة.',
            variant: 'dark',
        },
    ];

    let homeOffers: any[] = fallbackOffers;

    onMount(async () => {
        try {
            const data = await getData('/api/offers');
            if (data && data.length > 0) {
                homeOffers = data;
            }
        } catch {
            homeOffers = fallbackOffers;
        }
    });
</script>

<div class="flex flex-col gap-4">
    <div class="bg-primary hover:bg-primary/90 transition-all rounded-[28px] p-6 relative flex flex-col justify-between h-[160px] shadow-sm shadow-primary/20 cursor-pointer active:scale-[0.98]" on:click={() => navigateToBooking('From Airport')}>
        <div class="w-full flex flex-row-reverse justify-between items-start z-10">
             <div class="text-right flex-1">
                 <h3 class="text-[24px] font-black text-on-primary mb-0.5 tracking-tight">من المطار</h3>
                 <p class="text-on-primary/75 text-[11px] font-bold">توصيل من صالة الوصول</p>
             </div>
             
             <div class="w-12 h-12 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="drop-shadow-sm text-on-primary" fill="none" stroke-linecap="round" stroke-linejoin="round">
                   <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                   <path d="M15 12h5a2 2 0 0 1 0 4h-15l-3 -6h3l2 2h3l-2 -7h3z" transform="rotate(15 12 12) translate(0 -1)" />
                   <path d="M3 21h18" stroke-dasharray="2 2"/>
                 </svg>
             </div>
        </div>
        
        <div class="self-start relative z-10 mt-auto">
             <div class="bg-surface text-on-surface px-6 py-2.5 rounded-full font-bold text-[11px] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
                 احجز الآن
             </div>
        </div>
    </div>

    <div class="bg-surface-container-lowest hover:bg-surface-container-low transition-all rounded-[24px] p-4 text-right flex flex-row items-center justify-between h-24 border border-outline-variant/10 shadow-sm cursor-pointer active:scale-[0.98]" on:click={() => navigateToBooking('To Airport')}>
         <div class="flex flex-row-reverse items-center gap-4">
             <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2.5" stroke="#3B82F6" class="drop-shadow-sm" fill="none" stroke-linecap="round" stroke-linejoin="round">
                   <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                   <path d="M15 12h5a2 2 0 0 1 0 4h-15l-3 -6h3l2 2h3l-2 -7h3z" transform="rotate(-15 12 12) translate(0 -1)" />
                   <path d="M3 21h18" stroke-dasharray="2 2"/>
                 </svg>
             </div>
             
             <div class="text-right">
                 <h3 class="text-[17px] font-black text-on-surface mb-0.5 tracking-tight mt-1">إلى المطار</h3>
                 <p class="text-on-surface-variant text-[10px] font-bold">حجز رحلة مغادرة مريحة</p>
             </div>
         </div>
         
         <div class="w-8 h-8 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-full flex items-center justify-center shrink-0">
             <span class="material-symbols-outlined text-[15px] text-on-surface-variant font-black">arrow_back_ios_new</span>
         </div>
    </div>

    <div class="bg-surface-container-lowest hover:bg-surface-container-low transition-all rounded-[24px] p-4 text-right flex flex-row items-center justify-between h-24 border border-outline-variant/10 shadow-sm cursor-pointer active:scale-[0.98]" on:click={() => currentRoute.set('marketplace')}>
         <div class="flex flex-row-reverse items-center gap-4">
             <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 border border-green-100 shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2.5" stroke="#10B981" class="drop-shadow-sm" fill="none" stroke-linecap="round" stroke-linejoin="round">
                   <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                   <circle cx="7" cy="17" r="2" />
                   <circle cx="17" cy="17" r="2" />
                   <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                 </svg>
             </div>
             
             <div class="text-right">
                 <h3 class="text-[17px] font-black text-on-surface mb-0.5 tracking-tight mt-1">بين المحافظات</h3>
                 <p class="text-on-surface-variant text-[10px] font-bold">سفر آمن للمسافات البعيدة</p>
             </div>
         </div>
         
         <div class="w-8 h-8 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-full flex items-center justify-center shrink-0">
             <span class="material-symbols-outlined text-[15px] text-on-surface-variant font-black">arrow_back_ios_new</span>
         </div>
    </div>
</div>

<div class="mt-8">
    <div class="flex justify-between items-center mb-4 text-right flex-row-reverse px-1">
         <h3 class="text-lg font-black text-on-surface">العروض الحصرية</h3>
         <button class="text-primary font-bold text-xs hover:underline">عرض الكل</button>
    </div>
    
    <div class="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 -mx-5 px-5 snap-x no-scrollbar">
        {#each homeOffers as offer}
            {#if offer.variant === 'gold'}
                <div class="min-w-[270px] bg-gradient-to-l from-primary-container to-[#fde08b] rounded-[24px] p-5 text-right relative overflow-hidden shadow-sm shrink-0 snap-center cursor-pointer active:scale-[0.98] transition-transform">
                    <div class="absolute -left-12 -top-12 w-32 h-32 bg-white/40 rounded-full blur-[40px] pointer-events-none"></div>

                    <div class="relative z-10 w-full text-right" dir="rtl">
                        <span class="bg-white text-[#312B1B] text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block shadow-sm">{offer.badge}</span>
                        <h4 class="text-[15px] font-black text-[#312B1B] mb-1">{offer.title}</h4>
                        <p class="text-[#312B1B]/80 text-[10px] font-bold leading-relaxed w-11/12 float-right">{offer.desc}</p>
                    </div>
                </div>
            {:else}
                <div class="min-w-[270px] bg-gradient-to-l from-[#1D1B1C] to-[#383637] rounded-[24px] p-5 text-right relative overflow-hidden shadow-sm shrink-0 snap-center cursor-pointer active:scale-[0.98] transition-transform">
                    <div class="absolute -left-12 -top-12 w-32 h-32 bg-primary/20 rounded-full blur-[30px] pointer-events-none"></div>

                    <div class="relative z-10 w-full text-white text-right" dir="rtl">
                        <span class="bg-primary text-[#1D1B1C] text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block shadow-sm">{offer.badge}</span>
                        <h4 class="text-[15px] font-black text-white mb-1">{offer.title}</h4>
                        <p class="text-white/70 text-[10px] font-medium leading-relaxed w-11/12 float-right">{offer.desc}</p>
                    </div>
                </div>
            {/if}
        {/each}
    </div>
</div>