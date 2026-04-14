<script lang="ts">
  import TopBar from './lib/components/TopBar.svelte';
  import BottomNav from './lib/components/BottomNav.svelte';
  import { currentRoute, isUIVisible } from './lib/stores/navigationStore';
  import { isAuthenticated } from './lib/stores/authStore';
  import { skipAuth } from './lib/config/features';

  import Home from './routes/Home.svelte';
  import Marketplace from './routes/Marketplace.svelte';
  import BookingDetails from './routes/BookingDetails.svelte';
  import SelectCar from './routes/SelectCar.svelte';
  import BookingStatus from './routes/BookingStatus.svelte';
  import Profile from './routes/Profile.svelte';
  import Login from './routes/Login.svelte';
  import Register from './routes/Register.svelte';
  import Payment from './routes/Payment.svelte';
  import History from './routes/History.svelte';

  // إعادة التفعيل: احذف VITE_SKIP_AUTH أو اجعلها ليست `true` في `.env`
  $: if (!skipAuth && !$isAuthenticated && $currentRoute !== 'login' && $currentRoute !== 'register') {
    currentRoute.set('login');
  }
</script>

<!-- Mobile Device Emulator Wrapper -->
<div class="fixed inset-0 bg-[#1D1B1C] flex items-center justify-center font-sans antialiased selection:bg-primary/30">
    <!-- Abstract background elements for premium feel -->
    <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="w-full h-full sm:w-[420px] sm:h-[92vh] sm:rounded-[48px] bg-surface text-on-surface flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-0 sm:border-[12px] sm:border-[#2A2829]">
      
      {#if $currentRoute !== 'login' && $currentRoute !== 'register' && $isUIVisible}
        <TopBar />
      {/if}

      <!-- Main Scrollable Area -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar {(($currentRoute === 'login' || $currentRoute === 'register') ? '' : 'pt-[88px] pb-[100px] px-5')}">
        {#if $currentRoute === 'login'}
          <Login />
        {:else if $currentRoute === 'register'}
          <Register />
        {:else if $currentRoute === 'home'}
          <Home />
        {:else if $currentRoute === 'marketplace'}
          <Marketplace />
        {:else if $currentRoute === 'booking-details'}
          <BookingDetails />
        {:else if $currentRoute === 'select-car'}
          <SelectCar />
        {:else if $currentRoute === 'booking-status'}
          <BookingStatus />
        {:else if $currentRoute === 'payment'}
          <Payment />
        {:else if $currentRoute === 'profile'}
          <Profile />
        {:else if $currentRoute === 'history'}
          <History />
        {/if}
      </div>

      {#if $currentRoute !== 'login' && $currentRoute !== 'register' && $isUIVisible}
        <BottomNav />
      {/if}
      
      <!-- Home Indicator for Mobile feel -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-on-surface/10 rounded-full sm:block hidden"></div>
    </div>
</div>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
</svelte:head>
