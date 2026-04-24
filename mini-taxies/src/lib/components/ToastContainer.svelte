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
            case 'success': return 'border-green-500/20 bg-green-500/10 text-green-500';
            case 'error': return 'border-red-500/20 bg-red-500/10 text-red-500';
            case 'warning': return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500';
            default: return 'border-primary/20 bg-primary/10 text-primary';
        }
    };
</script>

<div class="absolute top-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-[calc(100%-32px)] pointer-events-none">
    {#each $toast as t (t.id)}
        <div
            animate:flip={{ duration: 300 }}
            in:fly={{ y: -20, opacity: 0, duration: 300 }}
            out:fly={{ y: -20, opacity: 0, duration: 200 }}
            class="flex items-center gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl pointer-events-auto {getColorClass(t.type)}"
        >
            <span class="material-symbols-outlined text-[20px] shrink-0" style="font-variation-settings: 'FILL' 1;">
                {getIcon(t.type)}
            </span>
            <p class="text-xs font-bold text-right flex-1 leading-relaxed">
                {t.message}
            </p>
            <button 
                on:click={() => toast.dismiss(t.id)}
                class="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                aria-label="اغلاق"
            >
                <span class="material-symbols-outlined text-[16px] opacity-60">close</span>
            </button>
        </div>
    {/each}
</div>
