<script lang="ts">
  import { currentRoute } from '../stores/navigationStore';

  $: title = getTitle($currentRoute);
  
  function getTitle(route: string) {
    switch (route) {
        case 'home': return 'الرئيسية';
        case 'marketplace': return 'سوق سيارات الأجرة';
        case 'booking-details': return 'تفاصيل الحجز';
        case 'select-car': return 'اختر نوع السيارة';
        case 'payment': return 'الدفع وتأكيد الحجز';
        case 'booking-status': return 'تتبع الرحلة';
        case 'wallet': return 'المحفظة';
        case 'profile': return 'الحساب الشخصي';
        default: return 'الرئيسية';
    }
  }

  function handleBack() {
    if ($currentRoute === 'marketplace') currentRoute.set('home');
    else if ($currentRoute === 'booking-details') currentRoute.set('home');
    else if ($currentRoute === 'select-car') currentRoute.set('booking-details');
    else if ($currentRoute === 'payment') currentRoute.set('select-car');
    else if ($currentRoute === 'booking-status') currentRoute.set('home');
  }
</script>

<header class="bg-surface flex flex-row-reverse justify-between items-center w-full px-5 py-5 absolute top-0 left-0 z-50">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border-2 border-primary">
            <img class="w-full h-full object-cover" 
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSubXzNnZYQgADtCsw5loAjVBwsDQ29rIAETsuqeWve0cY0yq8VMpt0JaVB9_W8Hq-Q6zRz3AQOUtnKrktEezoOW7xUSE4CPJOooAlErp8rI7dyLFB8A57Ht-Na0WW1c60qX-O6vq7qqJAhaVhRyDqmKlf3foAjjCSaXzY-ju-SId9inyl5DXjn_plph7aY_k6EGThVlnyuYt3EcqymSA2rXwUT049PKpwQjSrzGxD04wyPCLrOCV0JOibw0v1HZMyzLyZM99klR-Y" 
                 alt="Profile">
        </div>
    </div>
    
    <div class="flex items-center gap-4">
        {#if $currentRoute !== 'home'}
            <button on:click={handleBack} class="transition-all duration-300 active:scale-95 text-primary">
                 <span class="material-symbols-outlined">arrow_forward</span>
            </button>
        {/if}
        <h1 class="font-['Inter'] font-bold text-2xl text-on-surface">{title}</h1>
    </div>
</header>
