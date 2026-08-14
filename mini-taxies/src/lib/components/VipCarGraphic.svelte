<script lang="ts">
  export let compact = false;
  export let dark = true;
</script>

<div class="relative {compact ? 'h-16 w-[96px]' : 'h-28 w-full'}" aria-hidden="true" dir="ltr">
  <svg
    class="absolute inset-0 h-full w-full drop-shadow-xl"
    viewBox="0 0 260 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M28 96C32 76 42 54 58 45C75 35 110 31 146 34C178 37 204 49 218 69L234 74C244 77 250 86 250 97V107C250 113 245 118 239 118H225C222 107 213 99 201 99C190 99 181 107 178 118H86C83 107 74 99 62 99C51 99 42 107 39 118H27C20 118 15 113 15 106V101C15 98 20 96 28 96Z"
      fill={dark ? '#171717' : '#FFFFFF'}
    />
    <path
      d="M58 48C75 39 109 36 143 38C174 40 196 50 209 68H47C50 60 54 53 58 48Z"
      fill={dark ? '#2A2829' : '#F8F2F3'}
    />
    <path
      d="M68 51C82 45 105 43 126 44V68H52C55 60 60 54 68 51Z"
      fill={dark ? '#F7D86B' : '#312B1B'}
      opacity="0.95"
    />
    <path
      d="M133 44C164 45 188 54 202 68H133V44Z"
      fill={dark ? '#7DD3FC' : '#3B82F6'}
      opacity="0.9"
    />
    <path d="M34 90H225" stroke="#FAC445" stroke-width="5" stroke-linecap="round" />
    <path
      d="M91 80H147"
      stroke={dark ? '#FFFFFF' : '#1D1B1C'}
      stroke-opacity="0.2"
      stroke-width="4"
      stroke-linecap="round"
    />
    <path
      d="M32 84H49"
      stroke="#FFFFFF"
      stroke-opacity="0.6"
      stroke-width="5"
      stroke-linecap="round"
    />
    <path d="M222 83H241" stroke="#F59E0B" stroke-width="5" stroke-linecap="round" />
    <circle cx="62" cy="118" r="18" fill={dark ? '#0A0A0A' : '#312B1B'} />
    <circle cx="62" cy="118" r="8" fill="#FAC445" />
    <circle cx="201" cy="118" r="18" fill={dark ? '#0A0A0A' : '#312B1B'} />
    <circle cx="201" cy="118" r="8" fill="#FAC445" />
    <path
      d="M104 53V68"
      stroke={dark ? '#171717' : '#FFFFFF'}
      stroke-opacity="0.35"
      stroke-width="3"
      stroke-linecap="round"
    />
    <path
      d="M163 53V68"
      stroke={dark ? '#171717' : '#FFFFFF'}
      stroke-opacity="0.35"
      stroke-width="3"
      stroke-linecap="round"
    />
    <rect x="111" y="78" width="38" height="14" rx="7" fill="#FAC445" />
    <text x="130" y="88" text-anchor="middle" fill="#1D1B1C" font-size="10" font-weight="900" font-family="Arial, sans-serif">VIP</text>
  </svg>
  <div class="absolute {compact ? 'right-0 top-0 h-6 w-6' : 'right-5 top-1 h-9 w-9'} rounded-full bg-primary/20 blur-md"></div>
</div>
