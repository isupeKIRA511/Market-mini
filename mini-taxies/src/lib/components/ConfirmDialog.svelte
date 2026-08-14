<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  export let open = false;
  export let title = 'تأكيد الإجراء';
  export let message = '';
  export let confirmLabel = 'تأكيد';
  export let cancelLabel = 'إلغاء';
  export let loading = false;
  export let variant: 'danger' | 'default' = 'default';

  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();

  $: isDanger = variant === 'danger';
</script>

{#if open}
  <div class="absolute inset-0 z-[10000] flex items-end justify-center" dir="rtl">
    <button
      type="button"
      class="absolute inset-0 h-full w-full cursor-default border-0 bg-black/55 backdrop-blur-sm"
      aria-label="إغلاق"
      disabled={loading}
      on:click={() => dispatch('cancel')}
      transition:fade={{ duration: 140 }}
    ></button>

    <section
      class="relative z-10 w-full rounded-t-[32px] border border-white/40 bg-surface p-6 shadow-2xl"
      transition:fly={{ y: 36, opacity: 0, duration: 220 }}
    >
      <div class="mx-auto mb-5 h-1.5 w-12 rounded-full bg-outline-variant/40"></div>
      <div class="flex items-start gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl {isDanger ? 'bg-red-100 text-red-700' : 'bg-primary/20 text-primary'}">
          <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">{isDanger ? 'delete' : 'task_alt'}</span>
        </div>
        <div class="min-w-0 flex-1 text-right">
          <h2 class="text-lg font-black text-on-surface">{title}</h2>
          <p class="mt-1 text-[12px] font-bold leading-relaxed text-on-surface-variant">{message}</p>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={loading}
          on:click={() => dispatch('cancel')}
          class="rounded-2xl border border-outline-variant/20 bg-surface-container-low py-3.5 text-sm font-black text-on-surface transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          on:click={() => dispatch('confirm')}
          class="rounded-2xl py-3.5 text-sm font-black transition-all active:scale-[0.98] disabled:opacity-60 {isDanger ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-primary text-on-primary shadow-lg shadow-primary/20'}"
        >
          {loading ? 'جاري التنفيذ…' : confirmLabel}
        </button>
      </div>
    </section>
  </div>
{/if}
