<script lang="ts">
    import { isUIVisible } from '../stores/navigationStore';
    import { searchQuery, carType, passengersFilter, luggageFilter, sortBy } from '../stores/filterStore';

    export let showFilterModal = false;
    export let showSortModal = false;

    $: isUIVisible.set(!showFilterModal && !showSortModal);

    function close() {
        showFilterModal = false;
        showSortModal = false;
    }

    const sortOptions = [
        { id: 'الأعلى تقييماً', icon: 'star', color: 'text-[#FAC445]', fill: 1 },
        { id: 'الأكثر تفاعلاً', icon: 'local_fire_department', color: 'text-secondary', fill: 1 },
        { id: 'ذوي الاحتياجات الخاصة (همم)', icon: 'accessible_forward', color: 'text-green-500', fill: 1 },
        { id: 'شركة السيارات الكبيرة', icon: 'directions_bus', color: 'text-blue-500', fill: 1 }
    ];
</script>

<div class="flex flex-col gap-4 mb-4">
    <div class="relative flex-grow">
        <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">search</span>
        <input bind:value={$searchQuery} class="w-full bg-surface-container-lowest border-none rounded-2xl py-4 pr-12 pl-4 text-on-surface shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-sans outline-none" placeholder="ابحث عن شركة أو موقع..." type="text">
    </div>
    <div class="flex gap-2">
        <button on:click={() => showFilterModal = true} class="bg-primary/10 text-primary border border-primary/20 flex-1 py-4 justify-center rounded-2xl flex items-center gap-2 font-bold transition-all hover:bg-primary/20 active:scale-95 text-sm { $carType !== 'الكل' || $passengersFilter || $luggageFilter ? 'ring-2 ring-primary' : ''}">
            <span class="material-symbols-outlined text-xl">tune</span>
            <span>تصفية</span>
        </button>
        <button on:click={() => showSortModal = true} class="bg-primary/10 text-primary border border-primary/20 flex-1 py-4 justify-center rounded-2xl flex items-center gap-2 font-bold transition-all hover:bg-primary/20 active:scale-95 text-sm { $sortBy !== 'الأعلى تقييماً' ? 'ring-2 ring-primary' : ''}">
            <span class="material-symbols-outlined text-xl">swap_vert</span>
            <span>ترتيب</span>
        </button>
    </div>
</div>

<!-- Filter Modal -->
{#if showFilterModal}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:p-4 transition-all pb-16" aria-hidden="true" tabindex="-1" on:click={close}>
    <div class="bg-surface-container-lowest w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 text-right relative animate-slide-up" on:click|stopPropagation>
        <button on:click={close} class="absolute top-6 left-6 w-8 h-8 flex items-center justify-center bg-surface-container rounded-full shrink-0 hover:bg-surface-container-high transition-colors">
            <span class="material-symbols-outlined text-sm">close</span>
        </button>
        <h2 class="text-xl font-bold mb-6 text-on-surface">خيارات التصفية</h2>
        
        <div class="space-y-6 mb-8 text-right">
            <div>
                <span class="block text-sm font-bold text-on-surface-variant mb-3">نوع السيارة</span>
                <div class="flex gap-2 flex-row flex-wrap">
                    {#each ['سيدان', 'عائلية (SUV)', 'همم', 'فان', 'الكل'] as type}
                        <button on:click={() => $carType = type} class="border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-colors {$carType === type ? 'bg-primary text-[#1D1B1C]' : 'bg-primary/10 text-primary hover:bg-primary hover:text-[#1D1B1C]'}">{type}</button>
                    {/each}
                </div>
            </div>
            <div>
                <span class="block text-sm font-bold text-on-surface-variant mb-3">عدد الركاب</span>
                <div class="flex gap-2 flex-row flex-wrap">
                    {#each ['1-4 ركاب', '5-7 ركاب', '+7 ركاب (جروب)', 'الكل'] as pass}
                        <button on:click={() => $passengersFilter = pass} class="border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-colors {$passengersFilter === pass || (pass === 'الكل' && !$passengersFilter) ? 'bg-primary text-[#1D1B1C]' : 'bg-primary/10 text-primary hover:bg-primary hover:text-[#1D1B1C]'}">{pass}</button>
                    {/each}
                </div>
            </div>
            <div>
                <span class="block text-sm font-bold text-on-surface-variant mb-3">سعة الحمولة</span>
                <div class="flex gap-2 flex-row flex-wrap">
                    {#each ['حقائب صغيرة (1-3)', 'متوسطة (4-5)', 'كبيرة جداً (+6)', 'الكل'] as lug}
                        <button on:click={() => $luggageFilter = lug} class="border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-colors {$luggageFilter === lug || (lug === 'الكل' && !$luggageFilter) ? 'bg-primary text-[#1D1B1C]' : 'bg-primary/10 text-primary hover:bg-primary hover:text-[#1D1B1C]'}">{lug}</button>
                    {/each}
                </div>
            </div>
        </div>
        
        <button on:click={close} class="w-full btn-premium py-4 font-bold text-sm">عرض النتائج</button>
    </div>
</div>
{/if}

<!-- Sort Modal -->
{#if showSortModal}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:p-4 transition-all pb-16" aria-hidden="true" tabindex="-1" on:click={close}>
    <div class="bg-surface-container-lowest w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 text-right relative animate-slide-up" on:click|stopPropagation>
        <button on:click={close} class="absolute top-6 left-6 w-8 h-8 flex items-center justify-center bg-surface-container rounded-full shrink-0 hover:bg-surface-container-high transition-colors">
            <span class="material-symbols-outlined text-sm">close</span>
        </button>
        <h2 class="text-xl font-bold mb-2 text-on-surface">ترتيب وعرض</h2>
        <p class="text-xs text-on-surface-variant mb-6 font-medium">خيارات الشركات والسيارات</p>

        <div class="space-y-3 mb-8 flex flex-col items-end">
            {#each sortOptions as sortOption}
            <button on:click={() => $sortBy = sortOption.id} class="w-full text-right px-4 py-4 rounded-xl font-bold text-sm transition-all flex justify-between items-center group {$sortBy === sortOption.id ? 'bg-primary-container text-on-primary-container ring-1 ring-primary' : 'bg-surface-container hover:bg-primary-container hover:text-on-primary-container'}">
               <span class="material-symbols-outlined text-primary {$sortBy === sortOption.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}">check</span>
               <span>{sortOption.id} <span class="material-symbols-outlined text-sm {sortOption.color} inline-block align-middle ml-1" style="font-variation-settings: 'FILL' {sortOption.fill};">{sortOption.icon}</span></span>
            </button>
            {/each}
        </div>
        
        <button on:click={close} class="w-full btn-premium py-4 font-bold text-sm">حفظ الترتيب</button>
    </div>
</div>
{/if}

<style>
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    :global(.animate-slide-up) {
        animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
</style>
