<script lang="ts">
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let title = '';
  export let message = '';

  const styles = {
    success: {
      shell: 'border-[#10B981]/25 bg-[#ECFDF5] text-[#064E3B]',
      icon: 'check_circle',
      iconWrap: 'bg-[#10B981] text-white',
    },
    error: {
      shell: 'border-error/25 bg-error-container/80 text-on-error-container',
      icon: 'error',
      iconWrap: 'bg-error text-on-error',
    },
    warning: {
      shell: 'border-[#F59E0B]/25 bg-[#FFFBEB] text-[#78350F]',
      icon: 'warning',
      iconWrap: 'bg-[#F59E0B] text-white',
    },
    info: {
      shell: 'border-primary/25 bg-primary/10 text-on-surface',
      icon: 'info',
      iconWrap: 'bg-primary text-on-primary',
    },
  };

  $: style = styles[type] ?? styles.info;
</script>

<div
  class="app-alert relative overflow-hidden rounded-[22px] border p-4 text-right shadow-sm {style.shell}"
  role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
  dir="rtl"
>
  <div class="absolute inset-x-0 top-0 h-1 bg-current opacity-20"></div>
  <div class="flex items-start gap-3">
    <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-sm {style.iconWrap}">
      <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">{style.icon}</span>
    </div>
    <div class="min-w-0 flex-1">
      {#if title}
        <p class="text-[12px] font-black leading-snug">{title}</p>
      {/if}
      <p class="text-[11px] font-bold leading-relaxed {title ? 'mt-1 opacity-80' : ''}">
        {message}
        <slot />
      </p>
    </div>
  </div>
</div>
