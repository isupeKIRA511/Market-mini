<script lang="ts">
  import { currentRoute } from '../stores/navigationStore';
  // language is no longer needed here as English is removed

  const i18n: any = {
    ar: { home: 'الرئيسية', history: 'السجل', profile: 'الحساب' }
  };

  $: t = i18n.ar;
  $: navItems = [
    { id: 'home', icon: 'home', text: t.home },
    { id: 'history', icon: 'history', text: t.history },
    { id: 'profile', icon: 'person', text: t.profile }
  ];

  function handleNavigate(routeId: any) {
      currentRoute.set(routeId);
  }

  function isItemActive(itemId: string, current: string) {
       if (itemId === 'home') return ['home', 'marketplace', 'booking-details', 'select-car'].includes(current);
       if (itemId === 'history') return current === 'history';
       if (itemId === 'profile') return current === 'profile';
       return false;
  }
</script>

<nav class="absolute bottom-0 left-0 w-full z-50 flex flex-row-reverse justify-around items-center px-1 pb-6 pt-3 bg-surface-container-high dark:bg-[#1D1B1C] sm:rounded-b-[32px] rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] overflow-x-hidden">
  {#each navItems as item}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div 
        role="button"
        tabindex="0"
        on:click={() => handleNavigate(item.id)}
        class="transition-transform duration-200 active:scale-90 flex flex-col items-center justify-center rounded-[18px] px-3 py-2 cursor-pointer
        {isItemActive(item.id, $currentRoute) ? 'bg-[#FAC445] text-[#1D1B1C]' : 'text-on-surface-variant/70 hover:text-on-surface dark:text-white/70 dark:hover:text-white'}"
    >
      <div class="mb-1">
          {#if item.id === 'home'}
               <svg width="20" height="20" viewBox="0 0 24 24" fill={isItemActive(item.id, $currentRoute) ? "#1D1B1C" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
               </svg>
          {:else if item.id === 'history'}
               <svg width="20" height="20" viewBox="0 0 24 24" fill={isItemActive(item.id, $currentRoute) ? "#1D1B1C" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
          {:else if item.id === 'history'}
               <svg width="20" height="20" viewBox="0 0 24 24" fill={isItemActive(item.id, $currentRoute) ? "#1D1B1C" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="10" width="18" height="10" rx="2" ry="2"></rect>
                  <path d="M3 10L6 4h12l3 6"></path>
                  <circle cx="7.5" cy="16.5" r="1.5" fill={isItemActive(item.id, $currentRoute) ? "white" : "currentColor"} stroke="none"></circle>
                  <circle cx="16.5" cy="16.5" r="1.5" fill={isItemActive(item.id, $currentRoute) ? "white" : "currentColor"} stroke="none"></circle>
               </svg>
          {:else if item.id === 'profile'}
               <svg width="20" height="20" viewBox="0 0 24 24" fill={isItemActive(item.id, $currentRoute) ? "#1D1B1C" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
               </svg>
          {/if}
      </div>
      <span class="font-['Inter'] text-[9px] font-bold">{item.text}</span>
    </div>
  {/each}
</nav>
