<script lang="ts">
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';
    import { userId, userData, logout, updateName } from '../lib/stores/authStore';
    import { currentRoute } from '../lib/stores/navigationStore';
    import { theme } from '../lib/stores/settingsStore';
    import { getCustomerSingle } from '../lib/api/marketplaceV1';

    let profileName = '';
    let profilePhone = '';

    async function loadProfile() {
        const id = get(userId);
        const snap = get(userData);
        if (!id) {
            profileName = snap?.name ?? '';
            profilePhone = '';
            return;
        }
        try {
            const res: any = await getCustomerSingle(id);
            const rec = res?.data || res;
            if (rec) {
                profileName = String(rec.fullName ?? rec.FullName ?? rec.name ?? snap?.name ?? 'مسافر');
                profilePhone = String(rec.phoneNumber ?? rec.PhoneNumber ?? snap?.name ?? '');
                // Sync the name to the store if it's different
                if (profileName && profileName !== snap?.name) {
                    updateName(profileName);
                }
            } else {
                profileName = snap?.name ?? 'مسافر';
                profilePhone = snap?.name ?? '';
            }
        } catch {
            profileName = snap?.name ?? 'مسافر';
            profilePhone = snap?.name ?? '';
        }
    }

    function handleLogout() {
        logout();
        currentRoute.set('login');
    }

    onMount(() => {
        loadProfile();
    });
</script>

<div class="space-y-6">
    <div class="bg-gradient-to-br from-primary-container to-[#fbca54] rounded-[32px] px-6 pb-6 pt-10 shadow-lg shadow-primary-container/20 relative flex flex-col justify-end h-48 text-right overflow-hidden mt-4">
       <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
       <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-[#1D1B1C]/5 rounded-full blur-xl"></div>
       
       <div class="flex flex-row-reverse justify-between items-center relative z-10">
           <div class="flex-1 items-center px-4" dir="rtl">
                <h3 class="text-2xl font-black text-[#1D1B1C] mb-1">{profileName || $userData?.name || 'مسافر'}</h3>
                <div class="flex flex-row-reverse items-center justify-start gap-1 opacity-70">
                    <span class="material-symbols-outlined text-[#1D1B1C] text-sm">call</span>
                    <p class="text-sm text-[#1D1B1C] font-bold ltr" dir="ltr">{profilePhone || $userData?.name || '—'}</p>
                </div>
           </div>
           
           <div class="w-[84px] h-[84px] bg-white rounded-full p-1.5 shadow-lg shrink-0">
               <div class="w-full h-full bg-surface-container-low rounded-full border-2 border-primary-container/20 flex items-center justify-center overflow-hidden relative">
                   <span class="material-symbols-outlined text-primary text-[40px]">person</span>
               </div>
           </div>
       </div>
    </div>

    <div class="bg-surface-container-lowest rounded-[32px] p-2 border border-outline-variant/10 shadow-[0_4px_24px_rgba(29,27,28,0.02)]">
        <!-- Dark Mode Setting -->
        <div class="p-4 flex flex-row-reverse justify-between items-center border-b border-outline-variant/10">
            <div class="flex flex-row-reverse items-center gap-3">
                <div class="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-on-surface-variant text-[20px]">dark_mode</span>
                </div>
                <span class="font-bold text-sm text-on-surface">الوضع الليلي</span>
            </div>
            
            <button 
                on:click={() => theme.update(t => t === 'dark' ? 'light' : 'dark')}
                class="w-12 h-6 rounded-full relative transition-colors {$theme === 'dark' ? 'bg-primary' : 'bg-surface-container-high border border-outline-variant/20'}"
            >
                <div class="w-4 h-4 bg-white rounded-full absolute top-1 transition-all {$theme === 'dark' ? 'left-1' : 'left-7'} shadow-sm"></div>
            </button>
        </div>

        <button class="w-full p-4 flex flex-row-reverse justify-between items-center active:bg-surface-container/50 transition-colors rounded-b-3xl">
            <div class="flex flex-row-reverse items-center gap-3 text-right">
                <div class="w-10 h-10 bg-[#e8f5e9] rounded-full flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[#2e7d32] text-[20px]" style="font-variation-settings: 'FILL' 1;">forum</span>
                </div>
                <div>
                    <h4 class="font-bold text-sm text-on-surface">خدمة العملاء</h4>
                    <p class="text-[10px] font-bold text-on-surface-variant" dir="ltr">+964 781 918 1818</p>
                </div>
            </div>
            <span class="material-symbols-outlined text-outline-variant rotate-180">chevron_left</span>
        </button>
    </div>

    <div class="pt-2">
        <button on:click={handleLogout} class="w-full bg-[#ffebee] text-[#c62828] h-14 rounded-2xl font-black text-sm flex items-center justify-center flex-row-reverse gap-3 transition-colors active:scale-95 shadow-sm">
            <span class="material-symbols-outlined text-[20px]">logout</span>
            <span>تسجيل الخروج</span>
        </button>
    </div>

    <div class="text-center pt-8 pb-4">
        <p class="text-on-surface-variant text-[10px] font-medium tracking-widest uppercase">v 4.4 - BUILD 210</p>
    </div>
</div>