<script lang="ts">
    import { get } from 'svelte/store';
    import { currentRoute } from '../lib/stores/navigationStore';
    import { bookingStore } from '../lib/stores/bookingStore';
    import { userData } from '../lib/stores/authStore';
    import { theme } from '../lib/stores/settingsStore';
    import { toast } from '../lib/stores/toastStore';
    import { onMount } from 'svelte';
    import { userId, updateName } from '../lib/stores/authStore';
    import { getCustomerSingle } from '../lib/api/marketplaceV1';

    let showSettings = false;

    async function loadLatestName() {
        const id = get(userId);
        if (!id) return;
        try {
            const res: any = await getCustomerSingle(id);
            const rec = res?.data || res;
            if (rec) {
                const fetchedName = rec.fullName || rec.FullName || rec.name;
                const currentName = get(userData)?.name;
                if (fetchedName && fetchedName !== currentName) {
                    updateName(fetchedName);
                }
            }
        } catch (e) {
            console.error('Failed to sync profile name on home:', e);
        }
    }

    onMount(() => {
        loadLatestName();
    });

    function navigateToBooking(type: 'To Airport' | 'From Airport') {
        bookingStore.update(b => ({ ...b, serviceType: type }));
        currentRoute.set('booking-details');
    }

    const homeOffers = [
        {
            badge: 'خصم 20%',
            title: 'رحلات المطار لرجال الأعمال',
            desc: 'احجز سيارة فاخرة الآن واحصل على خصم فوري لرحلتك القادمة.',
            variant: 'gold',
        },
        {
            badge: 'مجاناً',
            title: 'توصيل أول رحلة',
            desc: 'للمشتركين الجدد، أول رحلة مجانية تماماً.',
        }
    ];

    $: greetingName = $userData?.name || 'مسافر';
</script>

<div class="relative min-h-full pb-6">
    <!-- Abstract Dynamic Background (Map feel) -->
    <div class="absolute inset-x-[-20px] top-[-100px] h-64 opacity-[0.03] pointer-events-none z-0 overflow-hidden" dir="ltr">
        <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50H800M0 150H800M0 250H800M0 350H800M100 0V400M300 0V400M500 0V400M700 0V400" stroke="currentColor" stroke-width="2"/>
            <circle cx="200" cy="200" r="100" stroke="currentColor" stroke-width="2"/>
            <circle cx="600" cy="100" r="50" stroke="currentColor" stroke-width="2"/>
        </svg>
    </div>

    <!-- 1. Header Section -->
    <div class="relative z-10 mb-10 pt-2">
        <div class="flex justify-between items-center flex-row-reverse">
            <div class="text-right">
                <h1 class="text-[26px] font-black text-on-surface tracking-tight">أهلاً بك، {greetingName}</h1>
                <p class="text-on-surface-variant text-[12px] font-bold mt-1">أين تود الذهاب اليوم؟</p>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-surface-container-high border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-sm">
                <span class="material-symbols-outlined text-primary text-[32px]" style="font-variation-settings: 'FILL' 1;">person</span>
            </div>
        </div>
    </div>

    <!-- Main Services -->
    <div class="relative z-10 space-y-5">
        <button
            type="button"
            class="w-full text-right border-0 bg-primary hover:bg-primary/90 transition-all rounded-[28px] p-6 relative flex flex-col justify-between h-[160px] shadow-sm shadow-primary/20 cursor-pointer active:scale-[0.98]"
            on:click={() => navigateToBooking('From Airport')}
        >
            <div class="w-full flex flex-row-reverse justify-between items-start z-10">
                 <div class="flex flex-row-reverse items-center gap-4">
                     <div class="w-12 h-12 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                         <span class="material-symbols-outlined text-on-primary text-3xl" style="font-variation-settings: 'FILL' 1;">flight_land</span>
                     </div>
                     <div class="text-right">
                         <h3 class="text-[24px] font-black text-on-primary mb-0.5 tracking-tight">من المطار</h3>
                         <p class="text-on-primary/75 text-[11px] font-bold">توصيل من صالة الوصول</p>
                     </div>
                 </div>
            </div>
            <div class="self-start relative z-10 mt-auto">
                 <div class="bg-surface text-on-surface px-6 py-2.5 rounded-full font-bold text-[11px] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
                     احجز الآن
                 </div>
            </div>
        </button>

        <div class="grid grid-cols-2 gap-4">
            <button
                type="button"
                class="bg-surface-container-lowest hover:bg-surface-container-low transition-all rounded-[26px] p-5 text-right items-end flex flex-col justify-between h-40 border border-outline-variant/10 shadow-sm cursor-pointer active:scale-[0.98]"
                on:click={() => navigateToBooking('To Airport')}
            >
                <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 mb-4">
                    <span class="material-symbols-outlined text-[#3B82F6] text-3xl" style="font-variation-settings: 'FILL' 1;">flight_takeoff</span>
                </div>
                <div>
                    <h3 class="text-[17px] font-black text-on-surface mb-0.5 tracking-tight">إلى المطار</h3>
                    <p class="text-on-surface-variant text-[10px] font-bold">حجز رحلة مغادرة</p>
                </div>
            </button>

            <button
                type="button"
                class="bg-surface-container-lowest hover:bg-surface-container-low transition-all rounded-[26px] p-5 text-right items-end flex flex-col justify-between h-40 border border-outline-variant/10 shadow-sm cursor-pointer active:scale-[0.98]"
                on:click={() => currentRoute.set('marketplace')}
            >
                <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 border border-green-100 mb-4">
                    <span class="material-symbols-outlined text-[#10B981] text-3xl" style="font-variation-settings: 'FILL' 1;">distance</span>
                </div>
                <div>
                    <h3 class="text-[17px] font-black text-on-surface mb-0.5 tracking-tight">بين المحافظات</h3>
                    <p class="text-on-surface-variant text-[10px] font-bold">سفر آمن للمسافات</p>
                </div>
            </button>
        </div>
    </div>


    <!-- Offers Section -->
    <div class="mt-10 relative z-10">
        <div class="flex justify-between items-center mb-4 flex-row-reverse text-right px-1">
             <h3 class="text-base font-black text-on-surface">العروض الحصرية</h3>
             <button class="text-primary font-bold text-[10px] hover:underline">عرض الكل</button>
        </div>
        
        <div class="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 -mx-5 px-5 snap-x no-scrollbar">
            {#each homeOffers as offer}
                <div class="min-w-[260px] {offer.variant === 'gold' ? 'bg-gradient-to-l from-primary-container to-[#fde08b]' : 'bg-gradient-to-l from-[#1D1B1C] to-[#383637]'} rounded-[24px] p-5 text-right relative overflow-hidden shadow-sm shrink-0 snap-center cursor-pointer active:scale-[0.98] transition-transform">
                    <div class="absolute -left-8 -top-8 w-24 h-24 {offer.variant === 'gold' ? 'bg-white/40' : 'bg-primary/20'} rounded-full blur-[30px] pointer-events-none"></div>
                    <div class="relative z-10 w-full {offer.variant === 'gold' ? 'text-[#312B1B]' : 'text-white'}" dir="rtl">
                        <span class="{offer.variant === 'gold' ? 'bg-white text-[#312B1B]' : 'bg-primary text-[#1D1B1C]'} text-[9px] font-black px-3 py-1 rounded-full mb-3 inline-block shadow-sm">{offer.badge}</span>
                        <h4 class="text-[14px] font-black mb-1">{offer.title}</h4>
                        <p class="opacity-80 text-[10px] font-bold leading-relaxed">{offer.desc}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

