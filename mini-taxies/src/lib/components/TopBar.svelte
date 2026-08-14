<script lang="ts">
  import { currentRoute } from '../stores/navigationStore';
  import { bookingStore } from '../stores/bookingStore';
  import { get } from 'svelte/store';

  $: title = getTitle($currentRoute);
  
  function getTitle(route: string) {
    switch (route) {
        case 'home': return 'الرئيسية';
        case 'marketplace': return 'سوق سيارات الأجرة';
        case 'booking-details': return 'تفاصيل الحجز';
        case 'select-car': return 'خدمة المطار';
        case 'payment': return 'الدفع وتأكيد الحجز';
        case 'history': return 'سجل الرحلات';
        case 'profile': return 'الحساب الشخصي';
        default: return 'الرئيسية';
    }
  }

  function handleBack() {
    if ($currentRoute === 'marketplace') currentRoute.set('home');
    else if ($currentRoute === 'booking-details') currentRoute.set('home');
    else if ($currentRoute === 'select-car') currentRoute.set('booking-details');
    else if ($currentRoute === 'payment') {
      // من الدفع: إذا كانت الخدمة بين المحافظات يرجع للسوق، وإلا يرجع لاختيار السيارة
      const booking = get(bookingStore);
      if (booking.serviceType === 'Inter-city') {
        currentRoute.set('marketplace');
      } else {
        currentRoute.set('select-car');
      }
    }
    else if ($currentRoute === 'history') currentRoute.set('home');
  }
</script>

<header class="bg-surface/92 backdrop-blur-xl flex flex-row-reverse justify-between items-center w-full px-5 py-5 absolute top-0 left-0 z-50 border-b border-outline-variant/10">
    <div></div>
    
    <div class="flex items-center gap-4">
        {#if $currentRoute !== 'home'}
            <button on:click={handleBack} class="transition-all duration-300 active:scale-95 text-primary">
                 <span class="material-symbols-outlined">arrow_forward</span>
            </button>
        {/if}
        <h1 class="font-['Inter'] font-bold text-2xl text-on-surface">{title}</h1>
    </div>
</header>
