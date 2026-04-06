<script lang="ts">
  import { onMount } from 'svelte';
  import { currentRoute } from '../lib/stores/navigationStore';
  import { bookingStore } from '../lib/stores/bookingStore';
  import LeafletMap from '../lib/components/LeafletMap.svelte';
  import { getData, postData } from '../lib/api'; 

  let iraqiAirports: string[] = [];
  let selectedAirport = '';
  let isLoadingAirports = true;

  onMount(async () => {
      try {
          const data = await getData('/airports'); 
          iraqiAirports = data; 
      } catch (error) {
          iraqiAirports = [
              'مطار بغداد الدولي',
              'مطار أربيل الدولي',
              'مطار البصرة الدولي',
              'مطار النجف الأشرف الدولي',
              'مطار السليمانية الدولي',
              'مطار الناصرية الدولي',
              'مطار كركوك الدولي'
          ];
      } finally {
          isLoadingAirports = false;
      }
  });

  let pickupLocation: { lat: number, lng: number } | null = null;
  let flightNumber = '';
  
  let luggage = 3;
  let passengers = 2;

  function incLuggage() { luggage++; }
  function decLuggage() { if (luggage > 0) luggage--; }

  function incPassengers() { passengers++; }
  function decPassengers() { if (passengers > 1) passengers--; }

  const dates = [
      { d: 'اليوم', n: '24' },
      { d: 'الأحد', n: '25' },
      { d: 'الاثنين', n: '26' },
      { d: 'الثلاثاء', n: '27' },
      { d: 'الأربعاء', n: '28' },
      { d: 'الخميس', n: '29' }
  ];
  let selectedDate = '24';

  let hr = 9;
  let min = 30;
  let isAm = true;

  function incHr() { hr = hr === 12 ? 1 : hr + 1; }
  function decHr() { hr = hr === 1 ? 12 : hr - 1; }
  
  function incMin() { min = (min + 1) % 60; }
  function decMin() { min = min === 0 ? 59 : min - 1; }

  $: formatNum = (num: number) => num < 10 ? `0${num}` : `${num}`;

  async function handleContinue() {
      if (!selectedAirport || !pickupLocation) {
          alert('يرجى تحديد كل من المطار ونقطة الموقع على الخريطة أولاً.');
          return;
      }

      const payload = {
          pickupLocation: `${pickupLocation?.lat}, ${pickupLocation?.lng}`,
          airport: selectedAirport,
          flightNumber: flightNumber,
          passengersCount: passengers,
          luggageCount: luggage,
          dateTime: `${selectedDate} - ${formatNum(hr)}:${formatNum(min)} ${isAm ? 'صباحاً' : 'مساءً'}`
      };

      try {
          const response = await postData('/api/bookings', payload);
          
          bookingStore.update(b => ({
              ...b,
              ...payload,
              bookingId: response.id 
          }));
          
          currentRoute.set('select-car');

      } catch (error) {
          alert('فشل الاتصال بالسيرفر. تأكد إن الدوت نت شغال والبورت صحيح.');
      }
  }

  function onLocationSelected(e: any) {
      pickupLocation = { ...pickupLocation, lat: e.detail.lat, lng: e.detail.lng };
  }
</script>

<div class="space-y-6 flex flex-col items-center">
    <div class="flex flex-row justify-between items-center mb-6 px-1 w-full mt-2">
        <div class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm transition-transform scale-110">1</div>
            <span class="text-[10px] font-bold text-on-surface">التفاصيل</span>
        </div>
        <div class="flex-1 h-[2px] bg-primary mx-1 opacity-20"></div>
        <div class="flex flex-col items-center gap-2 opacity-50">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">2</div>
            <span class="text-[10px] font-medium text-on-surface-variant">المركبة</span>
        </div>
        <div class="flex-1 h-[2px] bg-outline-variant mx-1 opacity-20"></div>
        <div class="flex flex-col items-center gap-2 opacity-50">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">3</div>
            <span class="text-[10px] font-medium text-on-surface-variant">الدفع</span>
        </div>
    </div>

    <section class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 w-full relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-32 h-32 bg-primary-container/20 rounded-full blur-[30px] pointer-events-none"></div>

        <h2 class="text-base font-bold mb-4 flex items-center gap-2 justify-end relative z-10">
            {#if $bookingStore.serviceType === 'From Airport'}
                تحديد المطار وموقع الوصول
            {:else}
                تحديد موقع الانطلاق والمطار
            {/if}
            <span class="material-symbols-outlined text-primary text-xl">location_on</span>
        </h2>
        
        <div class="space-y-4 text-right relative z-10 flex flex-col">
            {#if $bookingStore.serviceType === 'From Airport'}
                <div class="relative order-1">
                    <label for="airport-select-pickup" class="block text-[11px] font-medium text-on-surface-variant mb-2">اختر المطار (نقطة الانطلاق)</label>
                    <div class="relative w-full">
                        <select id="airport-select-pickup" bind:value={selectedAirport} dir="rtl" class="appearance-none w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 pr-10 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold border-r-[4px] border-r-primary">
                            <option value="" disabled selected hidden>يرجى اختيار المطار</option>
                            {#each iraqiAirports as airport}
                                <option value={airport}>{airport}</option>
                            {/each}
                        </select>
                        <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">flight_takeoff</span>
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                </div>
            {:else}
                <div class="relative order-1">
                    <label for="pickup-map" class="block text-[11px] font-medium text-on-surface-variant mb-2">اختر نقطة الانطلاق في بغداد على الخريطة</label>
                    <LeafletMap on:locationSelected={onLocationSelected} height="240px" />
                    {#if pickupLocation}
                    <div class="mt-2 text-[10px] text-on-surface-variant font-bold bg-surface-container-low p-3 rounded-xl border border-outline-variant/5">
                        إحداثيات الموقع: {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(4)}
                    </div>
                    {:else}
                    <div class="mt-2 text-[10px] text-error font-bold flex items-center justify-end gap-1 px-1">
                        يرجى تحديد الموقع من الخريطة
                        <span class="material-symbols-outlined text-[14px]">warning</span>
                    </div>
                    {/if}
                </div>
            {/if}

            <div class="w-full flex justify-center order-2 my-2 opacity-50">
                <span class="material-symbols-outlined text-on-surface-variant">arrow_downward</span>
            </div>

            {#if $bookingStore.serviceType === 'From Airport'}
                <div class="relative order-3">
                    <label for="pickup-map" class="block text-[11px] font-medium text-on-surface-variant mb-2">اختر نقطة الوصول على الخريطة</label>
                    <LeafletMap on:locationSelected={onLocationSelected} height="240px" />
                    {#if pickupLocation}
                    <div class="mt-2 text-[10px] text-on-surface-variant font-bold bg-surface-container-low p-3 rounded-xl border border-outline-variant/5">
                        إحداثيات الموقع: {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(4)}
                    </div>
                    {:else}
                    <div class="mt-2 text-[10px] text-error font-bold flex items-center justify-end gap-1 px-1">
                        يرجى تحديد الموقع من الخريطة
                        <span class="material-symbols-outlined text-[14px]">warning</span>
                    </div>
                    {/if}
                </div>
            {:else}
                <div class="relative order-3">
                    <label for="airport-select-dropoff" class="block text-[11px] font-medium text-on-surface-variant mb-2">اختر المطار (نقطة الوصول)</label>
                    <div class="relative w-full">
                        <select id="airport-select-dropoff" bind:value={selectedAirport} dir="rtl" class="appearance-none w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 pr-10 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold border-r-[4px] border-r-primary">
                            <option value="" disabled selected hidden>يرجى اختيار المطار</option>
                            {#each iraqiAirports as airport}
                                <option value={airport}>{airport}</option>
                            {/each}
                        </select>
                        <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">flight_land</span>
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                </div>
            {/if}

            <div class="order-4 mt-4">
                <label for="flight-number" class="block text-[11px] font-medium text-on-surface-variant mb-2">رقم الرحلة أو ملاحظات السائق (اختياري)</label>
                <input id="flight-number" bind:value={flightNumber} class="w-full bg-surface-container-low outline-none border-none rounded-2xl py-4 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40" placeholder="مثال: IA123 أو 'انتظرني عند البوابة'" type="text" dir="ltr" style="text-align: right;">
            </div>
        </div>
    </section>

    <div class="grid grid-cols-2 gap-4 w-full">
        <section class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 flex flex-col items-center">
            <span class="material-symbols-outlined text-primary mb-1">luggage</span>
            <span class="block text-[11px] font-bold text-on-surface-variant mb-3">الحقائب</span>
            <div class="flex items-center justify-between w-full bg-surface-container-low rounded-2xl p-1.5 shadow-inner">
                <button on:click={decLuggage} class="w-8 h-8 rounded-xl hover:bg-surface-container-highest flex items-center justify-center text-on-surface active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-sm">remove</span>
                </button>
                <span class="font-bold text-sm w-4 text-center">{luggage}</span>
                <button on:click={incLuggage} class="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-sm font-bold">add</span>
                </button>
            </div>
        </section>

        <section class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 flex flex-col items-center">
            <span class="material-symbols-outlined text-primary mb-1">person</span>
            <span class="block text-[11px] font-bold text-on-surface-variant mb-3">المسافرون</span>
            <div class="flex items-center justify-between w-full bg-surface-container-low rounded-2xl p-1.5 shadow-inner">
                <button on:click={decPassengers} class="w-8 h-8 rounded-xl hover:bg-surface-container-highest flex items-center justify-center text-on-surface active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-sm">remove</span>
                </button>
                <span class="font-bold text-sm w-4 text-center">{passengers}</span>
                <button on:click={incPassengers} class="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-sm font-bold">add</span>
                </button>
            </div>
        </section>
    </div>

    <section class="bg-surface-container-lowest p-5 rounded-[24px] shadow-sm border border-outline-variant/10 w-full overflow-hidden">
        <h2 class="text-base font-bold mb-4 flex items-center justify-end gap-2">
            وقت التوصيل
            <span class="material-symbols-outlined text-primary text-xl">schedule</span>
        </h2>
        
        <div class="flex flex-col gap-6">
            <div class="flex flex-row gap-3 overflow-x-auto pb-2 scroll-smooth hide-scrollbar select-none">
                {#each dates as day}
                <div 
                    role="button"
                    tabindex="0"
                    on:click={() => selectedDate = day.n}
                    class="flex-shrink-0 w-16 h-20 rounded-[18px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 active:scale-95
                           {selectedDate === day.n ? 'bg-primary text-on-primary shadow-sm border border-primary/20 scale-105' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}"
                >
                    <span class="text-[10px] font-bold">{day.d}</span>
                    <span class="text-lg font-black mt-1">{day.n}</span>
                </div>
                {/each}
            </div>

            <div class="flex justify-center flex-row items-center gap-1 bg-surface-container-low py-4 px-2 rounded-2xl font-sans relative border border-outline-variant/5 shadow-inner" dir="ltr">
               <div class="flex flex-col items-center gap-2">
                    <button on:click={incHr} class="text-on-surface-variant hover:text-primary active:scale-95"><span class="material-symbols-outlined">expand_less</span></button>
                    <div class="text-3xl font-black w-14 text-center text-on-surface bg-white rounded-xl py-1 drop-shadow-sm">{formatNum(hr)}</div>
                    <button on:click={decHr} class="text-on-surface-variant hover:text-primary active:scale-95"><span class="material-symbols-outlined">expand_more</span></button>
               </div>
               
               <span class="text-2xl font-black text-on-surface-variant/40 pb-2">:</span>
               
               <div class="flex flex-col items-center gap-2">
                    <button on:click={incMin} class="text-on-surface-variant hover:text-primary active:scale-95"><span class="material-symbols-outlined">expand_less</span></button>
                    <div class="text-3xl font-black w-14 text-center text-on-surface bg-white rounded-xl py-1 drop-shadow-sm">{formatNum(min)}</div>
                    <button on:click={decMin} class="text-on-surface-variant hover:text-primary active:scale-95"><span class="material-symbols-outlined">expand_more</span></button>
               </div>
               
               <div class="flex flex-col gap-2 ml-4 border border-outline-variant/20 rounded-xl p-1 bg-surface-container-lowest">
                   <button on:click={() => isAm = true} class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all {isAm ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}">صباحاً</button>
                   <button on:click={() => isAm = false} class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all {!isAm ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}">مساءً</button>
               </div>
            </div>
        </div>
    </section>

    <div class="pt-2 w-full">
        <button on:click={handleContinue} class="w-full btn-premium py-5 text-lg {(!selectedAirport || !pickupLocation) ? 'opacity-50 cursor-not-allowed border border-outline-variant/20 shadow-none grayscale filter' : ''}">
            <span>متابعة لختيار المركبة</span>
            <span class="material-symbols-outlined text-[20px] font-bold">arrow_back</span>
        </button>
        <p class="text-center text-on-surface-variant text-[10px] mt-4 opacity-80 font-medium">
            بمتابعتك، أنت توافق على شروط الخدمة والخصوصية
        </p>
    </div>
</div>

<style>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none; 
  scrollbar-width: none; 
}
</style>