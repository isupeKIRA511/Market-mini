<script lang="ts">
    import { currentRoute } from '../lib/stores/navigationStore';
    import { bookingStore } from '../lib/stores/bookingStore';
    import { toast } from '../lib/stores/toastStore';
    import { userData } from '../lib/stores/authStore';
    import { onMount } from 'svelte';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import { apiClient } from '../lib/api/client';
    import {
        buildRideOfferSearchQueryString,
        hasTokenForRideOfferSearch,
        rideOfferSearchPath,
    } from '../lib/api/rideOfferSearch';
    import { extractRideOfferGuidFromSearchRow, isRideOfferGuid } from '../lib/api/rideOfferGuid';
    import { extractRecordArray } from '../lib/api/marketplaceResponse';
    import { expandProvinceSearchVariants } from '../lib/data/govNameVariants';
    import { governorates, govCoords } from '../lib/data/governorates';
    import type { DriverCardUi } from '../lib/types/marketplaceUi';
    import AppAlert from '../lib/components/AppAlert.svelte';
    import DriverOfferDetails from '../lib/components/DriverOfferDetails.svelte';
    import { calculateMapDynamicPrice } from '../lib/booking/display';

    let map: L.Map | null = null;
    let fromMarker: L.Marker | null = null;
    let toMarker: L.Marker | null = null;
    let routeLine: L.Polyline | null = null;

    let isLocating = false;
    let customPickupLat: number | null = null;
    let customPickupLng: number | null = null;

    function findNearestGovernorate(lat: number, lng: number): string {
        let minDistance = Infinity;
        let nearestGov = 'بغداد';
        for (const [gov, coords] of Object.entries(govCoords)) {
            if (governorates.includes(gov as any)) {
                const dist = Math.hypot(coords[0] - lat, coords[1] - lng);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestGov = gov;
                }
            }
        }
        return nearestGov;
    }

    function locateCurrentPosition() {
        if (!navigator.geolocation) {
            toast.warning('جهازك لا يدعم الخدمة لتحديد الموقع الفعلي');
            return;
        }
        isLocating = true;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                isLocating = false;
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                customPickupLat = lat;
                customPickupLng = lng;

                const nearest = findNearestGovernorate(lat, lng);
                fromGov = nearest;

                if (map) {
                    map.setView([lat, lng], 13);
                    if (fromMarker) {
                        fromMarker.setLatLng([lat, lng]);
                    } else {
                        updateMapRoute();
                    }
                }
                toast.success(`تم تحديد موقعك الفعلي بنجاح (${nearest}) 🎯`);
            },
            (err) => {
                isLocating = false;
                toast.warning('تعذر تحديد الموقع الفعلي. يرجى تفعيل أذونات الموقع للجهاز.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }

    function initMap() {
        const container = document.getElementById('pickup-map');
        if (!container) return;
        if (!map) {
            const initialCoords: [number, number] =
                customPickupLat && customPickupLng
                    ? [customPickupLat, customPickupLng]
                    : fromGov && govCoords[fromGov]
                    ? govCoords[fromGov]
                    : [33.3128, 44.3615];

            map = L.map('pickup-map', {
                zoomControl: true,
                attributionControl: false,
            }).setView(initialCoords, 9);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                subdomains: ['a', 'b', 'c'],
            }).addTo(map);

            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                customPickupLat = lat;
                customPickupLng = lng;
                const nearest = findNearestGovernorate(lat, lng);
                fromGov = nearest;
                updateMapRoute();
                toast.success(`تم اختيار موقع الانطلاق بالدبوس 📍`);
            });
        }
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 50);
    }

    function updateMapRoute() {
        if (!map) return;

        const fromC: [number, number] | null =
            customPickupLat && customPickupLng
                ? [customPickupLat, customPickupLng]
                : fromGov && govCoords[fromGov]
                ? govCoords[fromGov]
                : null;
        const toC = toGov ? govCoords[toGov] : null;

        const createCustomIcon = (color: string, label: string) => {
            return L.divIcon({
                className: 'custom-leaflet-marker',
                html: `
                    <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; items-center; justify-content: center; color: white; font-weight: bold; cursor: grab;">
                        <span class="material-symbols-outlined" style="font-size: 20px;">${label}</span>
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });
        };

        if (fromC) {
            if (fromMarker) {
                fromMarker.setLatLng(fromC);
            } else {
                fromMarker = L.marker(fromC, {
                    icon: createCustomIcon('#FAC445', 'my_location'),
                    draggable: true,
                })
                    .addTo(map)
                    .bindPopup(`<b>نقطة الانطلاق: ${fromGov || 'موقعك'}</b>`);

                fromMarker.on('dragend', (e: any) => {
                    const pos = e.target.getLatLng();
                    customPickupLat = pos.lat;
                    customPickupLng = pos.lng;
                    const nearest = findNearestGovernorate(pos.lat, pos.lng);
                    fromGov = nearest;
                    toast.success(`تم نقل موقع الانطلاق إلى الدبوس 📍`);
                });
            }
        } else if (fromMarker) {
            map.removeLayer(fromMarker);
            fromMarker = null;
        }

        if (toC) {
            if (toMarker) {
                toMarker.setLatLng(toC);
            } else {
                toMarker = L.marker(toC, { icon: createCustomIcon('#EF4444', 'location_on') })
                    .addTo(map)
                    .bindPopup(`<b>الوجهة: ${toGov}</b>`);
            }
        } else if (toMarker) {
            map.removeLayer(toMarker);
            toMarker = null;
        }

        if (fromC && toC) {
            const latlngs: [number, number][] = [fromC, toC];
            if (routeLine) {
                routeLine.setLatLngs(latlngs);
            } else {
                routeLine = L.polyline(latlngs, {
                    color: '#FAC445',
                    weight: 5,
                    opacity: 0.85,
                    dashArray: '8, 8',
                }).addTo(map);
            }
            const bounds = L.latLngBounds(latlngs);
            map.fitBounds(bounds, { padding: [40, 40] });
        } else {
            if (routeLine) {
                map.removeLayer(routeLine);
                routeLine = null;
            }
            if (fromC) {
                map.setView(fromC, 11);
            } else if (toC) {
                map.setView(toC, 11);
            }
        }

        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 100);
    }

    $: if (fromGov || toGov) {
        setTimeout(() => {
            initMap();
            updateMapRoute();
        }, 20);
    }

    $: if (fromGov && toGov && seatCountInt) {
        searchOffers();
    }

    let fromGov = '';
    let toGov = '';

    let listLoading = false;
    let listError = '';
    /** يُعرض إذا لم يُستخرج من أي صف GUID صالح (حقول id / rideOfferId وما شابه) */
    let listWarning = '';
    let sourceDrivers: DriverCardUi[] = [];
    let selectedDriver: DriverCardUi | null = null;

    let seatCountInt = 1;

    function parseNumericPrice(val: unknown): number | null {
        if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
            return val;
        }
        if (typeof val === 'string') {
            const cleaned = val.replace(/[^\d.]/g, '');
            if (cleaned) {
                const num = Number(cleaned);
                if (Number.isFinite(num) && num > 0) {
                    return num;
                }
            }
        }
        return null;
    }

    function extractOfferPrice(apiOffer: any): number | null {
        if (!apiOffer || typeof apiOffer !== 'object') return null;

        // 1. Direct property search for keys containing price, cost, fare, amount
        for (const [key, val] of Object.entries(apiOffer)) {
            const lowerKey = key.toLowerCase();
            if (lowerKey.includes('price') || lowerKey.includes('fare') || lowerKey.includes('cost') || lowerKey.includes('amount')) {
                const num = parseNumericPrice(val);
                if (num !== null) return num;
            }
        }

        // 2. Strict candidate keys
        const candidateKeys = [
            'price', 'Price', 'pricePerSeat', 'PricePerSeat', 'price_per_seat',
            'seatPrice', 'SeatPrice', 'seat_price', 'pricePerPassenger',
            'unitPrice', 'UnitPrice', 'offerPrice', 'OfferPrice',
            'amount', 'Amount', 'fare', 'Fare', 'cost', 'Cost'
        ];
        for (const key of candidateKeys) {
            const num = parseNumericPrice(apiOffer[key]);
            if (num !== null) return num;
        }

        // 3. Search nested objects
        const subObjects = [apiOffer.rideOffer, apiOffer.offer, apiOffer.ride, apiOffer.data, apiOffer.result];
        for (const sub of subObjects) {
            if (sub && typeof sub === 'object') {
                for (const [key, val] of Object.entries(sub)) {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey.includes('price') || lowerKey.includes('fare') || lowerKey.includes('cost') || lowerKey.includes('amount')) {
                        const num = parseNumericPrice(val);
                        if (num !== null) return num;
                    }
                }
            }
        }

        return null;
    }

    function formatDriverPrice(apiOffer: any): string {
        const extracted = extractOfferPrice(apiOffer);
        if (extracted !== null) {
            return `${extracted.toLocaleString('en-US')} د.ع`;
        }
        const fromC = fromGov ? govCoords[fromGov] : undefined;
        const toC = toGov ? govCoords[toGov] : undefined;
        if (fromC && toC) {
            const dyn = calculateMapDynamicPrice(fromC[0], fromC[1], toC[0], toC[1], false, seatCountInt);
            if (dyn && dyn.price > 0) {
                return `${dyn.price.toLocaleString('en-US')} د.ع`;
            }
        }
        return '15,000 د.ع';
    }

    async function searchOffers() {
        if (!fromGov || !toGov) {
            toast.warning('يرجى تحديد مكان الانطلاق والوجهة أولاً');
            return;
        }

        listLoading = true;
        listError = '';
        listWarning = '';
        try {
            if (!hasTokenForRideOfferSearch()) {
                listError = 'يرجى تسجيل الدخول لعرض العروض المتاحة من السائقين.';
                sourceDrivers = [];
                return;
            }

            const pickupCandidates = expandProvinceSearchVariants(fromGov);
            const dropoffCandidates = expandProvinceSearchVariants(toGov);
            const mergedOffers: any[] = [];
            const seenIds = new Set<string>();

            const coords = govCoords[fromGov];
            const pickupLat = coords ? coords[0] : undefined;
            const pickupLng = coords ? coords[1] : undefined;

            for (const pickup of pickupCandidates) {
                for (const dropoff of dropoffCandidates) {
                    try {
                        const qs = buildRideOfferSearchQueryString({
                            pickupProvince: pickup,
                            dropoffProvince: dropoff,
                            seatCount: seatCountInt,
                            pickupLatitude: pickupLat,
                            pickupLongitude: pickupLng,
                            oneTripOnly: false,
                            pageNum: 1,
                            pageSize: 20,
                        });
                        const res = await apiClient.get<any>(rideOfferSearchPath(qs));
                        const offersList = extractRecordArray(res.data);
                        for (const item of offersList) {
                            const guid = extractRideOfferGuidFromSearchRow(item);
                            const rawId = item?.id ?? item?.Id ?? item?.rideOfferId ?? item?.RideOfferId ?? item?.offerId ?? item?.OfferId;
                            const offerId = guid || (rawId ? String(rawId) : null);
                            if (offerId) {
                                if (!seenIds.has(offerId)) {
                                    seenIds.add(offerId);
                                    mergedOffers.push(item);
                                }
                            } else {
                                mergedOffers.push(item);
                            }
                        }
                    } catch (e) {
                        if (import.meta.env.DEV) {
                            console.warn(`فشل البحث عن المسار ${pickup} -> ${dropoff}:`, e);
                        }
                    }
                }
            }

            if (mergedOffers.length === 0) {
                listError = `لا توجد عروض متاحة حالياً من السائقين للمسار من ${fromGov} إلى ${toGov}.`;
                sourceDrivers = [];
                return;
            }

            sourceDrivers = mergedOffers.map((apiOffer: any, index: number) => {
                const guid = extractRideOfferGuidFromSearchRow(apiOffer);
                const rawId = apiOffer.id || apiOffer.Id || apiOffer.rideOfferId || apiOffer.RideOfferId || apiOffer.offerId;
                const uniqueKey = guid || (rawId ? String(rawId) : `offer-${index}-${Date.now()}`);
                const carText = [apiOffer.carBrand, apiOffer.carModel].filter(Boolean).join(' ') || 'مركبة سائق';
                return {
                    id: uniqueKey,
                    bookingOfferId: guid || (rawId ? String(rawId) : undefined),
                    name: apiOffer.companyName || 'شركة توصيل',
                    driverName: apiOffer.driverName || 'سائق',
                    car: carText,
                    rating: 5.0,
                    reviews: '0',
                    badge: 'عرض سائق متاح',
                    type: index === 0 ? 'featured' : index === 1 ? 'small' : 'simple',
                    icon: 'directions_car',
                    price: formatDriverPrice(apiOffer),
                    carTypes: ['سيدان'],
                    passengers: [`${seatCountInt} ركاب`],
                    luggage: ['متوسطة'],
                    interactions: 100 + index * 10,
                    hasHemam: false,
                };
            });
        } catch (e: any) {
            listError = e.message || 'تعذّر تحميل الرحلات المتاحة';
            sourceDrivers = [];
        } finally {
            listLoading = false;
        }
    }

    $: filteredAndSorted = sourceDrivers;

    function handleBookAction(driver: DriverCardUi) {
        if (!fromGov || !toGov) {
            toast.warning('يرجى اختيار المحافظة (مكان الانطلاق والوجهة) للمتابعة.');
            return;
        }
        const coords = govCoords[fromGov];
        const guid = driver.bookingOfferId || (isRideOfferGuid(driver.id) ? String(driver.id) : undefined);
        const finalLat = customPickupLat ?? (coords ? coords[0] : 33.3128);
        const finalLng = customPickupLng ?? (coords ? coords[1] : 44.3615);

        bookingStore.update((b: any) => ({
            ...b,
            serviceType: 'Inter-city',
            pickupProvince: fromGov,
            dropoffProvince: toGov,
            pickupLatitude: finalLat,
            pickupLongitude: finalLng,
            searchSeatCount: seatCountInt,
            carType: 'sedan',
            price: driver.price,
            companyName: driver.name,
            driverName: driver.driverName || driver.name,
            rideOfferId: guid,
        }));
        currentRoute.set('payment');
    }

    function openDriverDetails(driver: DriverCardUi) {
        selectedDriver = driver;
    }

    function closeDriverDetails() {
        selectedDriver = null;
    }
</script>

<DriverOfferDetails
    driver={selectedDriver}
    {fromGov}
    {toGov}
    seatCount={seatCountInt}
    on:close={closeDriverDetails}
    on:book={(event) => {
        handleBookAction(event.detail);
        closeDriverDetails();
    }}
/>

<div class="space-y-6">
    <div class="mb-2 text-right">
        <h1 class="text-[20px] font-black text-on-surface tracking-tight">سوق الرحلات، {$userData?.name || 'مسافر'} 👋</h1>
        <p class="text-on-surface-variant text-[11px] font-bold">استكشف السائقين الم متاحين للمناطق البعيدة</p>
    </div>

    {#if listError}
        <AppAlert type="error" title="تعذر تحميل العروض" message={listError} />
    {/if}
    {#if listWarning}
        <AppAlert type="warning" title="تنبيه على نتائج البحث" message={listWarning} />
    {/if}
    


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

            {#if fromGov || toGov}
            <div class="w-full h-60 bg-surface-container rounded-2xl relative overflow-hidden border border-outline-variant/10 animate-fade-in shadow-md my-1">
                <div id="pickup-map" class="w-full h-full z-0"></div>

                <!-- GPS Geolocation Button -->
                <button
                    type="button"
                    on:click={locateCurrentPosition}
                    disabled={isLocating}
                    class="absolute top-3 right-3 z-[1000] bg-[#1D1B1C]/90 hover:bg-[#1D1B1C] backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-black shadow-lg border border-primary/40 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                    {#if isLocating}
                        <span class="material-symbols-outlined text-[16px] animate-spin text-primary" style="font-variation-settings: 'FILL' 0;">progress_activity</span>
                        <span>جاري جلب الموقع…</span>
                    {:else}
                        <span class="material-symbols-outlined text-[16px] text-primary">my_location</span>
                        <span>تحديد موقعي الفعلي 🎯</span>
                    {/if}
                </button>

                <div class="absolute bottom-3 right-3 z-[1000] flex gap-2 pointer-events-none" dir="rtl">
                    {#if fromGov}
                        <span class="bg-[#1D1B1C]/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold shadow-md border border-primary/40 text-primary flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            من: {fromGov}
                        </span>
                    {/if}
                    {#if toGov}
                        <span class="bg-[#1D1B1C]/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold shadow-md border border-red-500/40 text-red-400 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            إلى: {toGov}
                        </span>
                    {/if}
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
                            <button type="button" disabled={!fromGov || !toGov} on:click={() => handleBookAction(driver)} class="flex-1 bg-primary text-white px-4 py-3 text-sm rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform {(!fromGov || !toGov) ? 'opacity-50 grayscale cursor-not-allowed' : ''}">احجز الآن</button>
                            <button type="button" on:click={() => openDriverDetails(driver)} class="flex-1 bg-primary/10 text-primary border border-primary/20 px-4 py-3 text-sm rounded-xl font-bold transition-all hover:bg-primary hover:text-white">التفاصيل</button>
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
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button" on:click={() => openDriverDetails(driver)} class="w-full bg-surface-container-lowest text-primary border border-primary/20 py-3 text-sm rounded-xl font-bold hover:bg-primary hover:text-white transition-all">التفاصيل</button>
                            <button type="button" disabled={!fromGov || !toGov} on:click={() => handleBookAction(driver)} class="w-full bg-primary/10 text-primary border border-primary/20 py-3 text-sm rounded-xl font-bold hover:bg-primary hover:text-white transition-all {(!fromGov || !toGov) ? 'opacity-50 grayscale cursor-not-allowed' : ''}">متابعة</button>
                        </div>
                    </div>
                </div>

            {:else if driver.type === 'simple'}
                <button type="button" disabled={!fromGov || !toGov} on:click={() => handleBookAction(driver)} class="bg-surface-container-lowest rounded-[1.5rem] p-4 flex items-center gap-4 transition-all duration-300 active:scale-95 border border-outline-variant/10 {(!fromGov || !toGov) ? 'opacity-50 grayscale cursor-not-allowed' : ''}">
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
            <h2 class="text-lg font-bold mb-2">احجز رحلتك القادمة واحصل على خصم 20%</h2>
            <p class="text-white/60 text-xs mb-4">
                استخدم الكود <span class="text-[#FAC445] font-bold">AIRPORT20</span> عند الحجز
            </p>
            <button class="bg-white text-[#1D1B1C] w-full py-3 text-sm rounded-xl font-bold active:scale-95 transition-transform">اكتشف العروض</button>
        </div>
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
    </section>
</div>
