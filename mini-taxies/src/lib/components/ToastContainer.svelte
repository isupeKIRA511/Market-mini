<script lang="ts">
    import { toast } from '../stores/toastStore';
    import { flip } from 'svelte/animate';
    import { fly } from 'svelte/transition';

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case 'success': return 'border-[#10B981]/25 bg-[#ECFDF5]/95 text-[#065F46]';
            case 'error': return 'border-error/25 bg-error-container/95 text-on-error-container';
            case 'warning': return 'border-[#F59E0B]/25 bg-[#FFFBEB]/95 text-[#78350F]';
            default: return 'border-primary/25 bg-surface/95 text-on-surface';
        }
    };

    const getAccentClass = (type: string) => {
        switch (type) {
            case 'success': return 'bg-[#10B981]';
            case 'error': return 'bg-error';
            case 'warning': return 'bg-[#F59E0B]';
            default: return 'bg-primary';
        }
    };
</script>

<div class="absolute top-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-[calc(100%-32px)] pointer-events-none">
    {#each $toast as t (t.id)}
        <div
            animate:flip={{ duration: 300 }}
            in:fly={{ y: -20, opacity: 0, duration: 300 }}
            out:fly={{ y: -20, opacity: 0, duration: 200 }}
            class="relative overflow-hidden flex items-center gap-3 p-3.5 rounded-[22px] border backdrop-blur-xl shadow-2xl pointer-events-auto {getColorClass(t.type)}"
        >
            <div class="absolute inset-x-0 top-0 h-1 {getAccentClass(t.type)}"></div>
            <span class="flex h-8 w-8 items-center justify-center rounded-2xl text-white shrink-0 {getAccentClass(t.type)}">
                <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">
                    {getIcon(t.type)}
                </span>
            </span>
            <p class="text-xs font-bold text-right flex-1 leading-relaxed">
                {t.message}
            </p>
            <button 
                on:click={() => toast.dismiss(t.id)}
                class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                aria-label="اغلاق"
            >
                <span class="material-symbols-outlined text-[16px] opacity-60">close</span>
            </button>
        </div>
    {/each}
</div>
