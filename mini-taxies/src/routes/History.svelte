<script lang="ts">
    import { onMount } from 'svelte';
    import { apiClient } from '../lib/api/client';
    import { extractRecordArray } from '../lib/api/marketplaceResponse';
    import type { ApiMyRidesResponse } from '../lib/types/api';

    type HistoryTrip = {
        id: string;
        /** قيمة خام من الـ API لألوان الشارات (مثل RequestingRide، Completed) */
        statusCode: string;
        date: string;
        time: string;
        title: string;
        from: string;
        to: string;
        price: string;
        status: string;
        driver: string;
        driverPhone: string;
        car: string;
        distance: string;
        duration: string;
    };

    let trips: HistoryTrip[] = [];
    let selectedTrip: HistoryTrip | null = null;
    let loading = true;
    let loadError = '';

    function str(v: unknown, fallback = ''): string {
        if (v == null) return fallback;
        const s = String(v).trim();
        return s || fallback;
    }

    /** يطابق واجهة السجل: «مكتملة» للنجاح، وباقي الحالات كنص عربي */
    function rideStatusForHistory(status: string | undefined): string {
        const map: Record<string, string> = {
            RequestingRide: 'في انتظار قبول السائق',
            AcceptedRide: 'السائق في الطريق إليك',
            PickingYouUp: 'السائق يتجه لموقعك',
            TaxiAwaitingYou: 'وصل السائق',
            TransportingYou: 'أنت في الرحلة',
            Completed: 'مكتملة',
            PassengerCancelled: 'ملغاة',
            DriverDeclined: 'مرفوضة',
        };
        return status ? map[status] ?? status : '—';
    }

    function statusBadgeClass(code: string): string {
        if (code === 'Completed') return 'bg-green-100 text-green-700';
        if (code === 'PassengerCancelled' || code === 'DriverDeclined') return 'bg-red-100 text-red-700';
        return 'bg-amber-100 text-amber-800';
    }

    function statusTextClass(code: string): string {
        if (code === 'Completed') return 'text-green-600';
        if (code === 'PassengerCancelled' || code === 'DriverDeclined') return 'text-red-600';
        return 'text-amber-600';
    }

    function formatPriceIQD(v: unknown): string {
        const n = typeof v === 'number' ? v : Number(v);
        if (Number.isFinite(n)) return `${n.toLocaleString('en-US')} د.ع`;
        return str(v, '—');
    }

    function formatDateTime(iso: string | undefined): { date: string; time: string } {
        if (!iso) return { date: '—', time: '—' };
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return { date: '—', time: '—' };
        return {
            date: d.toLocaleDateString('ar-IQ', { year: 'numeric', month: '2-digit', day: '2-digit' }),
            time: d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
        };
    }

    function mapRideRecordToTrip(r: Record<string, unknown>, index: number): HistoryTrip {
        const statusRaw = str(r.status ?? r.Status);
        const pickup = str(r.pickupProvince ?? r.PickupProvince, '—');
        const dropoff = str(r.dropoffProvince ?? r.DropoffProvince, '—');
        const when =
            str(r.completedAt ?? r.CompletedAt) ||
            str(r.updatedAt ?? r.UpdatedAt) ||
            str(r.createdAt ?? r.CreatedAt) ||
            str(r.scheduledAt ?? r.ScheduledAt);
        const { date, time } = formatDateTime(when || undefined);

        const driverName = str(r.driverName ?? r.DriverName, '—');
        const driverPhone = str(r.driverPhoneNumber ?? r.DriverPhoneNumber, '');
        const carBrand = str(r.carBrand ?? r.CarBrand);
        const carModel = str(r.carModel ?? r.CarModel);
        const car = [carBrand, carModel].filter(Boolean).join(' ') || '—';

        const dist = r.distanceKm ?? r.DistanceKm ?? r.distance ?? r.Distance;
        let distance = '—';
        if (typeof dist === 'number' && Number.isFinite(dist)) distance = `${dist} كم`;
        else if (str(dist)) distance = `${dist} كم`;

        const dur = r.durationMinutes ?? r.DurationMinutes ?? r.duration ?? r.Duration;
        let duration = '—';
        if (typeof dur === 'number' && Number.isFinite(dur)) duration = `${dur} دقيقة`;
        else if (str(dur)) duration = str(dur);

        const title =
            pickup !== '—' && dropoff !== '—' ? `من ${pickup} إلى ${dropoff}` : 'رحلة';

        return {
            id: str(r.id ?? r.Id) || `ride-${index}`,
            statusCode: statusRaw || 'Unknown',
            date,
            time,
            title,
            from: pickup,
            to: dropoff,
            price: formatPriceIQD(r.price ?? r.Price),
            status: rideStatusForHistory(statusRaw),
            driver: driverName,
            driverPhone,
            car,
            distance,
            duration,
        };
    }

    onMount(async () => {
        loading = true;
        loadError = '';
        try {
            const res = await apiClient.get<ApiMyRidesResponse>('/Ride/MyRides');
            const rows = extractRecordArray(res.data);
            trips = rows.map(mapRideRecordToTrip);
        } catch (e) {
            trips = [];
            loadError = e instanceof Error ? e.message : 'تعذر تحميل سجل الرحلات';
        } finally {
            loading = false;
        }
    });

    function openDetails(trip: HistoryTrip) {
        selectedTrip = trip;
    }

    function closeDetails() {
        selectedTrip = null;
    }
</script>

{#if selectedTrip}
    <div class="fixed inset-0 z-[100] flex items-end justify-center">
        <button
            type="button"
            class="absolute inset-0 h-full w-full cursor-default border-0 bg-black/60 backdrop-blur-sm transition-opacity"
            on:click={closeDetails}
            aria-label="إغلاق تفاصيل الرحلة"
        ></button>
        <div class="relative z-10 w-full max-w-[420px] bg-surface rounded-t-[32px] p-6 shadow-2xl animate-slide-up">
            <div class="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6"></div>
            
            <div class="flex justify-between items-start mb-6 flex-row-reverse" dir="rtl">
                <h3 class="text-xl font-black text-on-surface">تفاصيل الرحلة</h3>
                <button on:click={closeDetails} class="p-2 bg-surface-container rounded-full leading-none">
                    <span class="material-symbols-outlined text-on-surface">close</span>
                </button>
            </div>

            <div class="space-y-6" dir="rtl">
                <div class="flex justify-between items-center bg-surface-container-low p-4 rounded-2xl">
                    <div class="text-right">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60 mb-0.5">الحالة</p>
                        <p class="text-sm font-black {statusTextClass(selectedTrip.statusCode)}">{selectedTrip.status}</p>
                    </div>
                    <div class="text-left">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60 mb-0.5">التكلفة</p>
                        <p class="text-sm font-black text-primary">{selectedTrip.price}</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-primary">person</span>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-bold text-on-surface-variant opacity-60">السائق</p>
                            <p class="text-sm font-black text-on-surface">{selectedTrip.driver}</p>
                            <p class="text-xs text-on-surface-variant">{selectedTrip.car}</p>
                            {#if selectedTrip.driverPhone}
                                <p class="text-xs text-on-surface-variant mt-1" dir="ltr">{selectedTrip.driverPhone}</p>
                            {/if}
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-primary">route</span>
                        </div>
                        <div class="text-right space-y-1">
                            <p class="text-[10px] font-bold text-on-surface-variant opacity-60">المسار</p>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full border-2 border-primary"></div>
                                <p class="text-sm font-bold text-on-surface">{selectedTrip.from}</p>
                            </div>
                            <div class="w-0.5 h-3 bg-outline-variant/30 mr-0.75"></div>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-primary rounded-sm"></div>
                                <p class="text-sm font-bold text-on-surface">{selectedTrip.to}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                  on:click={closeDetails}
                  class="w-full py-4 bg-primary text-on-primary font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                    إغلاق
                </button>
            </div>
        </div>
    </div>
{/if}

<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center mb-2 px-1 w-full" dir="rtl">
        <h2 class="text-2xl font-black text-on-surface">سجل الرحلات</h2>
    </div>

    {#if loading}
        <p class="text-center text-on-surface-variant py-8" dir="rtl">جاري التحميل…</p>
    {:else if loadError}
        <p class="text-center text-red-600 py-8 px-4" dir="rtl">{loadError}</p>
    {:else if trips.length === 0}
        <p class="text-center text-on-surface-variant py-8" dir="rtl">لا توجد رحلات في السجل بعد.</p>
    {/if}

    <div class="space-y-4">
        {#each trips as trip}
            <button 
              type="button"
              on:click={() => openDetails(trip)}
              class="w-full text-right bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-all cursor-pointer group active:scale-[0.98]">
                <div class="flex justify-between items-start mb-4" dir="rtl">
                    <div class="text-right">
                        {#if trip.date !== '—' || trip.time !== '—'}
                            <p class="text-[10px] font-bold text-on-surface-variant opacity-60 mb-1">{trip.date} • {trip.time}</p>
                        {:else}
                            <p class="text-[10px] font-bold text-on-surface-variant opacity-50 mb-1">لم يُرجع الخادم تاريخ الرحلة بعد</p>
                        {/if}
                        <h3 class="text-base font-black text-on-surface">{trip.title}</h3>
                    </div>
                    <div class="px-3 py-1 rounded-full text-[10px] font-black {statusBadgeClass(trip.statusCode)}">
                        {trip.status}
                    </div>
                </div>

                <div class="flex items-center gap-3 mb-4" dir="rtl">
                    <div class="flex flex-col items-center gap-1 shrink-0">
                        <div class="w-2.5 h-2.5 rounded-full border-2 border-primary"></div>
                        <div class="w-0.5 h-4 bg-outline-variant/30"></div>
                        <div class="w-2.5 h-2.5 bg-primary rounded-sm"></div>
                    </div>
                    <div class="flex flex-col gap-2 text-right">
                        <p class="text-[11px] font-medium text-on-surface-variant leading-none">{trip.from}</p>
                        <p class="text-[11px] font-medium text-on-surface-variant leading-none mt-2">{trip.to}</p>
                    </div>
                </div>

                <div class="pt-4 border-t border-outline-variant/5 flex justify-between items-center" dir="rtl">
                    <div class="text-primary font-black text-sm">{trip.price}</div>
                    <span class="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 group-hover:text-primary transition-colors">
                        عرض التفاصيل
                        <span class="material-symbols-outlined text-[14px]">chevron_left</span>
                    </span>
                </div>
            </button>
        {/each}
    </div>
</div>
