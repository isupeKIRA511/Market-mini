<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { apiClient } from '../lib/api/client';
    import { cancelBooking, getMyBookings } from '../lib/api/bookings';
    import { extractRecordArray } from '../lib/api/marketplaceResponse';
    import type { ApiGetOneResponse, ApiMyRidesResponse, ApiStatusResponse, RideStatusPayload } from '../lib/types/api';
    import { RIDE_STATUS, canPassengerCancelRide, rideStatusUiAr, shouldPollRideStatus } from '../lib/api/rideStatus';
    import { toast } from '../lib/stores/toastStore';
    import AppAlert from '../lib/components/AppAlert.svelte';
    import ConfirmDialog from '../lib/components/ConfirmDialog.svelte';

    import { govCoords, calculateHaversineDistanceKm } from '../lib/data/governorates';

    const STATUS_POLL_MS = 3000;
    const RATING_STORAGE_KEY = 'rideRatings';

    type HistoryTrip = {
        id: string;
        source: 'ride' | 'booking';
        sortTs: number;
        /** قيمة خام من الـ API لألوان الشارات (مثل RequestingRide، Completed) */
        statusCode: string;
        date: string;
        time: string;
        title: string;
        from: string;
        to: string;
        price: string;
        /** نص من الخادم (رسالة GET /Ride/{id}/status أو حقل اختياري من القائمة) */
        status: string;
        driver: string;
        driverPhone: string;
        car: string;
        distance: string;
        duration: string;
        rating?: number;
        ratingComment?: string;
    };

    type StoredRideRating = {
        rating: number;
        comment: string;
        ratedAt: string;
    };

    let trips: HistoryTrip[] = [];
    let selectedTrip: HistoryTrip | null = null;
    let loading = true;
    let loadError = '';
    let pollInterval: ReturnType<typeof setInterval> | undefined;
    let boardingRideId: string | null = null;
    let boardError = '';
    let cancellingRideId: string | null = null;
    let cancelError = '';
    /** لعرض خطأ الإلغاء تحت بطاقة الرحلة أو في النافذة */
    let cancelErrorRideId: string | null = null;
    let cancelConfirmRideId: string | null = null;
    let cancelTargetTrip: HistoryTrip | null = null;
    let ratingDraft = 5;
    let ratingCommentDraft = '';

    $: cancelTargetTrip = cancelConfirmRideId
        ? trips.find((trip) => trip.id === cancelConfirmRideId) ?? null
        : null;

    function loadStoredRatings(): Record<string, StoredRideRating> {
        if (typeof localStorage === 'undefined') return {};
        try {
            const raw = localStorage.getItem(RATING_STORAGE_KEY);
            return raw ? JSON.parse(raw) as Record<string, StoredRideRating> : {};
        } catch {
            return {};
        }
    }

    function saveStoredRating(rideId: string, value: StoredRideRating) {
        if (typeof localStorage === 'undefined') return;
        const ratings = loadStoredRatings();
        ratings[rideId] = value;
        localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratings));
    }

    function applyStoredRatings(rows: HistoryTrip[]): HistoryTrip[] {
        const ratings = loadStoredRatings();
        return rows.map((trip) => {
            const stored = ratings[trip.id];
            if (!stored) return trip;
            return {
                ...trip,
                rating: stored.rating,
                ratingComment: stored.comment,
            };
        });
    }

    function str(v: unknown, fallback = ''): string {
        if (v == null) return fallback;
        const s = String(v).trim();
        return s || fallback;
    }

    function statusBadgeClass(code: string): string {
        if (code === 'Completed') return 'bg-green-100 text-green-700';
        if (code === 'PassengerCancelled' || code === 'DriverDeclined' || code === 'Cancelled') return 'bg-red-100 text-red-700';
        return 'bg-amber-100 text-amber-800';
    }

    function statusTextClass(code: string): string {
        if (code === 'Completed') return 'text-green-600';
        if (code === 'PassengerCancelled' || code === 'DriverDeclined' || code === 'Cancelled') return 'text-red-600';
        return 'text-amber-600';
    }

    function formatPriceIQD(r: Record<string, unknown>): string {
        const candidateKeys = [
            'price', 'Price', 'cost', 'Cost', 'fare', 'Fare', 'amount', 'Amount',
            'rideOfferPrice', 'RideOfferPrice', 'pricePerSeat', 'PricePerSeat'
        ];
        for (const key of candidateKeys) {
            const val = r[key];
            if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
                return `${val.toLocaleString('en-US')} د.ع`;
            }
            if (typeof val === 'string' && !isNaN(Number(val)) && Number(val) > 0) {
                return `${Number(val).toLocaleString('en-US')} د.ع`;
            }
        }
        const offerObj = (r.rideOffer || r.RideOffer || r.offer || r.Offer) as Record<string, unknown> | undefined;
        if (offerObj && typeof offerObj === 'object') {
            for (const key of candidateKeys) {
                const val = offerObj[key];
                if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
                    return `${val.toLocaleString('en-US')} د.ع`;
                }
            }
        }
        const val = r.price ?? r.Price;
        if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
            return `${val.toLocaleString('en-US')} د.ع`;
        }
        return 'غير محدد';
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

    function timestampFrom(iso: string | undefined): number {
        if (!iso) return 0;
        const ts = new Date(iso).getTime();
        return Number.isFinite(ts) ? ts : 0;
    }

    function mapRideRecordToTrip(r: Record<string, unknown>, index: number): HistoryTrip {
        const statusRaw = str(r.status ?? r.Status);
        const pickup = str(r.pickupProvince ?? r.PickupProvince ?? r.pickup ?? r.Pickup, '—');
        const dropoff = str(r.dropoffProvince ?? r.DropoffProvince ?? r.dropoff ?? r.Dropoff, '—');
        const when =
            str(r.completedAt ?? r.CompletedAt) ||
            str(r.updatedAt ?? r.UpdatedAt) ||
            str(r.createdAt ?? r.CreatedAt) ||
            str(r.scheduledAt ?? r.ScheduledAt) ||
            str(r.date ?? r.Date ?? r.dateTime ?? r.DateTime);
        const { date, time } = formatDateTime(when || undefined);

        const driverObj = (r.driver || r.Driver) as Record<string, unknown> | undefined;
        const driverName = str(r.driverName ?? r.DriverName ?? driverObj?.name ?? driverObj?.fullName, 'سائق');
        const driverPhone = str(r.driverPhoneNumber ?? r.DriverPhoneNumber ?? r.driverPhone ?? driverObj?.phoneNumber, '');
        const carBrand = str(r.carBrand ?? r.CarBrand ?? driverObj?.carBrand);
        const carModel = str(r.carModel ?? r.CarModel ?? driverObj?.carModel);
        const car = [carBrand, carModel].filter(Boolean).join(' ') || 'مركبة سائق';
        const ratingRaw = r.rating ?? r.Rating ?? r.passengerRating ?? r.PassengerRating;
        const parsedRating = Number(ratingRaw);
        const rating = Number.isFinite(parsedRating) && parsedRating > 0
            ? Math.min(5, Math.max(1, Math.round(parsedRating)))
            : undefined;
        const ratingComment = str(r.ratingComment ?? r.RatingComment ?? r.review ?? r.Review);

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

        const listMessage = str(
            r.statusMessage ?? r.StatusMessage ?? r.message ?? r.Message,
        );
        const statusLabel = listMessage || statusRaw || '—';

        return {
            id: str(r.id ?? r.Id) || `ride-${index}`,
            source: 'ride',
            sortTs: timestampFrom(when || undefined),
            statusCode: statusRaw || 'Unknown',
            date,
            time,
            title,
            from: pickup,
            to: dropoff,
            price: formatPriceIQD(r),
            status: statusLabel,
            driver: driverName,
            driverPhone,
            car,
            distance,
            duration,
            rating,
            ratingComment,
        };
    }

    function mapBookingRecordToTrip(r: Record<string, unknown>, index: number): HistoryTrip {
        const statusRaw = str(r.status ?? r.Status, 'Pending');
        const pickup = str(r.pickup ?? r.Pickup, '—');
        const dropoff = str(r.dropoff ?? r.Dropoff, '—');
        const when =
            str(r.updatedAt ?? r.UpdatedAt) ||
            str(r.createdAt ?? r.CreatedAt);
        const { date, time } = formatDateTime(when || undefined);
        const companyName = str(r.companyName ?? r.CompanyName, 'شركة المطار');
        const passengers = r.maxPassengers ?? r.MaxPassengers;
        const passengerLabel = str(passengers) ? `${passengers} ركاب` : '—';

        return {
            id: str(r.id ?? r.Id) || `booking-${index}`,
            source: 'booking',
            sortTs: timestampFrom(when || undefined),
            statusCode: statusRaw,
            date,
            time,
            title: `حجز مطار من ${pickup} إلى ${dropoff}`,
            from: pickup,
            to: dropoff,
            price: 'غير محدد',
            status: statusRaw,
            driver: companyName,
            driverPhone: '',
            car: passengerLabel,
            distance: '—',
            duration: '—',
        };
    }

    function stopStatusPolling() {
        if (pollInterval != null) {
            clearInterval(pollInterval);
            pollInterval = undefined;
        }
    }

    function canUseServerId(id: string): boolean {
        return Boolean(id) && !id.startsWith('ride-') && !id.startsWith('booking-');
    }

    function canPollTrip(trip: HistoryTrip): boolean {
        return trip.source === 'ride' && canUseServerId(trip.id) && shouldPollRideStatus(trip.statusCode);
    }

    function canCancelBookingStatus(statusCode: string | undefined | null): boolean {
        const c = String(statusCode ?? '').trim();
        return c === 'Pending' || c === 'Confirmed';
    }

    function canCancelTrip(trip: HistoryTrip): boolean {
        if (!canUseServerId(trip.id)) return false;
        if (trip.source === 'booking') return canCancelBookingStatus(trip.statusCode);
        return canPassengerCancelRide(trip.statusCode);
    }

    function statusDisplay(trip: HistoryTrip): string {
        if (trip.source === 'booking') {
            const labels: Record<string, string> = {
                Pending: 'بانتظار التأكيد',
                Confirmed: 'تم التأكيد',
                Cancelled: 'تم الإلغاء',
                Completed: 'مكتمل',
            };
            return labels[trip.statusCode] || trip.status || trip.statusCode || '—';
        }
        return rideStatusUiAr(trip.statusCode, trip.status);
    }

    async function pollActiveRideStatuses() {
        const activeIds = trips
            .filter(canPollTrip)
            .map((t) => t.id);
        if (activeIds.length === 0) {
            stopStatusPolling();
            return;
        }

        const results = await Promise.all(
            activeIds.map(async (id) => {
                try {
                    const res = await apiClient.get<ApiGetOneResponse<RideStatusPayload>>(`/Ride/${id}/status`);
                    return { id, payload: res?.data?.data ?? null };
                } catch {
                    return { id, payload: null };
                }
            }),
        );

        const byId = new Map(results.map((r) => [r.id, r.payload]));
        trips = trips.map((t) => {
            const payload = byId.get(t.id);
            if (!payload || typeof payload.status !== 'string') return t;
            const code = payload.status;
            const msg = typeof payload.message === 'string' ? payload.message.trim() : '';
            const display = msg || code;
            return { ...t, statusCode: code, status: display };
        });

        if (selectedTrip) {
            const u = trips.find((x) => x.id === selectedTrip!.id);
            if (u) selectedTrip = u;
        }

        if (!trips.some(canPollTrip)) {
            stopStatusPolling();
        }
    }

    function startStatusPolling() {
        stopStatusPolling();
        if (!trips.some(canPollTrip)) return;
        void pollActiveRideStatuses();
        pollInterval = setInterval(() => void pollActiveRideStatuses(), STATUS_POLL_MS);
    }

    onMount(() => {
        (async () => {
            loading = true;
            loadError = '';
            const loadedTrips: HistoryTrip[] = [];
            const errors: string[] = [];

            try {
                const res = await apiClient.get<ApiMyRidesResponse>('/Ride/MyRides');
                const rows = extractRecordArray(res.data);
                loadedTrips.push(...rows.map(mapRideRecordToTrip));
            } catch (e) {
                errors.push(e instanceof Error ? e.message : 'تعذر تحميل سجل الرحلات');
            }

            try {
                const bookings = await getMyBookings();
                loadedTrips.push(...bookings.map((booking, index) => mapBookingRecordToTrip(booking as unknown as Record<string, unknown>, index)));
            } catch (e) {
                errors.push(e instanceof Error ? e.message : 'تعذر تحميل حجوزات المطار');
            } finally {
                trips = applyStoredRatings(loadedTrips.sort((a, b) => b.sortTs - a.sortTs));
                if (errors.length > 0 && trips.length === 0) {
                    loadError = errors[0];
                }
                loading = false;
            }
            if (!loadError && trips.length > 0) {
                startStatusPolling();
            }
        })();
    });

    onDestroy(() => {
        stopStatusPolling();
    });

    function openDetails(trip: HistoryTrip) {
        selectedTrip = trip;
        ratingDraft = trip.rating ?? 5;
        ratingCommentDraft = trip.ratingComment ?? '';
    }

    function closeDetails() {
        selectedTrip = null;
        boardError = '';
        cancelError = '';
        cancelErrorRideId = null;
        cancelConfirmRideId = null;
        ratingDraft = 5;
        ratingCommentDraft = '';
    }

    function canRateTrip(trip: HistoryTrip): boolean {
        return trip.source === 'ride' && trip.statusCode === RIDE_STATUS.Completed && canUseServerId(trip.id);
    }

    function submitRating() {
        if (!selectedTrip || !canRateTrip(selectedTrip)) return;
        const safeRating = Math.min(5, Math.max(1, Math.round(ratingDraft)));
        const comment = ratingCommentDraft.trim().slice(0, 180);
        saveStoredRating(selectedTrip.id, {
            rating: safeRating,
            comment,
            ratedAt: new Date().toISOString(),
        });
        trips = trips.map((trip) => trip.id === selectedTrip!.id
            ? { ...trip, rating: safeRating, ratingComment: comment }
            : trip,
        );
        selectedTrip = { ...selectedTrip, rating: safeRating, ratingComment: comment };
        toast.success('تم حفظ تقييم الرحلة');
    }

    async function cancelRide(rideId: string) {
        const trip = trips.find((t) => t.id === rideId);
        if (!trip || !canCancelTrip(trip)) return;
        cancelConfirmRideId = rideId;
    }

    async function performCancelRide() {
        const rideId = cancelConfirmRideId;
        if (!rideId) return;
        cancellingRideId = rideId;
        cancelError = '';
        cancelErrorRideId = null;
        try {
            const trip = trips.find((t) => t.id === rideId);
            if (trip?.source === 'booking') {
                await cancelBooking(rideId);
            } else {
                await apiClient.delete<ApiStatusResponse>(`/Ride/${rideId}`);
            }
            cancelErrorRideId = null;
            cancelConfirmRideId = null;
            trips = trips.map((t) => t.id === rideId
                ? { ...t, statusCode: t.source === 'booking' ? 'Cancelled' : t.statusCode, status: t.source === 'booking' ? 'تم الإلغاء' : t.status }
                : t,
            );
            if (trip?.source === 'ride') {
                await pollActiveRideStatuses();
                startStatusPolling();
            }
        } catch (e) {
            const m = e instanceof Error ? e.message : 'تعذر إلغاء الرحلة';
            cancelError = m;
            cancelErrorRideId = rideId;
        } finally {
            cancellingRideId = null;
        }
    }

    async function confirmBoarding(rideId: string) {
        const trip = trips.find((t) => t.id === rideId);
        if (!trip || trip.source !== 'ride' || !canUseServerId(rideId)) return;
        boardingRideId = rideId;
        boardError = '';
        try {
            await apiClient.post<ApiStatusResponse>(`/Ride/${rideId}/board`, undefined);
            await pollActiveRideStatuses();
            startStatusPolling();
        } catch (e) {
            boardError = e instanceof Error ? e.message : 'تعذر تأكيد الصعود';
        } finally {
            boardingRideId = null;
        }
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
                        <p class="text-sm font-black {statusTextClass(selectedTrip.statusCode)}">{statusDisplay(selectedTrip)}</p>
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
                            <p class="text-[10px] font-bold text-on-surface-variant opacity-60">{selectedTrip.source === 'booking' ? 'الشركة' : 'السائق'}</p>
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

                <div class="grid grid-cols-2 gap-3" dir="rtl">
                    <div class="rounded-2xl bg-surface-container-low p-4 text-right">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60">التاريخ</p>
                        <p class="mt-1 text-sm font-black text-on-surface">{selectedTrip.date}</p>
                    </div>
                    <div class="rounded-2xl bg-surface-container-low p-4 text-right">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60">الوقت</p>
                        <p class="mt-1 text-sm font-black text-on-surface">{selectedTrip.time}</p>
                    </div>
                    <div class="rounded-2xl bg-surface-container-low p-4 text-right">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60">المسافة</p>
                        <p class="mt-1 text-sm font-black text-on-surface">{selectedTrip.distance}</p>
                    </div>
                    <div class="rounded-2xl bg-surface-container-low p-4 text-right">
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60">المدة</p>
                        <p class="mt-1 text-sm font-black text-on-surface">{selectedTrip.duration}</p>
                    </div>
                </div>

                <div class="rounded-2xl bg-surface-container-low p-4 text-right" dir="rtl">
                    <p class="text-[10px] font-bold text-on-surface-variant opacity-60">رقم الرحلة</p>
                    <p class="mt-1 break-all text-xs font-black text-on-surface" dir="ltr">{selectedTrip.id}</p>
                </div>

                {#if canRateTrip(selectedTrip)}
                    <div class="rounded-[24px] border border-primary/20 bg-primary/10 p-4 text-right">
                        <div class="flex items-center justify-between gap-3 mb-3" dir="rtl">
                            <div>
                                <p class="text-sm font-black text-on-surface">تقييم الرحلة</p>
                                <p class="text-[10px] font-bold text-on-surface-variant">يساعدنا تقييمك على تحسين كل أنواع الرحلات.</p>
                            </div>
                            {#if selectedTrip.rating}
                                <span class="rounded-full bg-surface px-3 py-1 text-[10px] font-black text-on-surface">تم التقييم</span>
                            {/if}
                        </div>

                        <div class="flex items-center justify-center gap-1 py-2" dir="ltr" aria-label="اختيار تقييم الرحلة">
                            {#each [1, 2, 3, 4, 5] as star}
                                <button
                                    type="button"
                                    on:click={() => ratingDraft = star}
                                    class="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 {ratingDraft >= star ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
                                    aria-label={`تقييم ${star} من 5`}
                                >
                                    <span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' {ratingDraft >= star ? 1 : 0};">star</span>
                                </button>
                            {/each}
                        </div>

                        <label for="ride-rating-comment" class="block text-[10px] font-bold text-on-surface-variant mt-3 mb-1">ملاحظة اختيارية</label>
                        <textarea
                            id="ride-rating-comment"
                            bind:value={ratingCommentDraft}
                            rows="3"
                            maxlength="180"
                            class="w-full resize-none rounded-2xl bg-surface-container-low p-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="اكتب رأيك بالسائق أو المركبة أو وقت الوصول"
                        ></textarea>

                        <button
                            type="button"
                            on:click={submitRating}
                            class="mt-3 w-full rounded-2xl bg-[#1D1B1C] py-3.5 font-black text-white transition-all active:scale-[0.98]"
                        >
                            {selectedTrip.rating ? 'تحديث التقييم' : 'حفظ التقييم'}
                        </button>
                    </div>
                {:else if selectedTrip.statusCode !== RIDE_STATUS.Completed}
                    <div class="rounded-2xl bg-surface-container-low p-4 text-right">
                        <p class="text-[11px] font-bold text-on-surface-variant">
                            سيظهر تقييم الرحلة هنا بعد اكتمالها.
                        </p>
                    </div>
                {/if}

                {#if canCancelTrip(selectedTrip)}
                    <div class="space-y-2">
                        {#if cancelError && cancelErrorRideId === selectedTrip.id}
                            <AppAlert type="error" title={selectedTrip.source === 'booking' ? 'تعذر إلغاء الحجز' : 'تعذر إلغاء الرحلة'} message={cancelError} />
                        {/if}
                        <button
                            type="button"
                            disabled={cancellingRideId === selectedTrip.id}
                            on:click={() => cancelRide(selectedTrip!.id)}
                            class="w-full py-3.5 font-bold rounded-2xl border-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:opacity-60 disabled:pointer-events-none"
                        >
                            {cancellingRideId === selectedTrip.id ? 'جاري الإلغاء…' : selectedTrip.source === 'booking' ? 'إلغاء الحجز' : 'إلغاء الرحلة'}
                        </button>
                    </div>
                {/if}

                {#if selectedTrip.statusCode === RIDE_STATUS.TaxiAwaitingYou}
                    <div class="space-y-2 mt-2">
                        <p class="text-xs text-on-surface-variant text-right">
                            عند وصول السائق وتجهزك للمغادرة، أكّد أنك صعدتَ إلى المركبة لبدء الرحلة.
                        </p>
                        {#if boardError}
                            <AppAlert type="error" title="تعذر تأكيد الصعود" message={boardError} />
                        {/if}
                        <button
                            type="button"
                            disabled={boardingRideId === selectedTrip.id}
                            on:click={() => confirmBoarding(selectedTrip!.id)}
                            class="w-full py-4 bg-primary text-on-primary font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none"
                        >
                            {boardingRideId === selectedTrip.id ? 'جاري التأكيد…' : 'تأكيد الصعود إلى المركبة'}
                        </button>
                    </div>
                {/if}

                <button 
                  type="button"
                  on:click={closeDetails}
                  class="w-full py-4 font-black rounded-2xl transition-all mt-4 {selectedTrip.statusCode === RIDE_STATUS.TaxiAwaitingYou
                    ? 'bg-surface-container-high text-on-surface border border-outline-variant/20 shadow-sm'
                    : 'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95'}"
                >
                    إغلاق
                </button>
            </div>
        </div>
    </div>
{/if}

<ConfirmDialog
    open={Boolean(cancelConfirmRideId)}
    title={cancelTargetTrip?.source === 'booking' ? 'إلغاء الحجز' : 'إلغاء الرحلة'}
    message={cancelTargetTrip?.source === 'booking'
        ? 'سيتم إرسال طلب إلغاء حجز المطار. يمكنك إنشاء حجز جديد من التطبيق متى أردت.'
        : 'سيتم إرسال طلب إلغاء هذه الرحلة. يمكنك الحجز مرة أخرى من التطبيق متى أردت.'}
    confirmLabel={cancelTargetTrip?.source === 'booking' ? 'إلغاء الحجز' : 'إلغاء الرحلة'}
    cancelLabel="العودة"
    loading={Boolean(cancellingRideId)}
    variant="danger"
    on:cancel={() => cancelConfirmRideId = null}
    on:confirm={performCancelRide}
/>

<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center mb-2 px-1 w-full" dir="rtl">
        <h2 class="text-2xl font-black text-on-surface">سجل الرحلات</h2>
    </div>

    {#if loading}
        <p class="text-center text-on-surface-variant py-8" dir="rtl">جاري التحميل…</p>
    {:else if loadError}
        <AppAlert type="error" title="تعذر تحميل سجل الرحلات" message={loadError} />
    {:else if trips.length === 0}
        <p class="text-center text-on-surface-variant py-8" dir="rtl">لا توجد رحلات في السجل بعد.</p>
    {/if}

    <div class="space-y-4">
        {#each trips as trip}
            <button 
              type="button"
              on:click={() => openDetails(trip)}
              class="w-full text-right bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-all cursor-pointer group active:scale-[0.98]"
            >
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
                        {statusDisplay(trip)}
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
                    <div class="flex items-center gap-3">
                        {#if trip.rating}
                            <span class="text-[10px] font-black text-on-surface flex items-center gap-1">
                                {trip.rating}.0
                                <span class="material-symbols-outlined text-primary text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                            </span>
                        {:else if trip.statusCode === RIDE_STATUS.Completed}
                            <span class="text-[10px] font-bold text-primary">قيّم الرحلة</span>
                        {/if}
                        <span class="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 group-hover:text-primary transition-colors">
                            عرض التفاصيل
                            <span class="material-symbols-outlined text-[14px]">chevron_left</span>
                        </span>
                    </div>
                </div>
            </button>
        {/each}
    </div>
</div>
