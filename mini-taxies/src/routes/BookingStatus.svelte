<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { currentRoute } from '../lib/stores/navigationStore';
  import { bookingStore } from '../lib/stores/bookingStore';
  import { getData } from '../lib/api';

  let mapContainer: HTMLElement;
  let driverDistanceStr = '4 دقائق';
  
  let map: any;
  let interval: any;

  let driverInfo = {
      name: 'جاري البحث عن سائق...',
      car: '...',
      plate: '...',
      rating: '0.0'
  };

  onMount(() => {
    (async () => {
      if ($bookingStore.bookingId) {
          try {
              const data = await getData(`/api/bookings/${$bookingStore.bookingId}/driver`);
              driverInfo = data;
          } catch (error) {
              driverInfo = { name: 'أحمد العتيبي', car: 'تويوتا كامري 2024', plate: 'أ ب ج 1234', rating: '4.9' };
          }
      }

      const L = (await import('leaflet'));
      await import('leaflet/dist/leaflet.css');

      let userLat = 33.3130;
      let userLng = 44.3410;
      
      if ($bookingStore.pickupLocation) {
          const coords = $bookingStore.pickupLocation.split(',');
          userLat = parseFloat(coords[0]);
          userLng = parseFloat(coords[1]);
      }

      map = L.map(mapContainer, { 
          zoomControl: false, 
          attributionControl: false 
      }).setView([userLat, userLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
      }).addTo(map);

      const taxiIcon = L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204369.png',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
      });

      const userIcon = L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
      });

      const driverMarker = L.marker([userLat - 0.05, userLng - 0.1], { icon: taxiIcon }).addTo(map);
      const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

      let lat = userLat - 0.05;
      let lng = userLng - 0.1;
      
      interval = setInterval(() => {
          lat += 0.005;
          lng += 0.01;
          driverMarker.setLatLng([lat, lng]);
          
          if (lat >= userLat - 0.005) {
              driverDistanceStr = 'وصل السائق!';
              clearInterval(interval);
          }
      }, 2000);

      const bounds = L.latLngBounds([driverMarker.getLatLng(), userMarker.getLatLng()]);
      map.fitBounds(bounds, { padding: [40, 40] });
    })();
  });

  onDestroy(() => {
      if (interval) clearInterval(interval);
      if (map) map.remove();
  });
</script>

<div class="space-y-6 flex flex-col items-center pt-4">
    <section class="flex flex-col items-center justify-center py-8 bg-surface-container-lowest w-full rounded-3xl shadow-sm border border-outline-variant/10 text-center">
        <div class="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-4 text-on-primary-container shadow-lg shadow-primary-container/20">
            <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        </div>
        <h2 class="text-2xl font-black text-on-surface tracking-tight mb-2">تم تأكيد الحجز</h2>
        <p class="text-on-surface-variant font-medium text-sm">رقم الحجز: <span class="text-primary font-bold">{$bookingStore.bookingId || 'جاري المعالجة'}</span></p>
    </section>

    <section class="relative h-64 w-full rounded-[24px] overflow-hidden shadow-sm group border border-outline-variant/10 bg-surface-container">
        <div bind:this={mapContainer} class="w-full h-full z-0"></div>
        
        <div class="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent pointer-events-none z-10"></div>
        <div class="absolute bottom-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg z-20">
            <span class="text-[10px] font-bold text-on-surface">
                {driverDistanceStr === 'وصل السائق!' ? driverDistanceStr : `السائق يقترب (${driverDistanceStr})`}
            </span>
            {#if driverDistanceStr !== 'وصل السائق!'}
               <span class="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
            {:else}
               <span class="material-symbols-outlined text-[14px] text-green-600">check_circle</span>
            {/if}
        </div>
    </section>

    {#if driverDistanceStr === 'وصل السائق!'}
    <div class="w-full bg-primary/10 p-5 rounded-[24px] border border-primary/20 text-right space-y-3">
        <h3 class="font-black text-on-surface text-sm">كيف كانت تجربتك؟</h3>
        <div class="flex justify-end gap-2">
            {#each [1,2,3,4,5] as star}
                <button class="material-symbols-outlined text-primary text-2xl hover:scale-110 transition-transform">star</button>
            {/each}
        </div>
        <button class="w-full bg-primary text-[#1D1B1C] font-bold py-2 rounded-xl text-xs">إرسال التقييم</button>
    </div>
    {/if}

    <div class="w-full flex flex-col gap-4 text-right z-10">
        <div class="bg-surface-container-low p-5 rounded-[24px] flex flex-row-reverse gap-4 border border-outline-variant/5 shadow-[0_2px_12px_rgba(29,27,28,0.02)]">
            <div class="flex flex-col items-center pt-1">
                <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1;">location_on</span>
                <div class="w-0.5 h-10 border-l-2 border-dotted border-outline-variant my-1"></div>
                <span class="material-symbols-outlined text-tertiary text-lg" style="font-variation-settings: 'FILL' 1;">near_me</span>
            </div>
            <div class="flex flex-col gap-6 flex-1 text-right">
                <div>
                    <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-loose">نقطة الانطلاق</p>
                    <p class="text-sm font-bold text-on-surface">{$bookingStore.airport || 'موقع الانطلاق المحدد'}</p>
                </div>
                <div>
                    <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-loose">وجهة الوصول</p>
                    <p class="text-sm font-bold text-on-surface">موقع الوصول المحدد</p>
                </div>
            </div>
             <div class="flex flex-col items-end pt-1 opacity-0"> 
                <span class="material-symbols-outlined text-lg">location_on</span>
            </div>
        </div>

        <div class="bg-surface-container-lowest p-5 rounded-[24px] flex justify-between items-center border border-outline-variant/10 shadow-sm">
            <span class="material-symbols-outlined text-on-surface-variant">calendar_today</span>
            <div>
                <p class="text-[10px] text-on-surface-variant font-bold text-right mb-1">التاريخ والوقت</p>
                <p class="text-sm font-bold">{$bookingStore.dateTime || 'غير محدد'}</p>
            </div>
        </div>

        <div class="bg-primary-container p-5 rounded-[24px] flex justify-between items-center shadow-[0_4px_20px_rgba(250,196,69,0.25)]">
            <span class="material-symbols-outlined text-on-primary-container text-4xl">payments</span>
             <div>
                <p class="text-[10px] text-on-primary-container font-bold text-right mb-1">إجمالي التكلفة</p>
                <p class="text-2xl font-black text-on-primary-container text-right">جاري الحساب...</p>
            </div>
        </div>
    </div>

    <section class="w-full bg-surface-container-low p-4 rounded-3xl flex items-center justify-between border border-outline-variant/10 mb-20 shadow-[0_4px_12px_rgba(29,27,28,0.02)] z-10">
        <div class="flex gap-2">
            <button class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-all hover:bg-primary/20 active:scale-90 shadow-sm border border-primary/10">
                <span class="material-symbols-outlined text-[20px]">call</span>
            </button>
        </div>
        
        <div class="flex items-center gap-4 flex-row-reverse text-right">
            <div class="relative shrink-0">
                <img class="w-14 h-14 rounded-2xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU_rM1-59cgOPJLwtFZMN91lFQ_C7u8eQDWSK4uMfXIwwc4GXc-L3GfYYaDdLNqSTD4KJBdHY3gHXrt6W1dGkznMk0xNw34yvnXj5I4C4X_guAVNzXUqQZlK9vxFfnTZUN9Mz65mMfK2g2TCV5ERt2ESeCWpTprkMuFcqHbdk1BEPdaMn_xRzCb4lGB7ELzzwt9jp2jL5l1gbSsg4W5FnP7sIyQw_S3F2PndKtXb87CE6KwdQSSjFTcho62kOknQWh82b2WOZTR746" alt="Driver"/>
                <div class="absolute -bottom-1 -left-1 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{driverInfo.rating} ★</div>
            </div>
            <div>
                <h3 class="font-bold text-sm">{driverInfo.name}</h3>
                <p class="text-[10px] text-on-surface-variant relative top-0.5 mt-0.5">{driverInfo.car} • {driverInfo.plate}</p>
            </div>
        </div>
    </section>
</div>

<div class="fixed bottom-24 left-6 z-40 text-on-primary">
    <button class="bg-[#1D1B1C] text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xl shadow-black/40 hover:scale-105 active:scale-95 transition-all font-bold text-sm">
        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">chat</span>
        <span>تواصل مع السائق</span>
    </button>
</div>