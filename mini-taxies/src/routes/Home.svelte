<script lang="ts">
    import { get } from 'svelte/store';
    import { currentRoute } from '../lib/stores/navigationStore';
    import { bookingStore } from '../lib/stores/bookingStore';
    import { serverToken, userData } from '../lib/stores/authStore';
    import { onMount } from 'svelte';
    import { updateName } from '../lib/stores/authStore';
    import { getCustomerMyAccount } from '../lib/api/marketplaceV1';
    import VipCarGraphic from '../lib/components/VipCarGraphic.svelte';

    async function loadLatestName() {
        if (!get(serverToken)) return;

        try {
            const res: any = await getCustomerMyAccount();
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

    function navigateToIntercity() {
        bookingStore.update(b => ({ ...b, serviceType: 'Inter-city' }));
        currentRoute.set('marketplace');
    }

    const homeBanners = [
        {
            subtitle: 'خدمة VIP للمسافرين',
            title: 'استقبال راقي ومباشر من صالة المطار',
            icon: 'airport_shuttle',
            action: 'احجز VIP الآن',
            route: 'From Airport',
            bgClass: 'bg-gradient-to-br from-[#121217] via-[#1D1B1C] to-[#2A272A] border-white/15 text-white',
            glowClass: 'bg-primary/25',
            subTitleClass: 'text-primary',
            titleClass: 'text-white',
            iconBoxClass: 'bg-white/10 border-white/15 text-primary',
            btnClass: 'bg-primary text-on-primary',
        },
        {
            subtitle: 'رحلات بين المحافظات',
            title: 'سفر آمن وسريع بين جميع مدن العراق',
            icon: 'route',
            action: 'استكشف العروض',
            route: 'marketplace',
            bgClass: 'bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#10B981] border-[#34D399]/30 text-white',
            glowClass: 'bg-white/20',
            subTitleClass: 'text-[#A7F3D0]',
            titleClass: 'text-white',
            iconBoxClass: 'bg-white/15 border-white/20 text-white',
            btnClass: 'bg-white text-[#064E3B]',
        },
        {
            subtitle: 'خصم خاص 20%',
            title: 'احصل على خصم بقيمة 20% بكود AIRPORT20',
            icon: 'local_activity',
            action: 'استخدم الخصم',
            route: 'From Airport',
            bgClass: 'bg-gradient-to-br from-[#B45309] via-[#D97706] to-[#FAC445] border-white/20 text-white',
            glowClass: 'bg-white/30',
            subTitleClass: 'text-[#FEF3C7]',
            titleClass: 'text-white',
            iconBoxClass: 'bg-black/20 border-white/20 text-white',
            btnClass: 'bg-[#1D1B1C] text-white',
        },
        {
            subtitle: 'سائقون معتمدون 100%',
            title: 'قيّم رحلتك وشاركنا تجربتك لخدمة أفضل',
            icon: 'verified',
            action: 'عرض السجل',
            route: 'history',
            bgClass: 'bg-gradient-to-br from-[#312E81] via-[#4338CA] to-[#6366F1] border-white/20 text-white',
            glowClass: 'bg-white/20',
            subTitleClass: 'text-[#C7D2FE]',
            titleClass: 'text-white',
            iconBoxClass: 'bg-white/15 border-white/20 text-white',
            btnClass: 'bg-white text-[#312E81]',
        },
    ];

    function handleBannerAction(route: string) {
        if (route === 'From Airport') {
            navigateToBooking('From Airport');
            return;
        }
        if (route === 'marketplace') {
            navigateToIntercity();
            return;
        }
        if (route === 'history') {
            currentRoute.set('history');
        }
    }

    $: greetingName = $userData?.name || 'مسافر';
</script>

<div class="relative min-h-full pb-6">
    <!-- 1. Header Section -->
    <div class="relative z-10 mb-6 pt-2">
        <div class="flex justify-between items-center flex-row-reverse">
            <div class="text-right">
                <h1 class="text-[26px] font-black text-on-surface tracking-tight">{greetingName}</h1>
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
                on:click={navigateToIntercity}
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


    <!-- Banners Section -->
    <div class="mt-10 relative z-10">
        <div class="flex justify-between items-center mb-4 flex-row-reverse text-right px-1">
             <h3 class="text-base font-black text-on-surface">مختارات الرحلة</h3>
             <span class="text-primary font-bold text-[10px]">مصممة للمسافر</span>
        </div>
        
        <div class="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 -mx-5 px-5 snap-x no-scrollbar">
            {#each homeBanners as banner}
                <button
                    type="button"
                    on:click={() => handleBannerAction(banner.route)}
                    class="w-[310px] min-w-[310px] max-w-[310px] h-[160px] rounded-[28px] p-5 text-right relative overflow-hidden shadow-md shrink-0 snap-center active:scale-[0.98] transition-all duration-300 border flex flex-col justify-between cursor-pointer {banner.bgClass}"
                >
                    <!-- Background Shine & Glow -->
                    <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl pointer-events-none {banner.glowClass}"></div>
                    
                    <div class="relative z-10 flex justify-between items-start w-full gap-3" dir="rtl">
                        <div class="flex flex-col text-right max-w-[70%]">
                            <span class="text-[10px] font-black tracking-wide mb-1.5 opacity-90 {banner.subTitleClass}">{banner.subtitle}</span>
                            <h4 class="text-[16px] font-black leading-tight mb-1 {banner.titleClass}">{banner.title}</h4>
                        </div>

                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm relative {banner.iconBoxClass}">
                            {#if banner.route === 'From Airport'}
                                <div class="w-full flex justify-center">
                                    <VipCarGraphic compact />
                                </div>
                            {:else}
                                <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">{banner.icon}</span>
                            {/if}
                        </div>
                    </div>

                    <div class="relative z-10 flex justify-start mt-auto pt-2" dir="rtl">
                        <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black shadow-md transition-transform hover:scale-105 active:scale-95 {banner.btnClass}">
                            {banner.action}
                            <span class="material-symbols-outlined rotate-180 text-[14px]">arrow_back</span>
                        </span>
                    </div>
                </button>
            {/each}
        </div>
    </div>
</div>
