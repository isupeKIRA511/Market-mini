<script lang="ts">
    import { currentRoute } from '../lib/stores/navigationStore';
    import FilterAndSort from '../lib/components/FilterAndSort.svelte';
    import { searchQuery, carType, passengersFilter, luggageFilter, sortBy } from '../lib/stores/filterStore';
    import { onMount } from 'svelte';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import { getData } from '../lib/api';
    import type { DriverCardUi } from '../lib/types/marketplaceUi';

    let map: L.Map;
    let marker: L.Marker;

    const govCoords: Record<string, [number, number]> = {
        'بغداد': [33.3128, 44.3615],
        'البصرة': [30.5081, 47.7835],
        'نينوى': [36.3489, 43.1577],
        'أربيل': [36.1901, 44.0094],
        'النجف': [32.0259, 44.3463],
        'ذي قار': [31.0581, 46.2574],
        'كركوك': [35.4681, 44.3922],
        'الأنبار': [33.4354, 43.2982],
        'ديالى': [33.8245, 44.8213],
        'المثنى': [31.3283, 45.2848],
        'القادسية': [31.9904, 44.9312],
        'ميسان': [31.8415, 47.1456],
        'واسط': [32.5058, 45.8203],
        'صلاح الدين': [34.6067, 43.6667],
        'دهوك': [36.8665, 42.9882],
        'السليمانية': [35.5617, 45.4197],
        'بابل': [32.4633, 44.4208],
        'كربلاء': [32.6160, 44.0249]
    };

    function initMap() {
        if (!map) {
            map = L.map('pickup-map').setView([33.3128, 44.3615], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);
        }
    }

    function updateMap(gov: string) {
        if (!gov) return;
        const coords = govCoords[gov];
        if (coords && map) {
            map.setView(coords, 12);
            if (marker) {
                marker.setLatLng(coords);
            } else {
                marker = L.marker(coords).addTo(map);
            }
        }
    }

    $: if (fromGov) {
        setTimeout(() => {
            initMap();
            updateMap(fromGov);
        }, 10);
    }

    let fromGov = '';
    let toGov = '';
    const governorates = [
        'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'ذي قار', 'كركوك', 
        'الأنبار', 'ديالى', 'المثنى', 'القادسية', 'ميسان', 'واسط', 
        'صلاح الدين', 'دهوك', 'السليمانية', 'بابل', 'كربلاء'
    ];

    let listLoading = true;
    let listError = '';
    let sourceDrivers: DriverCardUi[] = [];
    let promoTitle = '';
    let promoSubtitle = '';
    let promoCode = 'AIRPORT20';
    let promoLoaded = false;

    async function loadMarketplaceData() {
        listLoading = true;
        listError = '';
        try {
            const [carsRaw, bannersRaw] = await Promise.all([
                getData('/api/cars'),
                getData('/api/banners').catch(() => null),
            ]);
            
            sourceDrivers = carsRaw || [];
            
            const banners = bannersRaw || [];
            const first = banners[0];
            if (first) {
                promoTitle = String(first.title ?? first.Title ?? first.name ?? first.Name ?? '');
                promoSubtitle = String(
                    first.description ?? first.Description ?? first.subtitle ?? first.Subtitle ?? ''
                );
                const code = first.code ?? first.Code ?? first.promoCode ?? first.PromoCode;
                if (code != null && String(code).trim()) promoCode = String(code).trim();
                promoLoaded = !!(promoTitle || promoSubtitle);
            }
        } catch (e) {
            listError = e instanceof Error ? e.message : 'تعذّر تحميل المركبات';
            sourceDrivers = [];
        } finally {
            listLoading = false;
        }
    }

    onMount(() => {
        loadMarketplaceData();
    });

    $: filtered = sourceDrivers.filter(c => {
        const matchSearch = $searchQuery === '' || c.name.includes($searchQuery) || c.car.includes($searchQuery);
        const matchCar = $carType === 'الكل' || c.carTypes.includes($carType);
        const matchPass = $passengersFilter === 'الكل' || $passengersFilter === '' || c.passengers.includes($passengersFilter);
        const matchLuggage = $luggageFilter === 'الكل' || $luggageFilter === '' || c.luggage.includes($luggageFilter);
        return matchSearch && matchCar && matchPass && matchLuggage;
    });

    $: filteredAndSorted = [...filtered].sort((a, b) => {
        if ($sortBy === 'الأعلى تقييماً') return b.rating - a.rating;
        if ($sortBy === 'الأكثر تفاعلاً') return b.interactions - a.interactions;
        if ($sortBy === 'ذوي الاحتياجات الخاصة (همم)') return (b.hasHemam ? 1 : 0) - (a.hasHemam ? 1 : 0);
        return 0;
    });

    function handleBookAction(route: any) {
        if (!fromGov || !toGov) {
            alert('يرجى اختيار المحافظة (مكان الانطلاق والوجهة) للمتابعة.');
            return;
        }
        currentRoute.set(route);
    }
</script>

<div class="space-y-6">
    {#if listError}
        <div class="rounded-[1.5rem] border border-error/25 bg-error-container/50 text-on-error-container text-[11px] font-bold p-4 text-right" role="alert">
            {listError}
        </div>
    {/if}
    
    <section>
        <FilterAndSort />
    </section>

    <section class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 text-right">
        <h2 class="text-base font-bold mb-4 flex items-center justify-end gap-2 text-on-surface">
            حدد مسار الرحلة
            <span class="material-symbols-outlined text-primary text-xl">route</span>
        </h2>
        
        <div class="flex flex-col gap-3">
            <div class="relative w-full">
                <select bind:value={fromGov} dir="rtl" class="appearance-none w-full bg-surface-container-low outline-none border-none rounded-2xl py-3 px-4 pr-10 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold border-r-[4px] border-r-primary">
                    <option value="" disabled selected hidden>نقطة الانطلاق (المحافظة)</option>
                    {#each governorates as gov}
                        <option value={gov}>{gov}</option>
                    {/each}
                </select>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">my_location</span>
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>

            {#if fromGov}
            <div class="w-full h-48 bg-surface-container rounded-2xl relative overflow-hidden border border-outline-variant/10 animate-fade-in shadow-inner">
                <div id="pickup-map" class="w-full h-full z-0"></div>
                <div class="absolute bottom-3 left-3 z-[1000] pointer-events-none">
                    <span class="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[11px] font-bold shadow-md border border-outline-variant/20 text-[#1D1B1C]">{fromGov}</span>
                </div>
            </div>
            {/if}
            
            <div class="flex justify-center -my-1 opacity-50 z-10 w-full relative h-4">
                <div class="absolute inset-x-0 top-1/2 h-[1px] bg-outline-variant/20 -z-10"></div>
                <div class="w-8 h-8 bg-surface-container-highest rounded-full flex items-center justify-center border-4 border-surface-container-lowest shadow-sm -mt-2">
                    <span class="material-symbols-outlined text-sm text-on-surface">arrow_downward</span>
                </div>
            </div>

            <div class="relative w-full">
                <select bind:value={toGov} dir="rtl" class="appearance-none w-full bg-surface-container-low outline-none border-none rounded-2xl py-3 px-4 pr-10 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold border-r-[4px] border-r-primary">
                    <option value="" disabled selected hidden>الوجهة (المحافظة)</option>
                    {#each governorates as gov}
                        <option value={gov}>{gov}</option>
                    {/each}
                </select>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">location_on</span>
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
        </div>
    </section>

    <div class="flex flex-col gap-4 relative">
        {#if listLoading}
            <div class="text-center py-10 text-on-surface-variant font-bold bg-surface-container-low rounded-[2rem]">
                <span class="material-symbols-outlined text-4xl mb-4 block opacity-50 animate-pulse">directions_car</span>
                جاري تحميل المركبات…
            </div>
        {:else if filteredAndSorted.length === 0}
            <div class="text-center py-10 text-on-surface-variant font-bold bg-surface-container-low rounded-[2rem]">
                <span class="material-symbols-outlined text-4xl mb-4 block opacity-50">search_off</span>
                لا يوجد سائقين متاحين حالياً.
            </div>
        {/if}
        {#each filteredAndSorted as driver (driver.id)}
            {#if driver.type === 'featured'}
                <div class="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group border border-outline-variant/10">
                    <div class="flex flex-col h-full justify-between relative z-10">
                        <div class="flex justify-between items-start mb-6">
                            <div class="flex items-center gap-4 text-right">
                                <div class="w-16 h-16 shrink-0 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                                     <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings: 'FILL' 1;">{driver.icon}</span>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-on-surface">{driver.name}</h3>
                                    <div class="flex items-center gap-1 text-primary">
                                        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                                        <span class="font-bold text-sm">{driver.rating}</span>
                                        <span class="text-on-surface-variant text-xs font-normal mr-1">({driver.reviews} تقييم)</span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-left">
                                <span class="text-primary font-black text-lg">{driver.price}</span>
                                <p class="text-[10px] text-on-surface-variant">سعر تقريبي</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-4 mb-6">
                             <span class="bg-primary-container/20 text-on-primary-container px-3 py-1 rounded-full text-xs font-bold tracking-widest whitespace-nowrap">{driver.badge}</span>
                             <div class="flex flex-col text-right w-full">
                                <span class="text-on-surface-variant text-[10px] mb-1">نوع السيارة</span>
                                <span class="font-bold text-sm">{driver.car}</span>
                            </div>
                        </div>

                        <div class="flex gap-2 w-full">
                            <button on:click={() => handleBookAction('select-car')} class="flex-1 bg-primary text-white px-4 py-3 text-sm rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform {(!fromGov || !toGov) ? 'opacity-50 grayscale' : ''}">احجز الآن</button>
                            <button class="flex-1 bg-primary/10 text-primary border border-primary/20 px-4 py-3 text-sm rounded-xl font-bold transition-all hover:bg-primary hover:text-white">التفاصيل</button>
                        </div>
                    </div>
                </div>

            {:else if driver.type === 'small'}
                <div class="bg-surface-container-low rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300">
                    <div>
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                                <span class="font-bold text-sm">{driver.rating}</span>
                            </div>
                            <div class="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shadow-sm">
                                <span class="material-symbols-outlined text-primary text-lg">{driver.icon}</span>
                            </div>
                        </div>
                        <h3 class="text-lg font-bold text-on-surface mb-1 text-right">{driver.name}</h3>
                        <p class="text-on-surface-variant text-xs mb-1 text-right leading-relaxed font-bold">{driver.car}</p>
                        <p class="text-on-surface-variant text-[10px] mb-4 text-right leading-relaxed">{driver.description}</p>
                    </div>
                    <div class="flex flex-col gap-3">
                        <div class="flex justify-between text-xs border-b border-outline-variant/10 pb-2">
                            <span class="font-black text-primary">{driver.price}</span>
                            <span class="text-on-surface-variant">السعر</span>
                        </div>
                        <button class="w-full bg-primary/10 text-primary border border-primary/20 py-3 text-sm rounded-xl font-bold hover:bg-primary hover:text-white transition-all">معاينة</button>
                    </div>
                </div>

            {:else if driver.type === 'simple'}
                <button on:click={() => handleBookAction('select-car')} class="bg-surface-container-lowest rounded-[1.5rem] p-4 flex items-center gap-4 transition-all duration-300 active:scale-95 border border-outline-variant/10 {(!fromGov || !toGov) ? 'opacity-50 grayscale' : ''}">
                    <div class="w-16 h-16 shrink-0 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-2xl">{driver.icon}</span>
                    </div>
                    <div class="flex-grow text-right">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-primary font-bold text-sm">{driver.rating}</span>
                            <h3 class="text-[15px] font-bold text-on-surface">{driver.name}</h3>
                        </div>
                        <div class="flex flex-row justify-start gap-4 text-[10px] text-on-surface-variant">
                            <span class="font-bold">{driver.car}</span>
                            <span class="font-bold text-primary">{driver.price}</span>
                        </div>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined rotate-180 text-xl text-primary">arrow_back</span>
                    </div>
                </button>
            {/if}
        {/each}
    </div>

    <section class="rounded-[2rem] bg-[#1D1B1C] p-6 relative overflow-hidden text-white mt-4">
        <div class="relative z-10 w-full text-right">
            <span class="text-[#FAC445] font-black uppercase text-[10px] mb-2 block">عرض خاص للمسافرين</span>
            <h2 class="text-lg font-bold mb-2">{promoLoaded && promoTitle ? promoTitle : 'احجز رحلتك القادمة واحصل على خصم 20%'}</h2>
            <p class="text-white/60 text-xs mb-4">
                {#if promoLoaded && promoSubtitle}
                    {promoSubtitle}
                {:else}
                    استخدم الكود <span class="text-[#FAC445] font-bold">{promoCode}</span> عند الحجز
                {/if}
            </p>
            <button class="bg-white text-[#1D1B1C] w-full py-3 text-sm rounded-xl font-bold active:scale-95 transition-transform">اكتشف العروض</button>
        </div>
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
    </section>
</div>