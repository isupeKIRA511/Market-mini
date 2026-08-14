<script lang="ts">
    import { currentRoute } from "../lib/stores/navigationStore";
    import { bookingStore } from "../lib/stores/bookingStore";
    import { toast } from "../lib/stores/toastStore";
    import LeafletMap from "../lib/components/LeafletMap.svelte";
    import { governorates } from "../lib/data/governorates";
    import { calculateMapDynamicPrice } from "../lib/booking/display";

    let selectedProvince = "";

    const iraqiAirports: string[] = [
        "مطار بغداد الدولي",
        "مطار أربيل الدولي",
        "مطار البصرة الدولي",
        "مطار النجف الأشرف الدولي",
        "مطار السليمانية الدولي",
        "مطار الناصرية الدولي",
        "مطار كركوك الدولي",
    ];

    const airportProvinceByName: Record<string, string> = {
        "مطار بغداد الدولي": "بغداد",
        "مطار أربيل الدولي": "أربيل",
        "مطار البصرة الدولي": "البصرة",
        "مطار النجف الأشرف الدولي": "النجف",
        "مطار السليمانية الدولي": "السليمانية",
        "مطار الناصرية الدولي": "ذي قار",
        "مطار كركوك الدولي": "كركوك",
    };

    const airportCoordinatesByName: Record<string, { lat: number; lng: number }> = {
        "مطار بغداد الدولي": { lat: 33.2625, lng: 44.2346 },
        "مطار أربيل الدولي": { lat: 36.2376, lng: 43.9632 },
        "مطار البصرة الدولي": { lat: 30.5491, lng: 47.6621 },
        "مطار النجف الأشرف الدولي": { lat: 31.9917, lng: 44.4042 },
        "مطار السليمانية الدولي": { lat: 35.5608, lng: 45.3147 },
        "مطار الناصرية الدولي": { lat: 30.9358, lng: 46.0901 },
        "مطار كركوك الدولي": { lat: 35.4697, lng: 44.3489 },
    };

    let selectedAirport = "";

    let pickupLocation: { lat: number; lng: number } | null = null;
    let flightNumber = "";

    let luggage = 3;
    let passengers = 2;

    function incLuggage() {
        luggage++;
    }
    function decLuggage() {
        if (luggage > 0) luggage--;
    }

    function incPassengers() {
        passengers++;
    }
    function decPassengers() {
        if (passengers > 1) passengers--;
    }

    let dateInput = new Date().toISOString().split("T")[0];
    let timeInput = "09:30";

    $: formatNum = (num: number) => (num < 10 ? `0${num}` : `${num}`);

    async function handleContinue() {
        if (!selectedAirport || !pickupLocation || !selectedProvince) {
            toast.warning("يرجى تحديد المطار، المحافظة، ونقطة الموقع على الخريطة أولاً.");
            return;
        }

        const homeLocation = pickupLocation;
        const airportProvince = airportProvinceByName[selectedAirport] ?? "";
        if (!airportProvince) {
            toast.error("تعذّر ربط المطار بمحافظة معروفة للبحث عن عروض الرحلات.");
            return;
        }

        const airportCoords = airportCoordinatesByName[selectedAirport];
        if (!airportCoords) {
            toast.error("تعذّر تحديد إحداثيات المطار المطلوبة لإنشاء الحجز.");
            return;
        }

        const isToAirport = $bookingStore.serviceType === "To Airport";
        const pickupProvince = isToAirport ? selectedProvince : airportProvince;
        const dropoffProvince = isToAirport ? airportProvince : selectedProvince;
        const homeText = `${selectedProvince} (${homeLocation.lat.toFixed(6)}, ${homeLocation.lng.toFixed(6)})`;
        const airportText = `${selectedAirport} - ${airportProvince}`;
        const pickupText = isToAirport ? homeText : airportText;
        const dropoffText = isToAirport ? airportText : homeText;
        const bookingLatitude = isToAirport ? homeLocation.lat : airportCoords.lat;
        const bookingLongitude = isToAirport ? homeLocation.lng : airportCoords.lng;

        const payload = {
            pickupLocation: pickupText,
            dropoffLocation: dropoffText,
            airport: selectedAirport,
            flightNumber: flightNumber,
            passengersCount: passengers,
            luggageCount: luggage,
            dateTime: `${dateInput} ${timeInput}`,
        };

        const dynamicPricing = calculateMapDynamicPrice(
            homeLocation.lat,
            homeLocation.lng,
            airportCoords.lat,
            airportCoords.lng
        );

        bookingStore.update((b) => ({
            ...b,
            ...payload,
            rideOfferId: undefined,
            pickupProvince,
            dropoffProvince,
            searchSeatCount: passengers,
            pickupLatitude: bookingLatitude,
            pickupLongitude: bookingLongitude,
            homeLatitude: homeLocation.lat,
            homeLongitude: homeLocation.lng,
            airportLatitude: airportCoords.lat,
            airportLongitude: airportCoords.lng,
            homeToAirport: isToAirport,
            companyId: undefined,
            companyName: undefined,
            price: dynamicPricing.price,
            bookingId: undefined,
        }));

        currentRoute.set("select-car");
    }

    function onLocationSelected(e: any) {
        pickupLocation = {
            ...pickupLocation,
            lat: e.detail.lat,
            lng: e.detail.lng,
        };
    }
</script>

<div class="space-y-6 flex flex-col items-center">
    <div
        class="flex flex-row justify-between items-center mb-6 px-1 w-full mt-2"
    >
        <div class="flex flex-col items-center gap-2">
            <div
                class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm transition-transform scale-110"
            >
                1
            </div>
            <span class="text-[10px] font-bold text-on-surface">التفاصيل</span>
        </div>
        <div class="flex-1 h-[2px] bg-primary mx-1 opacity-20"></div>
        <div class="flex flex-col items-center gap-2 opacity-50">
            <div
                class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm"
            >
                2
            </div>
            <span class="text-[10px] font-medium text-on-surface-variant"
                >المركبة</span
            >
        </div>
        <div class="flex-1 h-[2px] bg-outline-variant mx-1 opacity-20"></div>
        <div class="flex flex-col items-center gap-2 opacity-50">
            <div
                class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm"
            >
                3
            </div>
            <span class="text-[10px] font-medium text-on-surface-variant"
                >الدفع</span
            >
        </div>
    </div>

    <section
        class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 w-full relative overflow-hidden"
    >
        <div
            class="absolute -right-16 -top-16 w-32 h-32 bg-primary-container/20 rounded-full blur-[30px] pointer-events-none"
        ></div>

        <h2
            class="text-base font-bold mb-4 flex items-center gap-2 justify-end relative z-10"
        >
            {#if $bookingStore.serviceType === "From Airport"}
                تحديد المطار وموقع الوصول
            {:else}
                تحديد موقع الانطلاق والمطار
            {/if}
            <span class="material-symbols-outlined text-primary text-xl"
                >location_on</span
            >
        </h2>

        <div class="space-y-4 text-right relative z-10 flex flex-col">
            {#if $bookingStore.serviceType === "From Airport"}
                <div class="relative order-1">
                    <label
                        for="airport-select-pickup"
                        class="block text-[11px] font-medium text-on-surface-variant mb-2"
                        >اختر المطار (نقطة الانطلاق)</label
                    >
                    <div class="relative w-full">
                        <select
                            id="airport-select-pickup"
                            bind:value={selectedAirport}
                            dir="rtl"
                            class="appearance-none w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 pr-10 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold border-r-[4px] border-r-primary"
                        >
                            <option value="" disabled selected hidden
                                >يرجى اختيار المطار</option
                            >
                            {#each iraqiAirports as airport}
                                <option value={airport}>{airport}</option>
                            {/each}
                        </select>
                        <span
                            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                            >flight_takeoff</span
                        >
                        <span
                            class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                            >expand_more</span
                        >
                    </div>
                </div>
            {:else}
                <div class="relative order-1">
                    <label
                        for="province-select-pickup"
                        class="block text-[11px] font-medium text-on-surface-variant mb-2"
                        >اختر محافظة الانطلاق</label
                    >
                    <div class="relative w-full mb-4">
                        <select
                            id="province-select-pickup"
                            bind:value={selectedProvince}
                            dir="rtl"
                            class="appearance-none w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 pr-10 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold border-r-[4px] border-r-primary"
                        >
                            <option value="" disabled selected hidden
                                >يرجى اختيار المحافظة</option
                            >
                            {#each governorates as gov}
                                <option value={gov}>{gov}</option>
                            {/each}
                        </select>
                        <span
                            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                            >my_location</span
                        >
                        <span
                            class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                            >expand_more</span
                        >
                    </div>

                    <label
                        for="pickup-map-to"
                        class="block text-[11px] font-medium text-on-surface-variant mb-2"
                        >اختر موقع المنزل على الخريطة</label
                    >
                    <LeafletMap
                        on:locationSelected={onLocationSelected}
                        height="240px"
                    />
                    {#if pickupLocation}
                        <div
                            class="mt-2 text-[10px] text-on-surface-variant font-bold bg-surface-container-low p-3 rounded-xl border border-outline-variant/5"
                        >
                            إحداثيات الموقع: {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(
                                4,
                            )}
                        </div>
                    {:else}
                        <div
                            class="mt-2 text-[10px] text-error font-bold flex items-center justify-end gap-1 px-1"
                        >
                            يرجى تحديد الموقع من الخريطة
                            <span class="material-symbols-outlined text-[14px]"
                                >warning</span
                            >
                        </div>
                    {/if}
                </div>
            {/if}

            <div class="w-full flex justify-center order-2 my-2 opacity-50">
                <span class="material-symbols-outlined text-on-surface-variant"
                    >arrow_downward</span
                >
            </div>

            {#if $bookingStore.serviceType === "From Airport"}
                <div class="relative order-3">
                    <label
                        for="province-select-dest"
                        class="block text-[11px] font-medium text-on-surface-variant mb-2"
                        >اختر محافظة الوصول</label
                    >
                    <div class="relative w-full mb-4">
                        <select
                            id="province-select-dest"
                            bind:value={selectedProvince}
                            dir="rtl"
                            class="appearance-none w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 pr-10 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold border-r-[4px] border-r-primary"
                        >
                            <option value="" disabled selected hidden
                                >يرجى اختيار المحافظة</option
                            >
                            {#each governorates as gov}
                                <option value={gov}>{gov}</option>
                            {/each}
                        </select>
                        <span
                            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                            >map</span
                        >
                        <span
                            class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                            >expand_more</span
                        >
                    </div>

                    <label
                        for="pickup-map-from"
                        class="block text-[11px] font-medium text-on-surface-variant mb-2"
                        >اختر موقع المنزل على الخريطة</label
                    >
                    <LeafletMap
                        on:locationSelected={onLocationSelected}
                        height="240px"
                    />
                    {#if pickupLocation}
                        <div
                            class="mt-2 text-[10px] text-on-surface-variant font-bold bg-surface-container-low p-3 rounded-xl border border-outline-variant/5"
                        >
                            إحداثيات الموقع: {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(
                                4,
                            )}
                        </div>
                    {:else}
                        <div
                            class="mt-2 text-[10px] text-error font-bold flex items-center justify-end gap-1 px-1"
                        >
                            يرجى تحديد الموقع من الخريطة
                            <span class="material-symbols-outlined text-[14px]"
                                >warning</span
                            >
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="relative order-3">
                    <label
                        for="airport-select-dropoff"
                        class="block text-[11px] font-medium text-on-surface-variant mb-2"
                        >اختر المطار (الوجهة)</label
                    >
                    <div class="relative w-full">
                        <select
                            id="airport-select-dropoff"
                            bind:value={selectedAirport}
                            dir="rtl"
                            class="appearance-none w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 pr-10 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold border-r-[4px] border-r-primary"
                        >
                            <option value="" disabled selected hidden
                                >يرجى اختيار المطار</option
                            >
                            {#each iraqiAirports as airport}
                                <option value={airport}>{airport}</option>
                            {/each}
                        </select>
                        <span
                            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                            >flight_land</span
                        >
                        <span
                            class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                            >expand_more</span
                        >
                    </div>
                </div>
            {/if}

            <div class="order-4 mt-4">
                <label
                    for="flight-number"
                    class="block text-[11px] font-medium text-on-surface-variant mb-2"
                    >رقم الرحلة أو ملاحظات السائق (اختياري)</label
                >
                <input
                    id="flight-number"
                    bind:value={flightNumber}
                    class="w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
                    placeholder="مثال: IA123 أو 'انتظرني عند البوابة'"
                    type="text"
                    dir="ltr"
                    style="text-align: right;"
                />
            </div>
        </div>
    </section>

    <div class="grid grid-cols-2 gap-4 w-full">
        <section
            class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 flex flex-col items-center"
        >
            <span class="material-symbols-outlined text-primary mb-1"
                >luggage</span
            >
            <span
                class="block text-[11px] font-bold text-on-surface-variant mb-3"
                >الحقائب</span
            >
            <div
                class="flex items-center justify-between w-full bg-surface-container-low rounded-2xl p-1.5 shadow-inner"
            >
                <button
                    on:click={decLuggage}
                    class="w-8 h-8 rounded-xl hover:bg-surface-container-highest flex items-center justify-center text-on-surface active:scale-95 transition-all"
                >
                    <span class="material-symbols-outlined text-sm">remove</span
                    >
                </button>
                <span class="font-bold text-sm w-4 text-center">{luggage}</span>
                <button
                    on:click={incLuggage}
                    class="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container active:scale-95 transition-all"
                >
                    <span class="material-symbols-outlined text-sm font-bold"
                        >add</span
                    >
                </button>
            </div>
        </section>

        <section
            class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 flex flex-col items-center"
        >
            <span class="material-symbols-outlined text-primary mb-1"
                >person</span
            >
            <span
                class="block text-[11px] font-bold text-on-surface-variant mb-3"
                >المسافرون</span
            >
            <div
                class="flex items-center justify-between w-full bg-surface-container-low rounded-2xl p-1.5 shadow-inner"
            >
                <button
                    on:click={decPassengers}
                    class="w-8 h-8 rounded-xl hover:bg-surface-container-highest flex items-center justify-center text-on-surface active:scale-95 transition-all"
                >
                    <span class="material-symbols-outlined text-sm">remove</span
                    >
                </button>
                <span class="font-bold text-sm w-4 text-center"
                    >{passengers}</span
                >
                <button
                    on:click={incPassengers}
                    class="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container active:scale-95 transition-all"
                >
                    <span class="material-symbols-outlined text-sm font-bold"
                        >add</span
                    >
                </button>
            </div>
        </section>
    </div>

    <section
        class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 w-full overflow-hidden"
    >
        <h2
            class="text-base font-bold mb-4 flex items-center justify-end gap-2"
        >
            وقت التوصيل
            <span class="material-symbols-outlined text-primary text-xl"
                >schedule</span
            >
        </h2>

        <div class="flex flex-col gap-4">
            <div class="text-right">
                <label
                    for="date-input"
                    class="block text-[11px] font-medium text-on-surface-variant mb-2"
                    >تاريخ الرحلة (يوم، شهر، سنة)</label
                >
                <!-- Native date picker allows full calendar selection with year/month/day -->
                <input
                    id="date-input"
                    type="date"
                    bind:value={dateInput}
                    class="w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
                    dir="ltr"
                    style="text-align: right; color-scheme: dark;"
                />
            </div>

            <div class="text-right">
                <label
                    for="time-input"
                    class="block text-[11px] font-medium text-on-surface-variant mb-2"
                    >وقت الرحلة</label
                >
                <input
                    id="time-input"
                    type="time"
                    bind:value={timeInput}
                    class="w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none"
                    dir="ltr"
                    style="text-align: right; color-scheme: dark;"
                />
            </div>
        </div>
    </section>

    <div class="pt-2 w-full">
        <button
            type="button"
            on:click={handleContinue}
            class="w-full btn-premium py-5 text-lg {!selectedAirport ||
            !pickupLocation ||
            !selectedProvince
                ? 'opacity-50 cursor-not-allowed border border-outline-variant/20 shadow-none grayscale filter'
                : ''}"
        >
            <span>متابعة لاختيار المركبة</span>
            <span class="material-symbols-outlined text-[20px] font-bold">arrow_back</span>
        </button>
        <p
            class="text-center text-on-surface-variant text-[10px] mt-4 opacity-80 font-medium"
        >
            بمتابعتك، أنت توافق على شروط الخدمة والخصوصية
        </p>
    </div>
</div>
