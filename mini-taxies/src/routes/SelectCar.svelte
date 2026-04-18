<script lang="ts">
  import { currentRoute } from '../lib/stores/navigationStore';
  import { bookingStore } from '../lib/stores/bookingStore';
  import FilterAndSort from '../lib/components/FilterAndSort.svelte';
  
  let selectedCar = 'sedan';
  let activeTab = 'all';

  $: showSedan = activeTab === 'all' || activeTab === 'vip';
  $: showSuv = activeTab === 'all' || activeTab === 'family';
  $: showVan = activeTab === 'all' || activeTab === 'family';
  $: showSpecial = activeTab === 'all' || activeTab === 'special';

  function setTab(tab: string) {
      activeTab = tab;
      if (tab === 'special') selectedCar = 'special';
      else if (tab === 'family') selectedCar = 'suv';
      else if (tab === 'vip') selectedCar = 'sedan';
  }

  function handleContinue() {
      // حفظ نوع السيارة بالستور قبل الانتقال لصفحة الدفع
      bookingStore.update(b => ({ ...b, carType: selectedCar }));
      currentRoute.set('payment');
  }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center mb-6 px-2 mt-2">
        <div class="flex flex-col items-center gap-2 opacity-40">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">1</div>
            <span class="text-[10px] font-medium text-on-surface-variant">التفاصيل</span>
        </div>
        <div class="flex-1 h-[2px] bg-primary mx-1"></div>
        <div class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">2</div>
            <span class="text-[10px] font-medium text-on-surface">المركبة</span>
        </div>
        <div class="flex-1 h-[2px] bg-outline-variant mx-1 opacity-20"></div>
        <div class="flex flex-col items-center gap-2 opacity-40">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm">3</div>
            <span class="text-[10px] font-medium text-on-surface-variant">الدفع</span>
        </div>
    </div>
    
    <section class="bg-surface-container-low rounded-xl p-5 mb-8 flex flex-col gap-4 text-right">
        <div class="flex flex-row items-start gap-4">
            <div class="flex flex-col gap-4 flex-1">
                <div>
                    <p class="text-[10px] text-on-surface-variant mb-1">نقطة الانطلاق</p>
                    <p class="font-bold text-sm text-on-surface">مطار بغداد الدولي، صالة المسافرين</p>
                </div>
                <div>
                    <p class="text-[10px] text-on-surface-variant mb-1">وجهة الوصول</p>
                    <p class="font-bold text-sm text-on-surface">فندق بابل، منطقة الكرادة</p>
                </div>
            </div>
            <div class="flex flex-col items-center gap-1 pt-1">
                <div class="w-2.5 h-2.5 rounded-full bg-primary"></div>
                <div class="w-0.5 h-10 border-r-2 border-dotted border-outline-variant"></div>
                <div class="w-2.5 h-2.5 rounded-full border-2 border-primary"></div>
            </div>
        </div>
    </section>

    <FilterAndSort />

    <div>
        <h2 class="text-xl font-black mb-4 text-right">الشركات وأنواع السيارات</h2>
        
        <div class="flex flex-row gap-2 mb-4 overflow-x-auto no-scrollbar pb-2" dir="rtl">
            <button on:click={() => setTab('all')} class="{activeTab === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'} font-bold text-[11px] px-4 py-2 rounded-xl whitespace-nowrap transition-colors">الكل</button>
            <button on:click={() => setTab('vip')} class="{activeTab === 'vip' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'} font-bold text-[11px] px-4 py-2 rounded-xl whitespace-nowrap transition-colors">VIP</button>
            <button on:click={() => setTab('family')} class="{activeTab === 'family' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'} font-bold text-[11px] px-4 py-2 rounded-xl whitespace-nowrap transition-colors">عائلية / باص</button>
            <button on:click={() => setTab('special')} class="{activeTab === 'special' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'} font-bold text-[11px] px-4 py-2 rounded-xl whitespace-nowrap transition-colors">احتياجات خاصة</button>
        </div>
        
        <div class="grid grid-cols-1 gap-4">
            {#if showSedan}
            <button on:click={() => selectedCar = 'sedan'} class="relative w-full text-right overflow-hidden {selectedCar === 'sedan' ? 'bg-surface-container-lowest ring-2 ring-primary shadow-lg' : 'bg-surface-container-low hover:bg-surface-container'} rounded-xl p-1 transition-all duration-300 active:scale-95">
                <div class="flex flex-row items-center gap-4 p-3 font-sans">
                    <div class="w-1/2 text-right">
                        <span class="inline-block bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">اقتصادية - ٤ راكب</span>
                        <h3 class="text-base font-bold text-on-surface">كيا سيراتو / تويوتا</h3>
                        <div class="flex flex-row justify-start items-center gap-2 mt-1 text-on-surface-variant">
                            <span class="material-symbols-outlined text-xs">person</span>
                            <span class="text-[10px]">٤ ركاب</span>
                            <span class="material-symbols-outlined text-xs">luggage</span>
                            <span class="text-[10px]">٣ حقائب</span>
                        </div>
                        <div class="mt-4 flex flex-row justify-start items-end gap-1">
                            <span class="text-xl font-black text-on-surface">30,000</span>
                            <span class="text-[10px] text-on-surface-variant mb-1">د.ع</span>
                        </div>
                    </div>
                    <div class="w-1/2 p-2 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-24 text-on-surface opacity-80" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                          <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                          <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                        </svg>
                    </div>
                </div>
                {#if selectedCar === 'sedan'}
                <div class="absolute top-4 left-4">
                    <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                </div>
                {/if}
            </button>
            {/if}
            
            {#if showSuv}
            <button on:click={() => selectedCar = 'suv'} class="relative w-full text-right overflow-hidden {selectedCar === 'suv' ? 'bg-surface-container-lowest ring-2 ring-primary shadow-lg' : 'bg-surface-container-low hover:bg-surface-container'} rounded-xl p-1 transition-all duration-300 active:scale-95">
                <div class="flex flex-row items-center gap-4 p-3 font-sans">
                    <div class="w-1/2 text-right">
                        <span class="inline-block bg-[#e3f2fd] text-[#1976d2] text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 border border-[#90caf9]">عائلية - مساحة للحقائب</span>
                        <h3 class="text-base font-bold text-on-surface">سيارة عائلية (SUV)</h3>
                        <div class="flex flex-row justify-start items-center gap-2 mt-1 text-on-surface-variant">
                            <span class="material-symbols-outlined text-xs">group</span>
                            <span class="text-[10px]">٥ - ٧ ركاب</span>
                            <span class="material-symbols-outlined text-xs">luggage</span>
                            <span class="text-[10px]">٦+ حقائب</span>
                        </div>
                        <div class="mt-4 flex flex-row justify-start items-end gap-1">
                            <span class="text-xl font-black text-on-surface">45,000</span>
                            <span class="text-[10px] text-on-surface-variant mb-1">د.ع</span>
                        </div>
                    </div>
                    <div class="w-1/2 p-2 relative bg-[#e3f2fd]/30 rounded-lg flex items-center justify-center overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-24 text-[#1976d2] z-10 drop-shadow-md" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                          <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                          <path d="M5 17h-2v-4l3 -5h8l3 5h3v4h-2m-4 0h-6m-6 -6h15" />
                          <path d="M9 8h4v3h-4z" />
                        </svg>
                    </div>
                </div>
                {#if selectedCar === 'suv'}
                <div class="absolute top-4 left-4">
                    <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                </div>
                {/if}
            </button>
            {/if}

            {#if showVan}
            <button on:click={() => selectedCar = 'van'} class="relative w-full text-right overflow-hidden {selectedCar === 'van' ? 'bg-surface-container-lowest ring-2 ring-primary shadow-lg' : 'bg-surface-container-low hover:bg-surface-container'} rounded-xl p-1 transition-all duration-300 active:scale-95 border-2 border-transparent">
                <div class="absolute inset-0 bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none"></div>
                <div class="flex flex-row items-center gap-4 p-3 relative z-10 font-sans">
                    <div class="w-1/2 text-right">
                        <div class="flex flex-row items-center gap-1 mb-2">
                            <span class="material-symbols-outlined text-orange-500 text-[14px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                            <span class="text-[10px] font-bold text-orange-600">شركة الأسفار للسيارات الكبيرة</span>
                        </div>
                        <h3 class="text-base font-bold text-on-surface">فان / باص صغير</h3>
                        <div class="flex flex-row justify-start items-center gap-2 mt-1 text-on-surface-variant">
                            <span class="material-symbols-outlined text-xs">groups</span>
                            <span class="text-[10px]">٧ ركاب فأكثر</span>
                            <span class="material-symbols-outlined text-xs">luggage</span>
                            <span class="text-[10px]">حمولة مفتوحة</span>
                        </div>
                        <div class="mt-4 flex flex-row justify-start items-end gap-1">
                            <span class="text-xl font-black text-on-surface">65,000</span>
                            <span class="text-[10px] text-on-surface-variant mb-1">د.ع</span>
                        </div>
                    </div>
                    <div class="w-1/2 p-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex flex-col items-center justify-center min-h-[100px]">
                        <span class="material-symbols-outlined text-orange-400 text-[64px] absolute pointer-events-none drop-shadow-sm">airport_shuttle</span>
                    </div>
                </div>
                {#if selectedCar === 'van'}
                <div class="absolute top-4 left-4 z-20">
                    <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                </div>
                {/if}
            </button>
            {/if}

            {#if showSpecial}
            <button on:click={() => selectedCar = 'special'} class="relative w-full text-right overflow-hidden {selectedCar === 'special' ? 'bg-surface-container-lowest ring-2 ring-primary shadow-lg' : 'bg-surface-container-low hover:bg-surface-container'} rounded-xl p-1 transition-all duration-300 active:scale-95 border-2 border-transparent">
                <div class="absolute inset-0 bg-gradient-to-l from-green-500/5 to-transparent pointer-events-none"></div>
                <div class="flex flex-row items-center gap-4 p-3 relative z-10 font-sans">
                    <div class="w-1/2 text-right">
                        <div class="flex flex-row items-center gap-1 mb-2">
                             <span class="material-symbols-outlined text-green-600 text-[14px]" style="font-variation-settings: 'FILL' 1;">volunteer_activism</span>
                             <span class="text-[10px] font-bold text-green-700">شركة العناية الخاصة</span>
                        </div>
                        <h3 class="text-base font-bold text-on-surface">مركبة مجهزة (همم)</h3>
                        <div class="flex flex-row justify-start items-center gap-2 mt-1 text-on-surface-variant">
                            <span class="material-symbols-outlined text-xs">accessible</span>
                            <span class="text-[10px]">مجهزة برافعة</span>
                            <span class="material-symbols-outlined text-xs">medical_services</span>
                            <span class="text-[10px]">مرافق مدرب</span>
                        </div>
                        <div class="mt-4 flex flex-row justify-start items-end gap-1">
                            <span class="text-xl font-black text-on-surface">35,000</span>
                            <span class="text-[10px] text-on-surface-variant mb-1">د.ع</span>
                        </div>
                    </div>
                    <div class="w-1/2 p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex flex-col items-center justify-center min-h-[100px]">
                        <span class="material-symbols-outlined text-green-400 text-[64px] absolute pointer-events-none drop-shadow-sm">accessible_forward</span>
                    </div>
                </div>
                {#if selectedCar === 'special'}
                <div class="absolute top-4 left-4 z-20">
                    <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                </div>
                {/if}
            </button>
            {/if}
        </div>
    </div>

    <div class="pt-6 w-full pb-2">
        <button on:click={handleContinue} class="w-full btn-premium py-5 text-lg">
            <span>متابعة للدفع</span>
            <span class="material-symbols-outlined text-xl">arrow_back</span>
        </button>
    </div>
</div>